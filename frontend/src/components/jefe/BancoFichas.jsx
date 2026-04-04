// src/components/jefe/BancoFichas.jsx
import { Droppable, Draggable } from '@hello-pangea/dnd'

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
                                className={`px-4 py-2 rounded-lg border font-medium text-sm
                            shadow-xl scale-105 ${turno.color}`}
                            >
                                {turno.nombre}
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
                                            className={`px-4 py-2 rounded-lg border font-medium text-sm
                                  cursor-grab transition-opacity ${turno.color}
                                  ${snapshot.isDragging ? 'opacity-50' : 'opacity-100'}`}
                                        >
                                            {turno.nombre}
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