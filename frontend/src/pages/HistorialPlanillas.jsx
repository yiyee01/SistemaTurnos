import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { exportarPlanillaPDF } from '../utils/exportarPlanillaPDF'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

// ── Íconos ────────────────────────────────────────────────

const SVG_BACK = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)
const SVG_CHEVRON_L = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const SVG_CHEVRON_R = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)
const SVG_EDIT = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const SVG_PDF = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
)
const SVG_LOCK = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const SVG_CHECK = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

// ── Modal exportando ──────────────────────────────────────

function ModalExportando() {
  return (
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
  )
}

// ── Datos de prueba ───────────────────────────────────────
// Reemplazar con consulta a Supabase
const FAKE_PLANILLAS = {
  2026: {
    0: { enfermeros: 6, turnos: 31 },  // Enero
    1: { enfermeros: 6, turnos: 28 },  // Febrero
    2: { enfermeros: 7, turnos: 31 },  // Marzo
    3: { enfermeros: 6, turnos: 30 },  // Abril (mes actual)
  },
  2025: {
    0: { enfermeros: 5, turnos: 31 },
    1: { enfermeros: 5, turnos: 28 },
    2: { enfermeros: 6, turnos: 31 },
    3: { enfermeros: 6, turnos: 30 },
    4: { enfermeros: 6, turnos: 31 },
    5: { enfermeros: 7, turnos: 30 },
    6: { enfermeros: 7, turnos: 31 },
    7: { enfermeros: 6, turnos: 31 },
    8: { enfermeros: 6, turnos: 30 },
    9: { enfermeros: 5, turnos: 31 },
    10: { enfermeros: 5, turnos: 30 },
    11: { enfermeros: 6, turnos: 31 },
  },
}

// ── Componente tarjeta de mes ─────────────────────────────

