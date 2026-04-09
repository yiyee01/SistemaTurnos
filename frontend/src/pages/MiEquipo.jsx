// src/pages/MiEquipo.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { useEquipo } from '../hooks/useEquipo'
import { useAuth } from '../hooks/useAuth'
import { ModalConfirmarBaja } from '../components/jefe/ModalConfirmarBaja'
import { LogOut, UserRoundPen, UserRoundX, UserPlus, Search, Filter, X, ChevronLeft } from 'lucide-react'

export default function MiEquipo() {
  const navigate = useNavigate()
  const { session } = useAuth()
  const { enfermeros, hospitales, sectores, cargando, recargar, toggleBaja } = useEquipo(session?.user?.id);
  const [buscar, setBuscar] = useState('')
  const [filtroHospital, setFiltroHospital] = useState('')
  const [filtroSector, setFiltroSector] = useState('')
  const [mostrarBaja, setMostrarBaja] = useState(false)
  const [enfermeroaDarDeBaja, setEnfermeroaDarDeBaja] = useState(null)

  // Filtrado local
  const filtrados = enfermeros.filter(e => {
    const nombreCompleto = `${e.nombre} ${e.apellido}`.toLowerCase()
    const hospital = e.trabaja_en?.[0]?.hospitales?.nombre ?? ''
    const sector = e.trabaja_en?.[0]?.sectores?.nombre ?? ''
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
              <ChevronLeft size={16} />
              Volver
            </button>
            <button
              onClick={() => navigate('/jefe/equipo/nuevo')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                        text-marca-border 
                        bg-marca-muted
                        hover:text-marca-pale
                        hover:bg-marca-dark transition-colors"
            >
              <UserPlus size={16} />
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

            {/* Toggle "dados de baja" */}
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
              const hospital = e.trabaja_en?.[0]?.hospitales?.nombre ?? '—'
              const sector = e.trabaja_en?.[0]?.sectores?.nombre ?? '—'
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
                      <UserRoundPen />
                    </button>
                    <button
                      onClick={() => setEnfermeroaDarDeBaja(e)}
                      title={activo ? 'Dar de baja' : 'Reactivar'}
                      className="p-2 rounded-lg border border-marca-border2
                                 text-marca-muted hover:text-red-400
                                 hover:border-red-800 transition-all"
                    >
                      <UserRoundX />
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
                  const hospital = e.trabaja_en?.[0]?.hospitales?.nombre ?? '—'
                  const sector = e.trabaja_en?.[0]?.sectores?.nombre ?? '—'
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
                          <UserRoundPen />
                        </button>
                        <button
                          onClick={() => setEnfermeroaDarDeBaja(e)}
                          title={activo ? 'Dar de baja' : 'Reactivar'}
                          className="p-1.5 rounded-md border border-marca-border2
                                     text-marca-muted hover:text-red-400
                                     hover:border-red-800 transition-all"
                        >
                          <UserRoundX />
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
