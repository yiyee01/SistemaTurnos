// src/components/tabla_semanal.jsx
// IMPORTACIÓN CLAVE
import { Droppable } from '@hello-pangea/dnd';

export function TablaSemanal({ enfermeros, diasSemana, turnosAsignados }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      
      <div className="grid grid-cols-8 bg-slate-800 text-white divide-x divide-slate-600">
        <div className="p-4 font-bold text-center flex items-center justify-center">Enfermero</div>
        {diasSemana.map(dia => (
          <div key={dia.id} className="p-4 flex flex-col items-center justify-center">
            <span className="font-bold">{dia.nombre}</span>
            <span className="text-xl text-blue-300 font-black">{dia.numero}</span>
          </div>
        ))}
      </div>

      <div className="divide-y divide-slate-200">
        {enfermeros.map(enfermero => (
          <div key={enfermero.id} className="grid grid-cols-8 divide-x divide-slate-200 hover:bg-slate-50 transition-colors">
            
            <div className="p-4 font-bold text-slate-700 flex items-center justify-center bg-slate-50/50">
              {enfermero.nombre}
            </div>

            {/* ZONAS DE ATERRIZAJE (DROPPABLES) */}
            {diasSemana.map(dia => {
              // EL ID CRÍTICO: "e1-2026-03-16". Esto es lo que va a leer tu App.jsx
              const celdaId = `${enfermero.id}-${dia.id}`;
              
              return (
                <Droppable key={celdaId} droppableId={celdaId}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      // Si la ficha está pasando por encima, la celda se pinta de verde clarito
                      className={`p-2 min-h-[100px] flex flex-col gap-2 transition-colors ${snapshot.isDraggingOver ? 'bg-green-50 ring-2 ring-green-400 inset-0' : ''}`}
                    >
                      
                      {/* Acá se dibujarán los turnos asignados más adelante */}
                      
                      {/* VITAL: El placeholder evita que la celda colapse */}
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