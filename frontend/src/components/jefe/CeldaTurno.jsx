// src/components/jefe/CeldaTurno.jsx
import { Droppable } from '@hello-pangea/dnd'

const estilosTurno = {
    TM: 'bg-blue-200 text-blue-900 border-blue-400',
    TT: 'bg-orange-200 text-orange-900 border-orange-400',
    TN: 'bg-purple-200 text-purple-900 border-purple-400',
    FR: 'bg-gray-300 text-gray-700 border-gray-500',
    LM: 'bg-pink-200 text-pink-900 border-pink-400',
    LI: 'bg-yellow-200 text-yellow-900 border-yellow-400',
}

const nombresTurno = {
    TM: 'Mañana',
    TT: 'Tarde',
    TN: 'Noche',
    FR: 'Franco',
    LM: 'Lic. Mat.',
    LI: 'Licencia',
}

export function CeldaTurno({ celdaId, turnos, onEliminar, onAbrirBottomSheet, bloqueada }) {

    // ── MÓVIL: toque simple abre el bottom sheet ──
    const handleToque = () => {
        if (bloqueada) return
        onAbrirBottomSheet(celdaId, turnos)
    }

    // ── CONTENIDO de la celda ──
    const contenido = turnos.length > 0
        ? turnos.map(turno => (
            <div
                key={turno.id_unico}
                onDoubleClick={(e) => { e.stopPropagation(); onEliminar(celdaId, turno.id_unico) }}
                className={`text-xs p-1.5 rounded border font-medium text-center
                      cursor-pointer transition-all
                      hover:brightness-90 ${estilosTurno[turno.tipo_id] ?? 'bg-gray-200'}`}
                title="Doble clic para eliminar"
            >
                {nombresTurno[turno.tipo_id] ?? turno.nombre}
            </div>
        ))
        : null

    // ── VISTA MÓVIL (<1024px): sin drag and drop ──
    const vistaMobile = (
        <div
            onClick={handleToque}
            className={`min-h-[64px] p-1.5 flex flex-col gap-1 transition-colors
                  ${bloqueada
                    ? 'bg-red-50 cursor-not-allowed opacity-60'
                    : turnos.length > 0
                        ? 'cursor-pointer'
                        : 'cursor-pointer hover:bg-marca-surface2'
                }`}
        >
            {contenido}
            {bloqueada && (
                <span className="text-xs text-red-400 text-center">Licencia</span>
            )}
        </div>
    )

    // ── VISTA DESKTOP (≥1024px): con drag and drop ──
    const vistaDesktop = (
        <Droppable droppableId={celdaId}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[80px] p-2 flex flex-col gap-1 transition-colors
                      ${bloqueada
                            ? 'bg-red-50 cursor-not-allowed opacity-60'
                            : snapshot.isDraggingOver
                                ? 'bg-green-50 ring-2 ring-inset ring-green-400'
                                : ''
                        }`}
                >
                    {contenido}
                    {bloqueada && (
                        <span className="text-xs text-red-400 text-center">Licencia</span>
                    )}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    )

    return (
        <>
            {/* Tailwind no puede hacer condicionales en tiempo de ejecución,
          usamos clases hidden/block según breakpoint */}
            <div className="block lg:hidden">{vistaMobile}</div>
            <div className="hidden lg:block">{vistaDesktop}</div>
        </>
    )
}