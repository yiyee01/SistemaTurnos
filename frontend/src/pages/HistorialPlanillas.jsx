import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { useAuth } from '../hooks/useAuth'
import { useEquipo } from '../hooks/useEquipo'
import { ArrowLeft, ChevronLeft, ChevronRight, Edit, Lock, Check, Loader2, Download } from 'lucide-react'
import { PantallaCarga } from '../components/PantallaCarga'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

// ── Modal exportando ───────────────────────────────────────
function ModalExportando() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)' }}>
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
  )
}

// ── Tarjeta de mes ────────────────────────────────────────
function TarjetaMes({ mes, indice, anio, stats, esFuturo, esActual, onEditar, onExportarPDF }) {
  const publicada = stats !== null

  // Solo ocultamos meses sin planilla. Si fue publicado con anticipación, lo mostramos igual.
  if (!publicada) {
    return (
      <div className="relative rounded-xl border border-dashed border-marca-border
                     bg-marca-surface/40 p-5 flex flex-col gap-3 opacity-50 select-none">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-marca-muted">{mes}</span>
          {esFuturo && (
            <span className="text-[10px] text-marca-muted2 uppercase tracking-widest">Futuro</span>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-3">
          <Lock size={16} className="text-marca-border2" />
          <span className="text-xs text-marca-muted2">Sin planilla</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative rounded-xl border bg-marca-surface p-5 flex flex-col gap-3
                    transition-all duration-150 hover:bg-marca-surface2
                    ${esActual
        ? 'border-marca-mid shadow-[0_0_0_1px_rgba(99,102,241,0.3)]'
        : 'border-marca-border'
      }`}>
      {/* Línea de acento */}
      <div className={`absolute top-0 left-4 right-4 h-0.5 rounded-full
                       ${esActual ? 'bg-marca-mid' : 'bg-emerald-600'}`} />

      {/* Encabezado */}
      <div className="flex items-start justify-between gap-2 pt-1">
        <span className="text-sm font-semibold text-marca-pale">{mes}</span>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-medium uppercase tracking-widest
                           text-emerald-400 bg-emerald-950 border border-emerald-800
                           rounded-full px-2 py-0.5 leading-none flex items-center gap-1">
            <Check size={10} />
            Publicada
          </span>
          {esActual && (
            <span className="text-[10px] font-medium uppercase tracking-widest
                             text-marca-light bg-marca-dark border border-marca-mid
                             rounded-full px-2 py-0.5 leading-none">
              Actual
            </span>
          )}
        </div>
      </div>

      {/* Estadísticas reales */}
      <div className="flex-1">
        <p className="text-xs text-marca-muted">
          {stats.enfermeros} enfermeros · {stats.turnos} turnos
        </p>
      </div>

      {/* Acciones */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => onEditar(indice, anio)}
          className="flex-2 flex items-center justify-center gap-1.5
                     py-2 rounded-lg text-xs font-medium
                     border border-marca-border2 text-marca-muted
                     hover:text-marca-light hover:border-marca-base transition-colors"
        >
          <Edit size={13} />
          Editar borrador
        </button>
        <button
          onClick={() => onExportarPDF(indice, anio)}
          className="flex-1 flex items-center justify-center gap-1.5
                     py-2 rounded-lg text-xs font-medium
                     border border-marca-border2 text-marca-muted
                     hover:text-marca-light hover:border-marca-base transition-colors"
          title="Descargar PDF"
        >
          <Download size={13} />
          PDF
        </button>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────
export default function HistorialPlanillas() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { enfermeros, hospitales, sectores } = useEquipo(session?.user?.id)

  const hoy = new Date()
  const mesActual = hoy.getMonth()      // 0–11
  const anioActual = hoy.getFullYear()

  const [anio, setAnio] = useState(anioActual)
  const [filtroHospital, setFiltroHospital] = useState('')
  const [filtroSector, setFiltroSector] = useState('')

  // statsPorMes: { 1: { enfermeros: N, turnos: N }, 5: {...}, ... }
  // Solo contiene los meses que tienen al menos un turno publicado
  const [statsPorMes, setStatsPorMes] = useState({})
  const [cargando, setCargando] = useState(false)
  const [exportando, setExportando] = useState(false)

  // ── Cargar turnos publicados del año/hospital/sector ──
  useEffect(() => {
    async function cargar() {
      if (!filtroHospital || !filtroSector) {
        setStatsPorMes({})
        return
      }
      setCargando(true)

      const { data, error } = await supabase
        .from('historial_resumen')
        .select('mes, enfermeros, turnos')
        .eq('hospital_id', Number(filtroHospital))
        .eq('sector_id', Number(filtroSector))
        .eq('anio', anio)

      if (error) {
        console.error('[Historial] error Supabase:', error)
        setStatsPorMes({})
      } else if (data) {
        // La vista ya nos devuelve los datos agrupados por mes
        const stats = {}
        for (const row of data) {
          stats[row.mes] = { enfermeros: row.enfermeros, turnos: row.turnos }
        }
        setStatsPorMes(stats)
      }
      setCargando(false)
    }
    cargar()
  }, [filtroHospital, filtroSector, anio])

  // ── Editar: navega a /jefe precargando el contexto por URL ──
  // La seguridad real la aplica Supabase RLS en el backend
  function handleEditar(mesIndice, anio) {
    const params = new URLSearchParams({
      mes: mesIndice,           // 0-indexado como mesPlanificacion en Jefe.jsx
      anio,
      hospital: filtroHospital,
      sector: filtroSector,
    })
    navigate(`/jefe?${params.toString()}`)
  }

  // ── Exportar a PDF directamente desde Historial ──
  async function handleExportarPDF(mesIndice, anio) {
    setExportando(true)
    try {
      const primerDia = new Date(anio, mesIndice, 1)
      const ultimoDia = new Date(anio, mesIndice + 1, 0)

      const { data: publicados, error } = await supabase
        .from('turnos_asignados')
        .select('enfermero_id, fecha, tipos_turno(cod, descripcion)')
        .eq('hospital_id', Number(filtroHospital))
        .eq('sector_id', Number(filtroSector))
        .gte('fecha', primerDia.toISOString().split('T')[0])
        .lte('fecha', ultimoDia.toISOString().split('T')[0])

      if (error) throw error

      const turnosFormat = {}
      if (publicados?.length) {
        for (const row of publicados) {
          const cod = row.tipos_turno?.cod ?? ''
          if (!cod) continue
          const celdaId = `${row.enfermero_id}|${row.fecha}`
          if (!turnosFormat[celdaId]) turnosFormat[celdaId] = []
          turnosFormat[celdaId].push({ tipo_id: cod })
        }
      }

      const enfermerosFiltrados = enfermeros.filter(e => {
        return e.trabaja_en?.some(c => {
          const hId = c.hospitales?.id?.toString() ?? ''
          const sId = c.sectores?.id?.toString() ?? ''
          const matchH = filtroHospital === '' || hId === filtroHospital
          const matchS = filtroSector === '' || sId === filtroSector
          return matchH && matchS
        })
      })

      const diasDelMes = Array.from({ length: ultimoDia.getDate() }, (_, i) => {
        const fecha = new Date(anio, mesIndice, i + 1)
        return {
          id: `${anio}-${String(mesIndice + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
          nombre: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][fecha.getDay()],
          numero: i + 1
        }
      })

      const { exportarPlanillaPDF } = await import('../utils/exportarPlanillaPDF')
      await exportarPlanillaPDF({
        enfermeros: enfermerosFiltrados,
        dias: diasDelMes,
        turnosAsignados: turnosFormat,
        titulo: `Planilla Mensual - ${MESES[mesIndice]} ${anio}`
      })

    } catch (err) {
      console.error('[Exportar PDF]', err)
      alert("No se pudo generar el PDF de este mes.")
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="min-h-screen bg-marca-bg p-4 lg:p-8">
      {exportando && <ModalExportando />}
      <div className="max-w-4xl mx-auto">

        {/* Botón volver */}
        <button
          onClick={() => navigate('/jefe')}
          className="inline-flex items-center gap-2 text-sm text-marca-muted
                     bg-marca-surface border border-marca-border2 rounded-lg
                     px-3 py-1.5 mb-6 hover:text-marca-light
                     hover:border-marca-base transition-colors"
        >
          <ArrowLeft size={15} />
          Volver al editor
        </button>

        {/* Título */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-marca-pale mb-1">
            Historial de planillas
          </h1>
          <p className="text-sm text-marca-muted">
            Planillas publicadas · seleccioná hospital y sector para ver el historial
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-6">
          <select
            value={filtroHospital}
            onChange={e => setFiltroHospital(e.target.value)}
            className="flex-1 min-w-[150px] px-3 py-2 rounded-xl text-sm font-medium
                       bg-marca-surface border border-marca-border2 text-marca-muted
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
            className="flex-1 min-w-[150px] px-3 py-2 rounded-xl text-sm font-medium
                       bg-marca-surface border border-marca-border2 text-marca-muted
                       outline-none cursor-pointer hover:border-marca-base transition-colors"
          >
            <option value="">Sector / Sala</option>
            {sectores.map(s => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>

        {/* Selector de año */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setAnio(a => a - 1)}
            className="p-2 rounded-lg border border-marca-border2 text-marca-muted
                       hover:text-marca-light hover:border-marca-base transition-colors"
          >
            <ChevronLeft size={18} />
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
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Contenido */}
        {!filtroHospital || !filtroSector ? (
          <div className="py-16 text-center text-sm text-marca-muted2">
            Seleccioná un hospital y un sector para ver el historial.
          </div>
        ) : cargando ? (
          <PantallaCarga mensaje="Cargando historial..." pantallaCompleta={false} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {MESES.map((mes, i) => {
              const esFuturo = anio === anioActual ? i > mesActual : anio > anioActual
              const esActual = anio === anioActual && i === mesActual
              // i es 0-indexado → mes en BD es i+1 (1-indexado)
              const stats = statsPorMes[i + 1] ?? null

              return (
                <TarjetaMes
                  key={i}
                  mes={mes}
                  indice={i}
                  anio={anio}
                  stats={stats}
                  esFuturo={esFuturo}
                  esActual={esActual}
                  onEditar={handleEditar}
                  onExportarPDF={handleExportarPDF}
                />
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
