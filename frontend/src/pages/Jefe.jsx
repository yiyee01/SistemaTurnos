import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { DragDropContext } from '@hello-pangea/dnd'
import { useAuth } from '../hooks/useAuth'
import { useEquipo } from '../hooks/useEquipo'
import { TablaTurnos } from '../components/jefe/TablaTurnos'
import { BancoFichas } from '../components/jefe/BancoFichas'
import { HeaderJefe } from '../components/jefe/HeaderJefe'
import { BottomSheet } from '../components/jefe/BottomSheet'
import { ModalGuardar } from '../components/jefe/ModalGuardar'
import { exportarPlanillaPDF } from '../utils/exportarPlanillaPDF'
import { Loader2 } from 'lucide-react'
import { PantallaCarga } from '../components/PantallaCarga'
import { useGuardar } from '../hooks/useGuardar'
import { supabase } from '../supabase/client'

const HORAS_TURNO = { TM: 8, TT: 8, TN: 8, FR: 0, LM: 0, LI: 0 }

// == REGLAS DE NEGOCIO ==
const MAX_NOCHES_CONSECUTIVAS = Number(import.meta.env.VITE_MAX_NOCHES_CONSECUTIVAS || 3);
const MIN_FRANCOS_SEMANA = Number(import.meta.env.VITE_MIN_FRANCOS_SEMANA || 1);

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

const MESES_NOMBRE = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

const COLORES_TURNO = {
  TM: { nombre: 'Mañana (06-14)',   color: 'bg-blue-200 text-blue-900 border-blue-400' },
  TT: { nombre: 'Tarde (14-22)',    color: 'bg-orange-200 text-orange-900 border-orange-400' },
  TN: { nombre: 'Noche (22-06)',    color: 'bg-purple-200 text-purple-900 border-purple-400' },
  FR: { nombre: 'Franco',           color: 'bg-gray-300 text-gray-700 border-gray-500' },
  LM: { nombre: 'Lic. Maternidad', color: 'bg-pink-200 text-pink-900 border-pink-400' },
  LI: { nombre: 'Licencia',        color: 'bg-yellow-200 text-yellow-900 border-yellow-400' },
}