function TarjetaMes({ mes, indice, anio, planilla, esFuturo, esActual, onEditar, onExportar }) {
  const publicada = Boolean(planilla)

  if (esFuturo || !publicada) {
    // Mes futuro o sin planilla publicada
    return (
      <div
        className="relative rounded-xl border border-dashed border-marca-border
                   bg-marca-surface/40 p-5 flex flex-col gap-3
                   opacity-50 select-none"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-marca-muted">{mes}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-3">
          <span className="text-marca-border2">{SVG_LOCK}</span>
          <span className="text-xs text-marca-muted2">Sin planilla</span>
        </div>
      </div>
    )
  }

  // Mes publicado (pasado o actual)
  return (
    <div
      className={`relative rounded-xl border bg-marca-surface p-5 flex flex-col gap-3
                  transition-all duration-150 hover:bg-marca-surface2
                  ${esActual
          ? 'border-marca-mid shadow-[0_0_0_1px_rgba(99,102,241,0.3)] shadow-indigo-500/20'
          : 'border-marca-border'
        }`}
    >
      {/* Línea de acento superior */}
      <div className={`absolute top-0 left-4 right-4 h-0.5 rounded-full
                       ${esActual ? 'bg-marca-mid' : 'bg-emerald-600'}`} />

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-2 pt-1">
        <span className="text-sm font-semibold text-marca-pale">{mes}</span>
        <div className="flex flex-col items-end gap-1">
          {esActual && (
            <span className="text-[10px] font-medium uppercase tracking-widest
                             text-marca-light bg-marca-dark border border-marca-mid
                             rounded-full px-2 py-0.5 leading-none">
              Actual
            </span>
          )}
          <span className="text-[10px] font-medium uppercase tracking-widest
                           text-emerald-400 bg-emerald-950 border border-emerald-800
                           rounded-full px-2 py-0.5 leading-none flex items-center gap-1">
            <span className="text-emerald-400">{SVG_CHECK}</span>
            Publicada
          </span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="flex-1">
        <p className="text-xs text-marca-muted">
          {planilla.enfermeros} enfermeros · {planilla.turnos} turnos
        </p>
      </div>

      {/* Acciones */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onEditar(anio, indice)}
          className="flex-1 flex items-center justify-center gap-1.5
                     py-2 rounded-lg text-xs font-medium
                     border border-marca-border2 text-marca-muted
                     hover:text-marca-light hover:border-marca-base transition-colors"
        >
          {SVG_EDIT}
          Editar
        </button>
        <button
          onClick={() => onExportar(anio, indice)}
          className="flex-1 flex items-center justify-center gap-1.5
                     py-2 rounded-lg text-xs font-medium
                     bg-emerald-950 border border-emerald-800 text-emerald-400
                     hover:bg-emerald-900 transition-colors"
        >
          {SVG_PDF}
          PDF
        </button>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────

export default function HistorialPlanillas() {
  const navigate = useNavigate()
  const hoy = new Date()
  const mesActual = hoy.getMonth()   // 0-11
  const anioActual = hoy.getFullYear()

  const [anio, setAnio] = useState(anioActual)
  const [exportando, setExportando] = useState(false)

  const planillasAnio = FAKE_PLANILLAS[anio] ?? {}

  function handleEditar(anio, mes) {
    // TODO: navegar al editor cargando la planilla del mes/año
    navigate('/jefe')
  }

  async function handleExportar(anio, mes) {
    setExportando(true)
    try {
      // TODO: reemplazar con fetch real de Supabase para obtener los turnos del mes
      // const { data } = await supabase
      //   .from('planillas')
      //   .select('enfermeros, semana, turnos_asignados')
      //   .eq('anio', anio).eq('mes', mes).single()
      // exportarPlanillaPDF({ enfermeros: data.enfermeros, semana: data.semana, turnosAsignados: data.turnos_asignados })

      // Por ahora genera un PDF de demo con los datos disponibles
      const primerDia = new Date(anio, mes, 1)
      const semanaDemo = Array.from({ length: 7 }, (_, i) => {
        const fecha = new Date(primerDia)
        fecha.setDate(1 + i)
        return {
          id: fecha.toISOString().split('T')[0],
          nombre: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i],
          numero: fecha.getDate(),
        }
      })

      exportarPlanillaPDF({
        enfermeros: [],           // reemplazar con datos reales
        semana: semanaDemo,
        turnosAsignados: {},      // reemplazar con datos reales
        titulo: `Planilla ${MESES[mes]} ${anio}`,
      })
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="min-h-screen bg-marca-bg p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Botón volver */}
        <button
          onClick={() => navigate('/jefe')}
          className="inline-flex items-center gap-2 text-sm text-marca-muted
                     bg-marca-surface border border-marca-border2 rounded-lg
                     px-3 py-1.5 mb-6 hover:text-marca-light
                     hover:border-marca-base transition-colors"
        >
          {SVG_BACK}
          Volver al editor
        </button>

        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-marca-pale mb-1">
            Historial de planillas
          </h1>
          <p className="text-sm text-marca-muted">
            Planillas publicadas — solo lectura para meses futuros
          </p>
        </div>

        {/* Selector de año */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setAnio(a => a - 1)}
            className="p-2 rounded-lg border border-marca-border2 text-marca-muted
                       hover:text-marca-light hover:border-marca-base transition-colors"
          >
            {SVG_CHEVRON_L}
          </button>
          <span className="text-xl font-semibold text-marca-pale w-16 text-center tabular-nums">
            {anio}
          </span>
          <button
            onClick={() => setAnio(a => a + 1)}
            disabled={anio >= anioActual}
            className="p-2 rounded-lg border border-marca-border2 text-marca-muted
                       hover:text-marca-light hover:border-marca-base transition-colors
                       disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {SVG_CHEVRON_R}
          </button>
        </div>

        {/* Grilla de 12 meses */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {MESES.map((mes, i) => {
            const esFuturo = anio === anioActual
              ? i > mesActual
              : anio > anioActual

            const esActual = anio === anioActual && i === mesActual

            return (
              <TarjetaMes
                key={i}
                mes={mes}
                indice={i}
                anio={anio}
                planilla={planillasAnio[i] ?? null}
                esFuturo={esFuturo}
                esActual={esActual}
                onEditar={handleEditar}
                onExportar={handleExportar}
              />
            )
          })}
        </div>

      </div>

      {exportando && <ModalExportando />}

    </div>
  )
}
