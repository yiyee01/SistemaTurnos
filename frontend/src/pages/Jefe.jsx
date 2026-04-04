// src/pages/Jefe.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DragDropContext } from '@hello-pangea/dnd'
import { useAuth } from '../hooks/useAuth'
import { TablaTurnos } from '../components/jefe/TablaTurnos'
import { BancoFichas } from '../components/jefe/BancoFichas'
import { HeaderJefe } from '../components/jefe/HeaderJefe'
import { BottomSheet } from '../components/jefe/BottomSheet'
import { ModalGuardar } from '../components/jefe/ModalGuardar'
import { exportarPlanillaPDF } from '../utils/exportarPlanillaPDF'

const HORAS_TURNO = { TM: 8, TT: 8, TN: 8, FR: 0, LM: 0, LI: 0 }

const enfermerosFake = [
  { id: 'e1', nombre: 'Juan Pérez' },
  { id: 'e2', nombre: 'Ana Gómez' },
  { id: 'e3', nombre: 'Carlos López' },
]

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
  const { cerrarSesion } = useAuth()
  const [enfermeros] = useState(enfermerosFake)
  const [lunesBase, setLunesBase] = useState(() => getLunes(new Date()))
  const semanaActual = generarSemana(lunesBase)
  const [turnosAsignados, setTurnosAsignados] = useState({})
  const [limiteHoras, setLimiteHoras] = useState(48)
  const [modalGuardar, setModalGuardar] = useState(null)
  const [exportando, setExportando] = useState(false)
  
  // TODO: Obtener el sectorId del jefe desde la tabla 'trabaja_en' al cargar
  const [sectorId, setSectorId] = useState(1)

  // Navegar entre semanas
  const cambiarSemana = (delta) => {
    setLunesBase(prev => {
      const nuevo = new Date(prev)
      nuevo.setDate(prev.getDate() + delta * 7)
      return nuevo
    })
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
  const publicarSemana  = () => setModalGuardar('planificacion')

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

        <BancoFichas />

        <TablaTurnos
          enfermeros={enfermeros}
          diasSemana={semanaActual}
          turnosAsignados={turnosAsignados}
          limiteHoras={limiteHoras}
          calcularHoras={calcularHoras}
          estaBloqueada={estaBloqueada}
          onEliminarTurno={eliminarTurno}
          onAbrirBottomSheet={abrirBottomSheet}
        />

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
                <svg className="animate-spin" width="26" height="26" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                    strokeOpacity="0.25" />
                  <path d="M12 2v4" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-base font-medium text-marca-pale">Exportando…</p>
                <p className="text-sm text-marca-muted mt-1">Generando el archivo PDF</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </DragDropContext>
  )
}