export default function Jefe() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { session, cerrarSesion, nombre } = useAuth()

  const { enfermeros, hospitales, sectores, cargando } = useEquipo(session?.user?.id)
  const [lunesBase, setLunesBase] = useState(() => getLunes(new Date()))
  const semanaActual = generarSemana(lunesBase)
  const [turnosAsignados, setTurnosAsignados] = useState({})
  const [limiteHoras, setLimiteHoras] = useState(48)
  const [modalGuardar, setModalGuardar] = useState(null)
  const [exportando, setExportando] = useState(false)
  const { guardarBorrador, guardarPlanificacion } = useGuardar()

  const [filtroHospital, setFiltroHospital] = useState(() => searchParams.get('hospital') ?? '')
  const [filtroSector, setFiltroSector]   = useState(() => searchParams.get('sector')   ?? '')

  // true cuando se llega desde el Historial con URL params → carga desde turnos_asignados
  // false en navegación normal → carga solo desde borradores
  const [fromHistorial, setFromHistorial] = useState(() => {
    return Boolean(
      searchParams.get('mes') &&
      searchParams.get('anio') &&
      searchParams.get('hospital') &&
      searchParams.get('sector')
    )
  })


  const saludo = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 19) return 'Buenas tardes'
    return 'Buenas noches'
  })()

  // Mes/año que se está planificando (fuente de verdad para guardar y cargar)
  // Si viene de la URL (desde Historial → Editar), usamos esos valores
  const hoy = new Date()
  const [mesPlanificacion, setMesPlanificacion] = useState(() => {
    const m = searchParams.get('mes')
    return m !== null ? Number(m) : hoy.getMonth()
  })
  const [anioPlanificacion, setAnioPlanificacion] = useState(() => {
    const a = searchParams.get('anio')
    return a !== null ? Number(a) : hoy.getFullYear()
  })

  // Cuando el usuario cambia mes/año manualmente deja de ser "vista del historial"
  const irAMes = (mes, anio) => {
    setFromHistorial(false)
    setMesPlanificacion(mes)
    setAnioPlanificacion(anio)
    const primerDia = new Date(anio, mes, 1)
    setLunesBase(getLunes(primerDia))
  }

  // ── CARGAR DATOS (borrador o planilla publicada según el origen) ──
  useEffect(() => {
    async function cargar() {
      if (!filtroHospital || !filtroSector) {
        setTurnosAsignados({})
        return
      }

      if (fromHistorial) {
        // Origen: Historial → cargar desde turnos_asignados (planilla publicada)
        const primerDia = new Date(anioPlanificacion, mesPlanificacion, 1)
        const ultimoDia = new Date(anioPlanificacion, mesPlanificacion + 1, 0)
        const { data: publicados } = await supabase
          .from('turnos_asignados')
          .select('enfermero_id, fecha, tipos_turno(cod, descripcion)')
          .eq('hospital_id', Number(filtroHospital))
          .eq('sector_id',   Number(filtroSector))
          .gte('fecha', primerDia.toISOString().split('T')[0])
          .lte('fecha', ultimoDia.toISOString().split('T')[0])

        if (publicados?.length) {
          const reconstruido = {}
          for (const row of publicados) {
            const cod  = row.tipos_turno?.cod ?? ''
            const info = COLORES_TURNO[cod]
            if (!info) continue
            const celdaId = `${row.enfermero_id}|${row.fecha}`
            if (!reconstruido[celdaId]) reconstruido[celdaId] = []
            reconstruido[celdaId].push({
              id_unico: crypto.randomUUID(),
              tipo_id:  cod,
              nombre:   info.nombre,
              color:    info.color,
            })
          }
          setTurnosAsignados(reconstruido)
        } else {
          setTurnosAsignados({})
        }
      } else {
        // Origen: navegación normal → cargar solo el borrador
        const { data: borrador } = await supabase
          .from('borradores')
          .select('estado_json')
          .eq('id_hospital', filtroHospital)
          .eq('id_sector',   filtroSector)
          .eq('mes',         mesPlanificacion + 1)
          .eq('anio',        anioPlanificacion)
          .maybeSingle()

        setTurnosAsignados(borrador?.estado_json ?? {})
      }
    }

    cargar()
  }, [filtroHospital, filtroSector, mesPlanificacion, anioPlanificacion, fromHistorial])

  // Filtramos la lista de enfermeros a planificar según las selecciones
  const enfermerosAplanificar = enfermeros.filter(e => {
    return e.trabaja_en?.some(c => {
      const hId = c.hospitales?.id?.toString() ?? ''
      const sId = c.sectores?.id?.toString() ?? ''
      const matchHospital = filtroHospital === '' || hId === filtroHospital
      const matchSector = filtroSector === '' || sId === filtroSector
      return matchHospital && matchSector && c.activo === true
    })
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

    // 2. Franco es excluyente — no puede convivir con ningún otro turno
    if (turnoDestinoId === 'FR' && turnosHoy.length > 0) {
      return "El día de franco no puede combinarse con ningún otro turno."
    }
    if (turnoDestinoId !== 'FR' && turnosHoy.some(t => t.tipo_id === 'FR')) {
      return "Este día ya tiene un franco asignado. Eliminalo antes de agregar otro turno."
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
  const abrirModalBorrador = () => setModalGuardar('borrador')
  const abrirModalPlanificacion = () => setModalGuardar('planificacion')

  // ── Ejecutar el guardado real (llamado por el modal al confirmar) ──
  async function ejecutarGuardado() {
    const hospitalId = filtroHospital ? Number(filtroHospital) : 0
    const sectorId = filtroSector ? Number(filtroSector) : 0
    
    if (!hospitalId || !sectorId) {
      mostrarToast("Debe seleccionar un Hospital y un Sector antes de guardar.")
      return { ok: false }
    }

    // Usamos la fecha explícita del mes planificado, no lunesBase
    // (el día 15 evita cualquier desfase de zona horaria o semana partida)
    const fechaMes = new Date(anioPlanificacion, mesPlanificacion, 15)

    let resultado;
    if (modalGuardar === 'borrador') {
      resultado = await guardarBorrador(turnosAsignados, sectorId, fechaMes, hospitalId)
    } else if (modalGuardar === 'planificacion') {
      resultado = await guardarPlanificacion(turnosAsignados, sectorId, fechaMes, hospitalId)
    }

    if (resultado && !resultado.ok) {
      mostrarToast(resultado.error || "Error al guardar. Por favor, intentá nuevamente.")
    }

    return resultado;
  }


  async function handleExportarPDF() {
    setExportando(true)
    try {
      const diasDelMes = Array.from(
        { length: new Date(anioPlanificacion, mesPlanificacion + 1, 0).getDate() },
        (_, i) => {
          const fecha = new Date(anioPlanificacion, mesPlanificacion, i + 1)
          return {
            id: `${anioPlanificacion}-${String(mesPlanificacion+1).padStart(2, '0')}-${String(i+1).padStart(2, '0')}`,
            nombre: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][fecha.getDay()],
            numero: i + 1
          }
        }
      )

      exportarPlanillaPDF({
        enfermeros: enfermerosAplanificar,
        dias: diasDelMes,
        turnosAsignados,
        titulo: `Planilla Mensual - ${MESES_NOMBRE[mesPlanificacion]} ${anioPlanificacion}`,
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
          onGuardar={abrirModalBorrador}
          onPublicar={abrirModalPlanificacion}
          onCerrarSesion={cerrarSesion}
          onSemanaAnterior={() => cambiarSemana(-1)}
          onSemanaSiguiente={() => cambiarSemana(1)}
          onMiEquipo={() => navigate('/jefe/equipo')}
          onHistorial={() => navigate('/jefe/historial')}
        />

        {/* Barra de contexto: saludo + filtros */}
        <div className="mb-4 mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">

          {/* Izquierda — Saludo */}
          <div>
            <p className="text-xl font-semibold text-marca-pale leading-tight">
              {saludo}{nombre ? `, ${nombre}` : ''}
            </p>
            <p className="text-xs text-marca-muted mt-0.5">
              {MESES_NOMBRE[mesPlanificacion]} {anioPlanificacion}
            </p>
          </div>

          {/* Derecha — Filtros */}
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-widest text-marca-muted font-medium">
              Indicá dónde vas a planificar
            </p>
            <div className="flex flex-wrap gap-2">

              {/* Hospital */}
              <select
                value={filtroHospital}
                onChange={e => { setFromHistorial(false); setFiltroHospital(e.target.value) }}
                className="flex-1 min-w-[130px] px-3 py-2 rounded-xl text-sm font-medium bg-marca-surface
                           border border-marca-border2 text-marca-muted
                           outline-none cursor-pointer hover:border-marca-base transition-colors"
              >
                <option value="">Hospital</option>
                {hospitales.map(h => (
                  <option key={h.id} value={h.id}>{h.nombre}</option>
                ))}
              </select>

              {/* Sector */}
              <select
                value={filtroSector}
                onChange={e => { setFromHistorial(false); setFiltroSector(e.target.value) }}
                className="flex-1 min-w-[130px] px-3 py-2 rounded-xl text-sm font-medium bg-marca-surface
                           border border-marca-border2 text-marca-muted
                           outline-none cursor-pointer hover:border-marca-base transition-colors"
              >
                <option value="">Sector / Sala</option>
                {sectores.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>

              {/* Mes */}
              <select
                value={mesPlanificacion}
                onChange={e => irAMes(Number(e.target.value), anioPlanificacion)}
                className="flex-1 min-w-[110px] px-3 py-2 rounded-xl text-sm font-medium bg-marca-surface
                           border border-marca-border2 text-marca-muted
                           outline-none cursor-pointer hover:border-marca-base transition-colors"
              >
                {MESES_NOMBRE.map((m, i) => (
                  <option key={i} value={i}>{m}</option>
                ))}
              </select>

              {/* Año */}
              <select
                value={anioPlanificacion}
                onChange={e => irAMes(mesPlanificacion, Number(e.target.value))}
                className="w-[90px] px-3 py-2 rounded-xl text-sm font-medium bg-marca-surface
                           border border-marca-border2 text-marca-muted
                           outline-none cursor-pointer hover:border-marca-base transition-colors"
              >
                {[anioPlanificacion - 1, anioPlanificacion, anioPlanificacion + 1].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>

            </div>
          </div>
        </div>

      <BancoFichas />

        {cargando ? (
          <PantallaCarga mensaje="Cargando datos..." pantallaCompleta={false} />
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