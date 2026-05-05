import { motion, AnimatePresence } from 'framer-motion'

const nombresTurno = {
    TM: 'Mañana (06-14)',
    TT: 'Tarde (14-22)',
    TN: 'Noche (22-06)',
    FR: 'Franco',
    LM: 'Lic. Maternidad',
    LI: 'Licencia',
}

const estilosTurno = {
    TM: 'bg-blue-950 text-blue-300 border-blue-800',
    TT: 'bg-amber-950 text-amber-300 border-amber-800',
    TN: 'bg-purple-950 text-purple-300 border-purple-800',
    FR: 'bg-marca-surface2 text-marca-muted border-marca-border2',
    LM: 'bg-pink-950 text-pink-300 border-pink-800',
    LI: 'bg-yellow-950 text-yellow-300 border-yellow-800',
}


export function ModalTurno({ fecha, turnosDia = [], onCerrar }) {

    const fechaDate = new Date(fecha + 'T12:00:00')
    const etiqueta = fechaDate.toLocaleDateString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long'
    })


    return (
        <AnimatePresence>
            {fecha && (
                // Fondo oscuro
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.6)' }}
                    onClick={onCerrar}
                >
                    {/* Card del modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-full max-w-sm bg-marca-surface border border-marca-border
                           rounded-2xl p-5 flex flex-col gap-4"
                        onClick={e => e.stopPropagation()}
                    >

                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs uppercase tracking-widest text-marca-muted font-medium mb-1">
                            Turnos del día
                        </p>
                        <h2 className="text-base font-medium text-marca-pale capitalize">
                            {etiqueta}
                        </h2>
                    </div>
                    <button
                        onClick={onCerrar}
                        className="text-marca-muted hover:text-marca-light transition-colors
                       bg-marca-surface2 rounded-lg w-8 h-8 flex items-center justify-center"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex flex-col gap-3">
                    {turnosDia.length === 0 && (
                        <p className="text-sm text-marca-muted text-center py-2">Sin turnos para este día.</p>
                    )}
                    {turnosDia.map((turno, i) => {
                        const cod     = turno.tipos_turno?.cod ?? ''
                        const horario = turno.tipos_turno
                            ? `${turno.tipos_turno.hora_inicio ?? ''} – ${turno.tipos_turno.hora_fin ?? ''}`.trim()
                            : ''
                        return (
                            <div
                                key={i}
                                className={`rounded-xl border p-4 flex flex-col gap-1 ${estilosTurno[cod] ?? ''}`}
                            >
                                <p className="text-sm font-medium">
                                    {nombresTurno[cod] ?? cod}
                                </p>
                                {horario && (
                                    <p className="text-xs opacity-70">{horario}</p>
                                )}
                                <p className="text-xs opacity-70">
                                    {turno.hospitales?.nombre ?? '—'}
                                </p>
                                <p className="text-xs opacity-50">
                                    Sector: {turno.sectores?.nombre ?? '—'}
                                </p>
                            </div>
                        )
                    })}
                </div>

                {/* Botón cerrar */}
                <button
                    onClick={onCerrar}
                    className="w-full py-2 rounded-lg text-sm text-marca-muted
                     border border-marca-border2 bg-marca-surface2
                     hover:text-marca-light hover:border-marca-base transition-colors"
                >
                    Cerrar
                </button>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}