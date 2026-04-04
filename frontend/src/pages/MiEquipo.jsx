// src/pages/MiEquipo.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { IconEdit } from '../components/icons/IconEdit'
import { IconDelete } from '../components/icons/IconDelete'
import { ModalConfirmarBaja } from '../components/jefe/ModalConfirmarBaja'

// ── Datos de prueba ─────────────────────────────────────
// Cambiar a false cuando la base de datos esté lista
const USE_FAKE_DATA = true

const FAKE_ENFERMEROS = [
  { id: '1', nombre: 'Valentina', apellido: 'Romero', dni: '38291045', matricula: 'MP-4821', especialidad: 'UCI', rol: 'jefe', estado: 'activo', trabaja_en: [{ hospital: { id: 'h1', nombre: 'Hospital Italiano' }, sector: { id: 's1', nombre: 'UCI' } }] },
  { id: '2', nombre: 'Martín', apellido: 'Álvarez', dni: '30124876', matricula: 'MP-3317', especialidad: 'Guardia', rol: 'enfermero', estado: 'activo', trabaja_en: [{ hospital: { id: 'h1', nombre: 'Hospital Italiano' }, sector: { id: 's2', nombre: 'Guardia' } }] },
  { id: '3', nombre: 'Luciana', apellido: 'Benitez', dni: '40563219', matricula: 'MP-5590', especialidad: 'Neonatología', rol: 'enfermero', estado: 'activo', trabaja_en: [{ hospital: { id: 'h2', nombre: 'Hospital Rivadavia' }, sector: { id: 's3', nombre: 'Neonatología' } }] },
  { id: '4', nombre: 'Santiago', apellido: 'Castro', dni: '27834510', matricula: 'MP-2203', especialidad: 'Guardia', rol: 'enfermero', estado: 'activo', trabaja_en: [{ hospital: { id: 'h1', nombre: 'Hospital Italiano' }, sector: { id: 's2', nombre: 'Guardia' } }] },
  { id: '5', nombre: 'Ana Laura', apellido: 'Giménez', dni: '35902187', matricula: 'MP-4109', especialidad: 'Clínica', rol: 'enfermero', estado: 'activo', trabaja_en: [{ hospital: { id: 'h2', nombre: 'Hospital Rivadavia' }, sector: { id: 's4', nombre: 'Clínica Médica' } }] },
  { id: '6', nombre: 'Diego', apellido: 'Herrera', dni: '29451632', matricula: 'MP-2876', especialidad: 'Cirugía', rol: 'enfermero', estado: 'activo', trabaja_en: [{ hospital: { id: 'h3', nombre: 'Hospital Alemán' }, sector: { id: 's5', nombre: 'Cirugía' } }] },
  { id: '7', nombre: 'Florencia', apellido: 'López', dni: '41872309', matricula: 'MP-6012', especialidad: 'UCI', rol: 'enfermero', estado: 'activo', trabaja_en: [{ hospital: { id: 'h1', nombre: 'Hospital Italiano' }, sector: { id: 's1', nombre: 'UCI' } }] },
  { id: '8', nombre: 'Rodrigo', apellido: 'Mansilla', dni: '33710824', matricula: 'MP-3744', especialidad: 'Guardia', rol: 'enfermero', estado: 'inactivo', trabaja_en: [{ hospital: { id: 'h3', nombre: 'Hospital Alemán' }, sector: { id: 's2', nombre: 'Guardia' } }] },
  { id: '9', nombre: 'Camila', apellido: 'Peralta', dni: '39204756', matricula: 'MP-5231', especialidad: 'Pediatría', rol: 'enfermero', estado: 'activo', trabaja_en: [{ hospital: { id: 'h2', nombre: 'Hospital Rivadavia' }, sector: { id: 's6', nombre: 'Pediatría' } }] },
  { id: '10', nombre: 'Ignacio', apellido: 'Ríos', dni: '26589341', matricula: null, especialidad: 'Clínica', rol: 'enfermero', estado: 'inactivo', trabaja_en: [{ hospital: { id: 'h1', nombre: 'Hospital Italiano' }, sector: { id: 's4', nombre: 'Clínica Médica' } }] },
]

const FAKE_HOSPITALES = [
  { id: 'h1', nombre: 'Hospital Italiano' },
  { id: 'h2', nombre: 'Hospital Rivadavia' },
  { id: 'h3', nombre: 'Hospital Alemán' },
]

const FAKE_SECTORES = [
  { id: 's1', nombre: 'UCI' },
  { id: 's2', nombre: 'Guardia' },
  { id: 's3', nombre: 'Neonatología' },
  { id: 's4', nombre: 'Clínica Médica' },
  { id: 's5', nombre: 'Cirugía' },
  { id: 's6', nombre: 'Pediatría' },
]

// ─────────────────────────────────────────────────────────

