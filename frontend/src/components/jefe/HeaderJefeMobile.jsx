// src/components/jefe/HeaderJefeMobile.jsx
import { useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { Sun, Moon, Menu, ChevronRight, ChevronLeft, CalendarClock, UsersRound, LogOut, Save, Upload, Archive, X, SaveAll } from 'lucide-react'

// ── Helpers ──────────────────────────────────────────────
const formatDia = (id) => {
    const d = new Date(id + 'T12:00:00')
    return `${d.getDate()} ${d.toLocaleString('es-AR', { month: 'short' })}`
}

// ── Sub-componentes internos ──────────────────────────────

function TopBar({ onAbrirDrawer, toggleTema, dark }) {
    return (
        <div className="fixed top-0 left-0 right-0 z-40 lg:hidden
                        h-14 flex items-center px-4 gap-3
                        bg-marca-surface border-b border-marca-border">
            <button
                id="btn-menu-lateral"
                onClick={onAbrirDrawer}
                className="w-9 h-9 flex items-center justify-center rounded-lg
                           text-marca-muted hover:text-marca-light transition-colors"
            >
                <Menu size={16} />
            </button>

            <span className="flex-1 text-center text-sm font-semibold text-marca-pale tracking-wide">
                Planificación semanal
            </span>

            <button
                onClick={toggleTema}
                className="w-9 h-9 flex items-center justify-center rounded-lg
                           text-marca-muted hover:text-marca-light transition-colors"
            >
                {dark ? <Sun /> : <Moon />}
            </button>
        </div>
    )
}

function WeekNav({ etiquetaRango, onAnterior, onSiguiente }) {
    return (
        <div className="fixed top-14 left-0 right-0 z-40 lg:hidden
                        h-11 flex items-center justify-between px-3
                        bg-marca-bg border-b border-marca-border">
            <button
                id="btn-semana-anterior"
                onClick={onAnterior}
                className="w-8 h-8 flex items-center justify-center rounded-lg
                           text-marca-muted hover:text-marca-light hover:bg-marca-surface transition-colors"
            >
                <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-medium text-marca-muted tracking-wide">
                Semana del {etiquetaRango}
            </span>

            <button
                id="btn-semana-siguiente"
                onClick={onSiguiente}
                className="w-8 h-8 flex items-center justify-center rounded-lg
                           text-marca-muted hover:text-marca-light hover:bg-marca-surface transition-colors"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    )
}

function SideDrawer({ onGuardar, onPublicar, onCerrarSesion, onMiEquipo, onHistorial, onCerrar, limiteHoras, onCambiarLimite }) {
    const [guardarExpandido, setGuardarExpandido] = useState(false)

    const cerrar = () => {
        setGuardarExpandido(false)
        onCerrar()
    }

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-50 bg-black/60 lg:hidden"
                onClick={cerrar}
            />

            {/* Panel */}
            <div className="fixed top-0 left-0 bottom-0 z-50 lg:hidden w-72
                            bg-marca-surface border-r border-marca-border
                            flex flex-col animate-slide-left">

                {/* Cabecera */}
                <div className="h-14 flex items-center px-5 gap-3 border-b border-marca-border">
                    <div className="w-7 h-7 rounded-lg bg-marca-border flex items-center justify-center">
                        <CalendarClock size={16} />
                    </div>
                    <span className="text-sm font-semibold text-marca-pale flex-1">Sistema de turnos</span>
                    <button
                        onClick={cerrar}
                        className="w-8 h-8 flex items-center justify-center rounded-lg
                                   text-marca-muted hover:text-marca-light hover:bg-marca-surface2 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Opciones */}
                <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">

                    {/* Límite de horas */}
                    <div className="px-4 py-3 mb-1 rounded-xl bg-marca-bg border border-marca-border">
                        <p className="text-xs font-medium uppercase tracking-widest text-marca-muted mb-2">
                            Límite semanal
                        </p>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min={1}
                                max={80}
                                value={limiteHoras}
                                onChange={e => onCambiarLimite?.(Number(e.target.value))}
                                className="w-16 text-center text-sm font-medium rounded-lg px-2 py-1.5
                                           bg-marca-surface border border-marca-border2 text-marca-pale
                                           outline-none focus:border-marca-mid transition-colors"
                            />
                            <span className="text-xs text-marca-muted">horas por empleado</span>
                        </div>
                    </div>

                    {/* Mi equipo */}
                    <button
                        id="drawer-mi-equipo"
                        onClick={() => { onMiEquipo?.(); cerrar() }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl w-full
                                   text-sm text-marca-muted hover:text-marca-light
                                   hover:bg-marca-surface2 transition-colors text-left"
                    >
                        <UsersRound size={16} />
                        <span>Mi equipo</span>
                    </button>

                    {/* Guardar */}
                    <button
                        id="drawer-guardar"
                        onClick={() => setGuardarExpandido(v => !v)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl w-full
                                   text-sm text-marca-muted hover:text-marca-light
                                   hover:bg-marca-surface2 transition-colors text-left"
                    >
                        <Save size={16} />
                        <span className="flex-1">Guardar</span>
                        <svg
                            width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"
                            className={`transition-transform duration-200 ${guardarExpandido ? 'rotate-180' : ''}`}
                        >
                            <polyline points="2,4 7,9 12,4" />
                        </svg>
                    </button>

                    {/* Sub-opciones de guardar */}
                    {guardarExpandido && (
                        <div className="ml-6 flex flex-col gap-0.5 border-l border-marca-border pl-3">
                            <button
                                id="drawer-guardar-borrador"
                                onClick={() => { onGuardar(); cerrar() }}
                                className="px-4 py-2.5 rounded-xl w-full text-sm
                                           text-marca-muted hover:text-marca-light
                                           hover:bg-marca-surface2 transition-colors text-left"
                            >
                                Guardar borrador
                            </button>
                            <button
                                id="drawer-publicar"
                                onClick={() => { onPublicar(); cerrar() }}
                                className="px-4 py-2.5 rounded-xl w-full text-sm font-medium
                                           text-marca-pale bg-marca-border
                                           hover:bg-marca-dark transition-colors text-left"
                            >
                                Publicar planificación
                            </button>
                        </div>
                    )}

                    {/* Historial */}
                    <button
                        id="drawer-historial"
                        onClick={() => { onHistorial?.(); cerrar() }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl w-full
                                   text-sm text-marca-muted hover:text-marca-light
                                   hover:bg-marca-surface2 transition-colors text-left"
                    >
                        <Archive size={16} />
                        <span>Historial de planillas</span>
                    </button>
                </nav>

                {/* Cerrar sesión — fondo del drawer */}
                <div className="p-4 border-t border-marca-border">
                    <button
                        id="drawer-cerrar-sesion"
                        onClick={() => { onCerrarSesion(); cerrar() }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                   text-sm text-marca-muted 
                                   bg-marca-border
                                   hover:text-marca-pale
                                   hover:bg-marca-dark transition-colors"
                    >
                        <LogOut size={16} />
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </>
    )
}

// ── Componente principal mobile ───────────────────────────

export function HeaderJefeMobile({
    semana,
    onGuardar,
    onPublicar,
    onCerrarSesion,
    onSemanaAnterior,
    onSemanaSiguiente,
    onMiEquipo,
    onHistorial,
    limiteHoras,
    onCambiarLimite,
}) {
    const { dark, toggleTema } = useTheme()
    const [drawerAbierto, setDrawerAbierto] = useState(false)

    const etiquetaRango = semana.length > 0
        ? `${formatDia(semana[0].id)} al ${formatDia(semana[6].id)}`
        : ''

    return (
        <>
            <TopBar
                onAbrirDrawer={() => setDrawerAbierto(true)}
                toggleTema={toggleTema}
                dark={dark}
            />

            <WeekNav
                etiquetaRango={etiquetaRango}
                onAnterior={onSemanaAnterior}
                onSiguiente={onSemanaSiguiente}
            />

            {drawerAbierto && (
                <SideDrawer
                    onGuardar={onGuardar}
                    onPublicar={onPublicar}
                    onCerrarSesion={onCerrarSesion}
                    onMiEquipo={onMiEquipo}
                    onHistorial={onHistorial}
                    onCerrar={() => setDrawerAbierto(false)}
                    limiteHoras={limiteHoras}
                    onCambiarLimite={onCambiarLimite}
                />
            )}
        </>
    )
}
