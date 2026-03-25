// src/components/tabla_semanal.jsx
import { Droppable } from '@hello-pangea/dnd';

// 1. JUANI: Recibí la nueva prop 'onEliminarTurno' acá:
export function TablaSemanal({ enfermeros, diasSemana, turnosAsignados, onEliminarTurno }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      
      {/* Cabecera ... (sin cambios) */}
      <div className="grid grid-cols-8 bg-slate-800 text-white divide-x divide-slate-600">
        <div className="p-4 font-bold text-center flex items-center justify-center">Enfermero</div>
        {diasSemana.map(dia => (
          <div key={dia.id} className="p-4 flex flex-col items-center justify-center">
            <span className="font-bold">{dia.nombre}</span>
            <span className="text-xl text-blue-300 font-black">{dia.numero}</span>
          </div>
        ))}
      </div>

      {/* Cuerpo ... */}
      <div className="divide-y divide-slate-200">
        {enfermeros.map(enfermero => (
          <div key={enfermero.id} className="grid grid-cols-8 divide-x divide-slate-200 hover:bg-slate-50 transition-colors">
            
            <div className="p-4 font-bold text-slate-700 flex items-center justify-center bg-slate-50/50">
              {enfermero.nombre}
            </div>

            {diasSemana.map(dia => {
              const celdaId = `${enfermero.id}-${dia.id}`;
              const turnosEnEstaCelda = turnosAsignados[celdaId] || [];
              
              return (
                <Droppable key={celdaId} droppableId={celdaId}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-2 min-h-25 flex flex-col gap-1 transition-colors ${snapshot.isDraggingOver ? 'bg-green-50 ring-2 inset-0' : ''}`}
                    >
                      
                      {turnosEnEstaCelda.map((turno) => (
                        <div 
                          key={turno.id_unico} 
                          onDoubleClick={() => onEliminarTurno(celdaId, turno.id_unico)}
                          // Acá está la magia: al final le inyectamos ${turno.color} sin pisarlo con nada
                          className={`text-xs p-2 rounded border font-bold text-center shadow-sm cursor-pointer transition-all hover:bg-red-200 hover:border-red-500 hover:text-red-900 hover:line-through ${turno.color}`}
                          title="Doble clic para eliminar"
                        >
                          {turno.nombre}
                        </div>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}

          </div>
        ))}
      </div>
      
    </div>
  );
}