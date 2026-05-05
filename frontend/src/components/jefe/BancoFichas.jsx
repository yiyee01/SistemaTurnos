// src/components/jefe/BancoFichas.jsx
import { Droppable, Draggable } from '@hello-pangea/dnd'
import { motion } from 'framer-motion'

const tiposTurno = [
    { id: 'TM', nombre: 'Mañana (06-14)', color: 'bg-blue-200 text-blue-900 border-blue-400' },
    { id: 'TT', nombre: 'Tarde (14-22)', color: 'bg-orange-200 text-orange-900 border-orange-400' },
    { id: 'TN', nombre: 'Noche (22-06)', color: 'bg-purple-200 text-purple-900 border-purple-400' },
    { id: 'FR', nombre: 'Franco', color: 'bg-gray-300 text-gray-700 border-gray-500' },
    { id: 'LM', nombre: 'Lic. Maternidad', color: 'bg-pink-200 text-pink-900 border-pink-400' },
    { id: 'LI', nombre: 'Licencia', color: 'bg-yellow-200 text-yellow-900 border-yellow-400' },
]

export function BancoFichas() {
    return (
        <div className="mb-6 p-4 rounded-xl bg-marca-surface border border-marca-border">

            <p className="text-xs uppercase tracking-widest text-marca-muted font-medium mb-3">
                Fichas de turno — arrastrá a la planilla
            </p>

            {/* Solo visible en desktop */}
            <div className="hidden lg:block">
                <Droppable
                    droppableId="banco-fichas"
                    direction="horizontal"
                    isDropDisabled={true}
                    renderClone={(provided, snapshot, rubric) => {
                        const turno = tiposTurno[rubric.source.index]
                        return (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                            >
                                <motion.div
                                    initial={{ scale: 0.8, rotate: -4 }}
                                    animate={{ scale: 1.05, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                    className={`px-4 py-2 rounded-lg border font-medium text-sm
                                        shadow-2xl cursor-grabbing ${turno.color}`}
                                >
                                    {turno.nombre}
                                </motion.div>
                            </div>
                        )
                    }}
                >
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex gap-3 flex-wrap min-h-[40px]"
                        >
                            {tiposTurno.map((turno, index) => (
                                <Draggable key={turno.id} draggableId={turno.id} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`${snapshot.isDragging ? 'opacity-50' : 'opacity-100'}`}
                                        >
                                            <motion.div
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`px-4 py-2 rounded-lg border font-medium text-sm
                                                    cursor-grab shadow-sm hover:shadow-md ${turno.color}`}
                                            >
                                                {turno.nombre}
                                            </motion.div>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </div>

            {/* Solo visible en mobile — informativo */}
            <div className="block lg:hidden">
                <p className="text-xs text-marca-muted2">
                    Tocá dos veces una celda para asignar un turno.
                </p>
            </div>

        </div>
    )
}