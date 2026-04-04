// src/components/jefe/BottomSheet.jsx
import { motion, AnimatePresence } from 'framer-motion'

const opcionesTurno = [
    { id: 'TM', nombre: 'Mañana (06-14)', color: 'bg-blue-200 text-blue-900 border-blue-400' },
    { id: 'TT', nombre: 'Tarde (14-22)', color: 'bg-orange-200 text-orange-900 border-orange-400' },
    { id: 'TN', nombre: 'Noche (22-06)', color: 'bg-purple-200 text-purple-900 border-purple-400' },
    { id: 'FR', nombre: 'Franco', color: 'bg-gray-300 text-gray-700 border-gray-500' },
    { id: 'LM', nombre: 'Lic. Maternidad', color: 'bg-pink-200 text-pink-900 border-pink-400' },
    { id: 'LI', nombre: 'Licencia', color: 'bg-yellow-200 text-yellow-900 border-yellow-400' },
]

export function BottomSheet({ celdaId, turnosActuales, onAsignar, onEliminar, onCerrar }) {
    const tieneTurno = turnosActuales?.length > 0

    return (
        <AnimatePresence>
            {celdaId && (
                <>
                    {/* Fondo oscuro */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                        onClick={onCerrar}
                    />

                    {/* Panel desde abajo */}
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden
                                   bg-marca-surface border-t border-marca-border
                                   rounded-t-2xl p-5 flex flex-col gap-4"
                    >

                {/* Handle */}
                <div className="w-10 h-1 bg-marca-border2 rounded-full mx-auto" />

                {/* Título */}
                <p className="text-xs uppercase tracking-widest text-marca-muted font-medium text-center">
                    Asignar turno
                </p>

                {/* Opciones de turno */}
                <div className="grid grid-cols-3 gap-2">
                    {opcionesTurno.map(op => (
                        <button
                            key={op.id}
                            onClick={() => { onAsignar(celdaId, op); onCerrar() }}
                            className={`py-3 px-2 rounded-xl border text-xs font-medium
                          text-center transition-all active:scale-95 ${op.color}`}
                        >
                            {op.nombre}
                        </button>
                    ))}
                </div>

                {/* Botón borrar — solo si ya tiene turno */}
                {tieneTurno && (
                    <button
                        onClick={() => {
                            turnosActuales.forEach(t => onEliminar(celdaId, t.id_unico))
                            onCerrar()
                        }}
                        className="w-full py-3 rounded-xl border border-red-800
                       bg-red-950 text-red-300 text-sm font-medium
                       transition-all active:scale-95"
                    >
                        Quitar turno
                    </button>
                )}

                {/* Cancelar */}
                <button
                    onClick={onCerrar}
                    className="w-full py-3 rounded-xl border border-marca-border2
                     text-marca-muted text-sm transition-all active:scale-95"
                >
                    Cancelar
                </button>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}