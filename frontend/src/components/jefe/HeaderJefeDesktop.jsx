// src/components/jefe/HeaderJefeDesktop.jsx
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { Sun, Moon, Save, UsersRound, LogOut, CalendarClock, Upload, SaveAll, ChevronLeft, ChevronRight, Archive } from 'lucide-react'

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
                           bg-marca-border border border-marca-border text-marca-pale
                           hover:bg-marca-dark transition-colors"
            >
                <Save size={16} />
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
                        <SaveAll size={16} />
                        Guardar borrador
                    </button>
                    <div className="h-px bg-marca-border mx-3" />
                    <button
                        onClick={() => { onPublicar(); setAbierto(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3
                                   text-sm font-medium text-marca-pale
                                   hover:bg-marca-surface2 transition-colors text-left"
                    >
                        <Upload size={16} />
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
                    <div className="w-7 h-7 rounded-lg bg-marca-border flex items-center justify-center">
                        <CalendarClock size={16} />
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
                        <ChevronLeft size={16} />
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
                        <ChevronRight size={16} />
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
                        <UsersRound size={16} />
                        Mi equipo
                    </button>

                    {/* Historial */}
                    <button
                        onClick={onHistorial}
                        className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm
                                   border border-marca-border2 text-marca-muted
                                   hover:text-marca-light hover:border-marca-base transition-colors"
                    >
                        <Archive size={16} />
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
                        {dark ? < Sun /> : < Moon />}
                    </button>

                    {/* Cerrar sesión */}
                    <button
                        onClick={onCerrarSesion}
                        className="w-9 h-9 flex items-center justify-center rounded-lg
                                   border border-red-900 text-red-500
                                   hover:bg-red-950 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={16} />
                    </button>

                </div>
            </div>
        </div>
    )
}
