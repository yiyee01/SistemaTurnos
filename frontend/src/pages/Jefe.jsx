import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { DragDropContext } from '@hello-pangea/dnd'
import { useAuth } from '../hooks/useAuth'
import { useEquipo } from '../hooks/useEquipo' //uso la misma funcion que para equipo, si me traigo todo el equipo a cargo de un jefe
import { TablaTurnos } from '../components/jefe/TablaTurnos'
import { BancoFichas } from '../components/jefe/BancoFichas'
import { HeaderJefe } from '../components/jefe/HeaderJefe'
import { BottomSheet } from '../components/jefe/BottomSheet'
import { ModalGuardar } from '../components/jefe/ModalGuardar'
import { exportarPlanillaPDF } from '../utils/exportarPlanillaPDF'
import { Loader2 } from 'lucide-react'

const HORAS_TURNO = { TM: 8, TT: 8, TN: 8, FR: 0, LM: 0, LI: 0 }

// == REGLAS DE NEGOCIO (Modificables desde el archivo .env) ==
const MAX_NOCHES_CONSECUTIVAS = Number(import.meta.env.VITE_MAX_NOCHES_CONSECUTIVAS || 3);
const MIN_FRANCOS_SEMANA = Number(import.meta.env.VITE_MIN_FRANCOS_SEMANA || 1);
// =====================================================

// Obtiene el lunes de la semana de una fecha dada
const getLunes = (fecha) => {
  const d = new Date(fecha)
  const dia = d.getDay()
  d.setDate(d.getDate() - (dia === 0 ? 6 : dia - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

// Genera los 7 días a partir de un lunes
const generarSemana = (lunes) =>
  Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date(lunes)
    fecha.setDate(lunes.getDate() + i)
    return {
      id: fecha.toISOString().split('T')[0],
      nombre: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i],
      numero: fecha.getDate()
    }
  })