export default function MiEquipo() {
  const navigate = useNavigate()
  const [enfermeros, setEnfermeros] = useState([])
  const [cargando, setCargando] = useState(true)
  const [buscar, setBuscar] = useState('')
  const [filtroHospital, setFiltroHospital] = useState('')
  const [filtroSector, setFiltroSector] = useState('')
  const [mostrarBaja, setMostrarBaja] = useState(false)
  const [hospitales, setHospitales] = useState([])
  const [sectores, setSectores] = useState([])
  const [enfermeroaDarDeBaja, setEnfermeroaDarDeBaja] = useState(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    setCargando(true)

    if (USE_FAKE_DATA) {
      setEnfermeros(FAKE_ENFERMEROS)
      setHospitales(FAKE_HOSPITALES)
      setSectores(FAKE_SECTORES)
      setCargando(false)
      return
    }

    // TODO: filtrar por hospital del jefe logueado usando trabaja_en
    const { data, error } = await supabase
      .from('enfermeros')
      .select(`
        id, nombre, apellido, dni, matricula, especialidad, rol, estado,
        trabaja_en (
          hospital:hospitales ( id, nombre ),
          sector:sectores ( id, nombre )
        )
      `)
      .order('apellido')

    if (!error && data) setEnfermeros(data)

    const { data: hosp } = await supabase.from('hospitales').select('id, nombre')
    const { data: sect } = await supabase.from('sectores').select('id, nombre')
    if (hosp) setHospitales(hosp)
    if (sect) setSectores(sect)

    setCargando(false)
  }

  async function toggleBaja(enfermero) {
    const nuevoEstado = enfermero.estado === 'activo' ? 'inactivo' : 'activo'
    const { error } = await supabase
      .from('enfermeros')
      .update({ estado: nuevoEstado })
      .eq('id', enfermero.id)
    if (!error) cargarDatos()
  }

  // Filtrado local
  const filtrados = enfermeros.filter(e => {
    const nombreCompleto = `${e.nombre} ${e.apellido}`.toLowerCase()
    const hospital = e.trabaja_en?.[0]?.hospital?.nombre ?? ''
    const sector = e.trabaja_en?.[0]?.sector?.nombre ?? ''
    const activo = e.estado === 'activo'

    return (
      nombreCompleto.includes(buscar.toLowerCase()) &&
      (filtroHospital === '' || hospital === filtroHospital) &&
      (filtroSector === '' || sector === filtroSector) &&
      (mostrarBaja || activo)
    )
  })

  return (
    <div className="min-h-screen bg-marca-bg p-4 lg:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-start gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-medium text-marca-pale mb-1">Mi equipo</h1>
            <p className="text-sm text-marca-muted">Gestión de enfermeros</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/jefe')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                         border border-marca-border2 bg-marca-surface
                         text-marca-muted hover:text-marca-light hover:border-marca-base transition-colors"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="10,4 6,8 10,12" />
              </svg>
              Volver
            </button>
            <button
              onClick={() => navigate('/jefe/equipo/nuevo')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                         bg-marca-base border border-marca-mid text-marca-pale
                         hover:bg-marca-dark transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo enfermero
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col gap-2 mb-4">

          {/* Búsqueda — siempre ancho completo */}
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm
                       bg-marca-surface border border-marca-border2 text-marca-pale
                       placeholder:text-marca-muted2 outline-none focus:border-marca-mid
                       transition-colors"
          />

          {/* Hospital + Sector en 2 columnas, y toggle al lado en desktop */}
          <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center">
            <select
              value={filtroHospital}
              onChange={e => setFiltroHospital(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm bg-marca-surface
                         border border-marca-border2 text-marca-muted
                         outline-none cursor-pointer"
            >
              <option value="">Todos los hospitales</option>
              {hospitales.map(h => (
                <option key={h.id} value={h.nombre}>{h.nombre}</option>
              ))}
            </select>
            <select
              value={filtroSector}
              onChange={e => setFiltroSector(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm bg-marca-surface
                         border border-marca-border2 text-marca-muted
                         outline-none cursor-pointer"
            >
              <option value="">Todos los sectores</option>
              {sectores.map(s => (
                <option key={s.id} value={s.nombre}>{s.nombre}</option>
              ))}
            </select>

            {/* Toggle "dados de baja" — botón más táctil que un checkbox */}
            <button
              onClick={() => setMostrarBaja(v => !v)}
              className={`col-span-2 lg:col-span-1 flex items-center justify-center gap-2
                          px-3 py-2 rounded-lg text-xs font-medium border transition-colors
                          ${mostrarBaja
                  ? 'bg-marca-surface2 border-marca-mid text-marca-light'
                  : 'bg-marca-surface border-marca-border2 text-marca-muted'
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${mostrarBaja ? 'bg-marca-mid' : 'bg-marca-border2'}`} />
              Dados de baja
            </button>
          </div>
        </div>

        {/* ── MOBILE: tarjetas ── */}
        {cargando ? (
          <div className="py-10 text-center text-sm text-marca-muted lg:hidden">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="py-10 text-center text-sm text-marca-muted2 lg:hidden">
            No se encontraron enfermeros.
          </div>
        ) : (
          <div className="flex flex-col gap-2 lg:hidden">
            {filtrados.map(e => {
              const hospital = e.trabaja_en?.[0]?.hospital?.nombre ?? '—'
              const sector = e.trabaja_en?.[0]?.sector?.nombre ?? '—'
              const activo = e.estado === 'activo'
              return (
                <div
                  key={e.id}
                  className={`bg-marca-surface border border-marca-border rounded-xl px-4 py-3
                              flex items-center justify-between gap-3
                              ${!activo ? 'opacity-40' : ''}`}
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-marca-pale truncate">
                        {e.nombre} {e.apellido}
                      </p>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium
                                       ${e.rol === 'jefe'
                          ? 'bg-marca-dark text-marca-light border border-marca-base'
                          : 'bg-marca-surface2 text-marca-muted border border-marca-border2'
                        }`}>
                        {e.rol === 'jefe' ? 'Jefe' : 'Enfermero'}
                      </span>
                    </div>
                    <p className="text-xs text-marca-muted mt-0.5">
                      {hospital} · {sector}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/jefe/equipo/editar/${e.id}`)}
                      title="Editar"
                      className="p-2 rounded-lg border border-marca-border2
                                 text-marca-muted hover:text-marca-light
                                 hover:border-marca-base transition-all"
                    >
                      <IconEdit />
                    </button>
                    <button
                      onClick={() => setEnfermeroaDarDeBaja(e)}
                      title={activo ? 'Dar de baja' : 'Reactivar'}
                      className="p-2 rounded-lg border border-marca-border2
                                 text-marca-muted hover:text-red-400
                                 hover:border-red-800 transition-all"
                    >
                      <IconDelete />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── DESKTOP: tabla grid ── */}
        <div className="hidden lg:block bg-marca-surface border border-marca-border rounded-xl overflow-x-auto scrollbar-marca">
          <div className="min-w-[740px]">

            {/* Cabecera */}
            <div className="grid border-b border-marca-border px-4 py-2.5"
              style={{ gridTemplateColumns: '220px 100px 130px 100px 110px 1fr' }}>
              {['Enfermero', 'Matrícula', 'Hospital', 'Sector', 'Rol', ''].map((h, i) => (
                <div key={i} className="text-xs font-medium uppercase tracking-widest text-marca-muted">
                  {h}
                </div>
              ))}
            </div>

            {/* Filas */}
            {cargando ? (
              <div className="py-10 text-center text-sm text-marca-muted">Cargando...</div>
            ) : filtrados.length === 0 ? (
              <div className="py-10 text-center text-sm text-marca-muted2">
                No se encontraron enfermeros.
              </div>
            ) : (
              <div className="divide-y divide-marca-border">
                {filtrados.map(e => {
                  const hospital = e.trabaja_en?.[0]?.hospital?.nombre ?? '—'
                  const sector = e.trabaja_en?.[0]?.sector?.nombre ?? '—'
                  const activo = e.estado === 'activo'

                  return (
                    <div
                      key={e.id}
                      className={`grid px-4 py-3 items-center hover:bg-marca-surface2 transition-colors
                                  ${!activo ? 'opacity-40' : ''}`}
                      style={{ gridTemplateColumns: '220px 100px 130px 100px 110px 1fr' }}
                    >
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-marca-pale truncate">
                          {e.nombre} {e.apellido}
                        </p>
                        <p className="text-xs text-marca-muted mt-0.5">DNI {e.dni}</p>
                      </div>
                      <p className="text-xs text-marca-muted">{e.matricula ?? '—'}</p>
                      <p className="text-xs text-marca-muted">{hospital}</p>
                      <p className="text-xs text-marca-muted">{sector}</p>
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium
                                          ${e.rol === 'jefe'
                            ? 'bg-marca-dark text-marca-light border border-marca-base'
                            : 'bg-marca-surface2 text-marca-muted border border-marca-border2'
                          }`}>
                          {e.rol === 'jefe' ? 'Jefe' : 'Enfermero'}
                        </span>
                      </div>
                      <div className="flex gap-2 justify-end items-center">
                        <button
                          onClick={() => navigate(`/jefe/equipo/editar/${e.id}`)}
                          title="Editar"
                          className="p-1.5 rounded-md border border-marca-border2
                                     text-marca-muted hover:text-marca-light
                                     hover:border-marca-base transition-all"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => setEnfermeroaDarDeBaja(e)}
                          title={activo ? 'Dar de baja' : 'Reactivar'}
                          className="p-1.5 rounded-md border border-marca-border2
                                     text-marca-muted hover:text-red-400
                                     hover:border-red-800 transition-all"
                        >
                          <IconDelete />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal dar de baja */}
      <ModalConfirmarBaja
        enfermero={enfermeroaDarDeBaja}
        onConfirmar={() => {
          toggleBaja(enfermeroaDarDeBaja)
          setEnfermeroaDarDeBaja(null)
        }}
        onCancelar={() => setEnfermeroaDarDeBaja(null)}
      />

    </div>
  )
}
