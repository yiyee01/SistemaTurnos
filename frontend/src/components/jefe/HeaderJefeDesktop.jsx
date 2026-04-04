// src/components/jefe/HeaderJefeDesktop.jsx
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { IconSol } from '../icons/IconSol'
import { IconLuna } from '../icons/IconLuna'

// ── Helpers ───────────────────────────────────────────────

const formatFecha = (id) => {
    const d = new Date(id + 'T12:00:00')
    return `${d.getDate()} ${d.toLocaleString('es-AR', { month: 'short' })}`
}

// ── Dropdown de Guardar ───────────────────────────────────

function DropdownGuardar({ onGuardar, onPublicar }) {
    const [abierto, setAbierto] = useState(false)
    const ref = useRef(null)

    // Cerrar al hacer clic fuera
    useEffect(() => {
        function handler(e) {
            if (ref.current && !ref.current.contains(e.target)) setAbierto(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setAbierto(v => !v)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium
                           bg-marca-base border border-marca-mid text-marca-pale
                           hover:bg-marca-dark transition-colors"
            >
                <svg width="14" height="14" fill="none" stroke="currentColor"
                    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17,21 17,13 7,13 7,21" />
                    <polyline points="7,3 7,8 15,8" />
                </svg>
                Guardar
                <svg
                    width="12" height="12" fill="none" stroke="currentColor"
                    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                    className={`transition-transform duration-150 ${abierto ? 'rotate-180' : ''}`}
                >
                    <polyline points="2,4 6,8 10,4" />
                </svg>
            </button>

            {abierto && (
                <div className="absolute right-0 top-full mt-1.5 w-52 z-50
                                bg-marca-surface border border-marca-border
                                rounded-xl shadow-xl overflow-hidden">
                    <button
                        onClick={() => { onGuardar(); setAbierto(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3
                                   text-sm text-marca-muted hover:text-marca-light
                                   hover:bg-marca-surface2 transition-colors text-left"
                    >
                        <svg width="15" height="15" fill="none" stroke="currentColor"
                            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                        Guardar borrador
                    </button>
                    <div className="h-px bg-marca-border mx-3" />
                    <button
                        onClick={() => { onPublicar(); setAbierto(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3
                                   text-sm font-medium text-marca-pale
                                   hover:bg-marca-surface2 transition-colors text-left"
                    >
                        <svg width="15" height="15" fill="none" stroke="currentColor"
                            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                            <polyline points="9 16 11 18 15 14" />
                        </svg>
                        Publicar planificación
                    </button>
                </div>
            )}
        </div>
    )
}

// ── Componente principal ──────────────────────────────────

export function HeaderJefeDesktop({
    semana,
    limiteHoras,
    onCambiarLimite,
    onGuardar,
    onPublicar,
    onCerrarSesion,
    onSemanaAnterior,
    onSemanaSiguiente,
    onMiEquipo,
    onHistorial,
}) {
    const { dark, toggleTema } = useTheme()

    const etiquetaRango = semana.length > 0
        ? `${formatFecha(semana[0].id)} — ${formatFecha(semana[6].id)}`
        : ''

    return (
        <div className="hidden lg:block">
            {/* ── Barra de navegación fija ── */}
            <div className="fixed top-0 left-0 right-0 z-40
                            h-14 flex items-center justify-between px-6 gap-4
                            bg-marca-surface border-b border-marca-border">

                {/* Izquierda: logo + título */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="w-7 h-7 rounded-lg bg-marca-base flex items-center justify-center">
                        <svg width="14" height="14" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className="text-marca-pale">
                            <rect x="2" y="3" width="10" height="12" rx="1" />
                            <line x1="5" y1="7" x2="9" y2="7" />
                            <line x1="5" y1="10" x2="9" y2="10" />
                        </svg>
                    </div>
                    <span className="text-sm font-semibold text-marca-pale">
                        Planilla semanal
                    </span>
                </div>

                {/* Centro: navegación de semana */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onSemanaAnterior}
                        className="w-8 h-8 flex items-center justify-center rounded-lg
                                   border border-marca-border2 text-marca-muted
                                   hover:text-marca-light hover:border-marca-base transition-colors"
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor"
                            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9,4 5,8 9,12" />
                        </svg>
                    </button>

                    <span className="text-sm font-medium text-marca-pale px-2 min-w-[160px] text-center tabular-nums">
                        Semana {etiquetaRango}
                    </span>

                    <button
                        onClick={onSemanaSiguiente}
                        className="w-8 h-8 flex items-center justify-center rounded-lg
                                   border border-marca-border2 text-marca-muted
                                   hover:text-marca-light hover:border-marca-base transition-colors"
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor"
                            strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="5,4 9,8 5,12" />
                        </svg>
                    </button>
                </div>

                {/* Derecha: acciones */}
                <div className="flex items-center gap-2 shrink-0">

                    {/* Límite semanal */}
                    <div className="flex items-center gap-2 px-3 h-9 rounded-lg
                                    border border-marca-border2 bg-marca-bg">
                        <span className="text-xs text-marca-muted whitespace-nowrap">Límite</span>
                        <input
                            type="number"
                            min={1}
                            max={80}
                            value={limiteHoras}
                            onChange={e => onCambiarLimite(Number(e.target.value))}
                            className="w-12 text-center text-sm font-medium
                                       bg-transparent text-marca-pale
                                       outline-none [appearance:textfield]
                                       [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-xs text-marca-muted">h</span>
                    </div>

                    {/* Separador */}
                    <div className="w-px h-5 bg-marca-border2" />

                    {/* Mi equipo */}
                    <button
                        onClick={onMiEquipo}
                        className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm
                                   border border-marca-border2 text-marca-muted
                                   hover:text-marca-light hover:border-marca-base transition-colors"
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor"
                            strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="7" cy="5" r="2.5" />
                            <path d="M1 15c0-3 2.5-5.5 6-5.5s6 2.5 6 5.5" />
                            <circle cx="14" cy="6" r="2" />
                            <path d="M17 14c0-2-1.4-3.8-3-4.4" />
                        </svg>
                        Mi equipo
                    </button>

                    {/* Historial */}
                    <button
                        onClick={onHistorial}
                        className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm
                                   border border-marca-border2 text-marca-muted
                                   hover:text-marca-light hover:border-marca-base transition-colors"
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor"
                            strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="14" height="14" rx="2" />
                            <line x1="11" y1="1" x2="11" y2="5" />
                            <line x1="5" y1="1" x2="5" y2="5" />
                            <line x1="2" y1="8" x2="16" y2="8" />
                        </svg>
                        Historial
                    </button>

                    {/* Guardar dropdown */}
                    <DropdownGuardar onGuardar={onGuardar} onPublicar={onPublicar} />

                    {/* Separador */}
                    <div className="w-px h-5 bg-marca-border2" />

                    {/* Tema */}
                    <button
                        onClick={toggleTema}
                        className="w-9 h-9 flex items-center justify-center rounded-lg
                                   border border-marca-border2 text-marca-muted
                                   hover:text-marca-light hover:border-marca-base transition-colors"
                    >
                        {dark ? <IconSol /> : <IconLuna />}
                    </button>

                    {/* Cerrar sesión */}
                    <button
                        onClick={onCerrarSesion}
                        className="w-9 h-9 flex items-center justify-center rounded-lg
                                   border border-red-900 text-red-500
                                   hover:bg-red-950 hover:text-red-400 transition-colors"
                    >
                        <svg width="15" height="15" fill="none" stroke="currentColor"
                            strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16,17 21,12 16,7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>

                </div>
            </div>
        </div>
    )
}