export default function Jefe() {
  const navigate = useNavigate()
  const { session, cerrarSesion } = useAuth()

  // Usamos useEquipo que ya carga todo: enfermeros, sus lugares de trabajo, hospitales y sectores
  const { enfermeros, hospitales, sectores, cargando } = useEquipo(session?.user?.id)

  const [lunesBase, setLunesBase] = useState(() => getLunes(new Date()))
  const semanaActual = generarSemana(lunesBase)
  const [turnosAsignados, setTurnosAsignados] = useState({})
  const [limiteHoras, setLimiteHoras] = useState(48)
  const [modalGuardar, setModalGuardar] = useState(null)
  const [exportando, setExportando] = useState(false)

  // TODO: Obtener el sectorId del jefe desde la tabla 'trabaja_en' o enfermeros al cargar
  const [sectorId, setSectorId] = useState(1)

  const [filtroHospital, setFiltroHospital] = useState('')
  const [filtroSector, setFiltroSector] = useState('')

  // Filtramos la lista de enfermeros a planificar según las selecciones
  const enfermerosAplanificar = enfermeros.filter(e => {
    const hId = e.trabaja_en?.[0]?.hospitales?.id?.toString() ?? ''
    const sId = e.trabaja_en?.[0]?.sectores?.id?.toString() ?? ''
    return (filtroHospital === '' || hId === filtroHospital) &&
      (filtroSector === '' || sId === filtroSector)
  })

  // Navegar entre semanas
  const cambiarSemana = (delta) => {
    setLunesBase(prev => {
      const nuevo = new Date(prev)
      nuevo.setDate(prev.getDate() + delta * 7)
      return nuevo
    })
  }

  // Toast System
  const [toast, setToast] = useState(null)
  const mostrarToast = (mensaje) => {
    setToast(mensaje)
    setTimeout(() => setToast(null), 3000)
  }

  // Estado del bottom sheet
  const [bottomSheet, setBottomSheet] = useState({
    abierto: false,
    celdaId: null,
    turnosActuales: []
  })

  // ── Regla: calcular horas semanales de un enfermero ──
  const calcularHoras = (enfermeroId) => {
    return semanaActual.reduce((total, dia) => {
      // Usamos | como separador para evitar problemas con UUIDs que tienen -
      const celdaId = `${enfermeroId}|${dia.id}`
      const turnos = turnosAsignados[celdaId] ?? []
      return total + turnos.reduce((h, t) => h + (HORAS_TURNO[t.tipo_id] ?? 0), 0)
    }, 0)
  }

  // ── Regla: celda bloqueada si el enfermero tiene turno de Licencia (LI/LM) ──
  const estaBloqueada = (enfermeroId, fechaId) => {
    const celdaId = `${enfermeroId}|${fechaId}`
    const turnos = turnosAsignados[celdaId] ?? []
    return turnos.some(t => t.tipo_id === 'LI' || t.tipo_id === 'LM')
  }

  // ── Regla: Validar asignación antes de soltar la ficha ──
  const validarAsignacion = (enfermeroId, fechaId, turnoDestinoId) => {
    const celdaId = `${enfermeroId}|${fechaId}`
    const turnosHoy = turnosAsignados[celdaId] ?? []

    // 1. Solapamiento estricto
    if (turnosHoy.some(t => t.tipo_id === turnoDestinoId)) {
      return "No puedes asignar exactamente el mismo turno el mismo día."
    }

    const idxDia = semanaActual.findIndex(d => d.id === fechaId)
    if (idxDia === -1) return null

    const turnosDelDia = (diaIndex) => {
      if (diaIndex < 0 || diaIndex >= 7) return []
      const dId = semanaActual[diaIndex].id
      return turnosAsignados[`${enfermeroId}|${dId}`] ?? []
    }

    // 2. Descanso mínimo de 12 horas (Noche -> Mañana al día siguiente)
    if (turnoDestinoId === 'TM' && turnosDelDia(idxDia - 1).some(t => t.tipo_id === 'TN')) {
      return "Descanso insuficiente: tiene turno Noche el día anterior (12h de descanso obligatorias)."
    }
    if (turnoDestinoId === 'TN' && turnosDelDia(idxDia + 1).some(t => t.tipo_id === 'TM')) {
      return "Descanso insuficiente: tiene turno Mañana al día siguiente (12h de descanso obligatorias)."
    }

    // 3. Tope de Noches (MAX_NOCHES_CONSECUTIVAS)
    if (turnoDestinoId === 'TN') {
      let consecutivas = 0;
      let maxConsecutivas = 0;
      for (let i = 0; i < 7; i++) {
        let tieneNoche = turnosDelDia(i).some(t => t.tipo_id === 'TN');
        if (i === idxDia) tieneNoche = true; // Simulamos la inserción

        if (tieneNoche) {
          consecutivas++;
          if (consecutivas > maxConsecutivas) maxConsecutivas = consecutivas;
        } else {
          consecutivas = 0;
        }
      }
      if (maxConsecutivas > MAX_NOCHES_CONSECUTIVAS) {
        return `Tope clínico excedido: No se permiten más de ${MAX_NOCHES_CONSECUTIVAS} guardias nocturnas continuas.`;
      }
    }

    return null; // OK
  }

  // ── Regla: Calcular si tiene el mínimo de francos ──
  const cumpleMinimoFrancos = (enfermeroId) => {
    const totalFrancos = semanaActual.reduce((total, dia) => {
      const celdaId = `${enfermeroId}|${dia.id}`
      const turnos = turnosAsignados[celdaId] ?? []
      return total + turnos.filter(t => t.tipo_id === 'FR').length
    }, 0)
    return totalFrancos >= MIN_FRANCOS_SEMANA
  }

  // ── Drag and drop (desktop) ──
  const alSoltarFicha = ({ destination, draggableId }) => {
    if (!destination || destination.droppableId === 'banco-fichas') return
    const celdaId = destination.droppableId
    const [enfermeroId, fechaId] = celdaId.split('|')
    if (estaBloqueada(enfermeroId, fechaId)) return

    const tiposTurno = [
      { id: 'TM', nombre: 'Mañana (06-14)', color: 'bg-blue-200 text-blue-900 border-blue-400' },
      { id: 'TT', nombre: 'Tarde (14-22)', color: 'bg-orange-200 text-orange-900 border-orange-400' },
      { id: 'TN', nombre: 'Noche (22-06)', color: 'bg-purple-200 text-purple-900 border-purple-400' },
      { id: 'FR', nombre: 'Franco', color: 'bg-gray-300 text-gray-700 border-gray-500' },
      { id: 'LM', nombre: 'Lic. Maternidad', color: 'bg-pink-200 text-pink-900 border-pink-400' },
      { id: 'LI', nombre: 'Licencia', color: 'bg-yellow-200 text-yellow-900 border-yellow-400' },
    ]

    const infoTurno = tiposTurno.find(t => t.id === draggableId)
    if (!infoTurno) return

    const errorReglas = validarAsignacion(enfermeroId, fechaId, infoTurno.id)
    if (errorReglas) {
      mostrarToast(errorReglas)
      return
    }

    setTurnosAsignados(prev => ({
      ...prev,
      [celdaId]: [...(prev[celdaId] ?? []), {
        id_unico: crypto.randomUUID(),
        tipo_id: infoTurno.id,
        nombre: infoTurno.nombre,
        color: infoTurno.color,
      }]
    }))
  }

  // ── Eliminar turno ──
  const eliminarTurno = (celdaId, idUnico) => {
    setTurnosAsignados(prev => ({
      ...prev,
      [celdaId]: (prev[celdaId] ?? []).filter(t => t.id_unico !== idUnico)
    }))
  }

  // ── Bottom sheet (móvil) ──
  const abrirBottomSheet = (celdaId, turnosActuales) => {
    setBottomSheet({ abierto: true, celdaId, turnosActuales })
  }

  const asignarDesdeMobile = (celdaId, opcion) => {
    const [enfermeroId, fechaId] = celdaId.split('|')
    if (estaBloqueada(enfermeroId, fechaId)) return

    const errorReglas = validarAsignacion(enfermeroId, fechaId, opcion.id)
    if (errorReglas) {
      mostrarToast(errorReglas)
      return
    }

    setTurnosAsignados(prev => ({
      ...prev,
      [celdaId]: [...(prev[celdaId] ?? []), {
        id_unico: crypto.randomUUID(),
        tipo_id: opcion.id,
        nombre: opcion.nombre,
        color: opcion.color,
      }]
    }))
  }

  // ── Abrir modales ──
  const guardarBorrador = () => setModalGuardar('borrador')
  const publicarSemana = () => setModalGuardar('planificacion')

  // ── Ejecutar el guardado real (llamado por el modal al confirmar) ──
  async function ejecutarGuardado() {
    // 1. Preparamos el payload exacto para la Edge Function
    const estado_json = {
      turnos: turnosAsignados,
      limiteHoras
    }

    const payload = {
      mes: lunesBase.getMonth() + 1, // o el mes que corresponda según lógica
      anio: lunesBase.getFullYear(),
      modo: modalGuardar, // 'borrador' | 'planificacion'
      id_sector: sectorId,
      estado_json,
    }

    // TODO: reemplazar por: await supabase.functions.invoke('guardar-planificacion', { body: payload })
    console.log('Enviando a Edge Function:', payload)
    return { ok: true }
  }

  async function handleExportarPDF() {
    setExportando(true)
    try {
      exportarPlanillaPDF({
        enfermeros,
        semana: semanaActual,
        turnosAsignados,
        limiteHoras,
      })
    } finally {
      setExportando(false)
    }
  }

  return (
    <DragDropContext onDragEnd={alSoltarFicha}>
      <div className="min-h-screen bg-marca-bg p-4 pt-[105px] lg:p-8 lg:pt-[72px]">

        <HeaderJefe
          semana={semanaActual}
          limiteHoras={limiteHoras}
          onCambiarLimite={setLimiteHoras}
          onGuardar={guardarBorrador}
          onPublicar={publicarSemana}
          onCerrarSesion={cerrarSesion}
          onSemanaAnterior={() => cambiarSemana(-1)}
          onSemanaSiguiente={() => cambiarSemana(1)}
          onMiEquipo={() => navigate('/jefe/equipo')}
          onHistorial={() => navigate('/jefe/historial')}
        />

        {/* Filtros de Planificación */}
        <div className="flex gap-2 lg:gap-4 mb-4 mt-2">
          <select
            value={filtroHospital}
            onChange={e => setFiltroHospital(e.target.value)}
            className="w-full lg:w-48 px-3 py-2.5 rounded-xl text-sm font-medium bg-marca-surface
                         border border-marca-border2 text-marca-muted
                         outline-none cursor-pointer hover:border-marca-base transition-colors"
          >
            <option value="">Hospital</option>
            {hospitales.map(h => (
              <option key={h.id} value={h.id}>{h.nombre}</option>
            ))}
          </select>

          <select
            value={filtroSector}
            onChange={e => setFiltroSector(e.target.value)}
            className="w-full lg:w-48 px-3 py-2.5 rounded-xl text-sm font-medium bg-marca-surface
                         border border-marca-border2 text-marca-muted
                         outline-none cursor-pointer hover:border-marca-base transition-colors"
          >
            <option value="">Sector / Sala</option>
            {sectores.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>

        <BancoFichas />

        {cargando ? (
          <div className="py-10 text-center text-sm text-marca-muted">Cargando base de datos...</div>
        ) : (
          <TablaTurnos
            enfermeros={enfermerosAplanificar}
            diasSemana={semanaActual}
            turnosAsignados={turnosAsignados}
            limiteHoras={limiteHoras}
            calcularHoras={calcularHoras}
            estaBloqueada={estaBloqueada}
            cumpleMinimoFrancos={cumpleMinimoFrancos}
            onEliminarTurno={eliminarTurno}
            onAbrirBottomSheet={abrirBottomSheet}
          />
        )}

        <BottomSheet
          celdaId={bottomSheet.celdaId}
          turnosActuales={bottomSheet.turnosActuales}
          onAsignar={asignarDesdeMobile}
          onEliminar={eliminarTurno}
          onCerrar={() => setBottomSheet({ abierto: false, celdaId: null, turnosActuales: [] })}
        />

        <ModalGuardar
          modo={modalGuardar}
          abierto={Boolean(modalGuardar)}
          onConfirmar={ejecutarGuardado}
          onCancelar={() => setModalGuardar(null)}
          onCerrar={() => setModalGuardar(null)}
          onExportarPDF={handleExportarPDF}
        />

        {exportando && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.65)' }}
          >
            <div className="w-full max-w-xs bg-marca-surface border border-marca-border
                            rounded-2xl p-6 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center
                              bg-emerald-950 border border-emerald-700 text-emerald-400">
                <Loader2 className="animate-spin" size={26} />
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-marca-pale">Exportando…</p>
                <p className="text-sm text-marca-muted mt-1">Generando el archivo PDF</p>
              </div>
            </div>
          </div>
        )}

        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm
                         bg-red-950/95 backdrop-blur-md border border-red-800 text-red-100
                         px-4 py-3.5 rounded-2xl shadow-2xl text-sm font-medium
                         flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-red-900 border border-red-700 flex items-center justify-center shrink-0">!</div>
              <p className="flex-1 leading-snug">{toast}</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </DragDropContext>
  )
}