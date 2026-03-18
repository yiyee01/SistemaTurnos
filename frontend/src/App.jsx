// src/App.jsx
import { useState } from 'react';
import { supabase } from './supabase/client'
// IMPORTACIÓN CLAVE
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TablaSemanal } from './components/tabla_semanal';

const generarDiasSemana = () => {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); 
  const diferencia = hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
  const lunes = new Date(hoy.setDate(diferencia));
  const nombresDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  return nombresDias.map((nombre, index) => {
    const fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + index);
    return { id: fecha.toISOString().split('T')[0], nombre: nombre, numero: fecha.getDate() };
  });
};

const tiposTurno = [
  { id: 'TM', nombre: 'Mañana (06-14)', color: 'bg-blue-200 text-blue-900 border-blue-400' },
  { id: 'TT', nombre: 'Tarde (14-22)', color: 'bg-orange-200 text-orange-900 border-orange-400' },
  { id: 'TN', nombre: 'Noche (22-06)', color: 'bg-purple-200 text-purple-900 border-purple-400' },
  { id: 'FR', nombre: 'Franco', color: 'bg-gray-300 text-gray-700 border-gray-500' }
];

const enfermerosFake = [
  { id: 'e1', nombre: 'Juan Pérez' },
  { id: 'e2', nombre: 'Ana Gómez' },
  { id: 'e3', nombre: 'Carlos López' }
];

export default function App() {
  const [enfermeros] = useState(enfermerosFake);
  const [semanaActual] = useState(generarDiasSemana());
  
  // Memoria para guardar dónde cae cada ficha (se lo pasamos a Juani)
  const [turnosAsignados, setTurnosAsignados] = useState({});

  // El cerebro físico. Qué pasa cuando soltás el clic.
  const alSoltarFicha = (resultado) => {
    const { destination, source, draggableId } = resultado;
    
    // Si la soltaste fuera de la tabla, no hacemos nada
    if (!destination) return;

    // Solo para que veas en la consola que funciona antes de programar la base de datos
    console.log(`Tiraste el turno ${draggableId} en la celda: ${destination.droppableId}`);
  };

  return (
    // EL PARAGUAS GLOBAL. Envuelve absolutamente todo.
    <DragDropContext onDragEnd={alSoltarFicha}>
      <div className="min-h-screen bg-slate-100 p-8 font-sans">
        <h1 className="text-3xl font-black text-slate-800 mb-6">Planilla Semanal de Turnos</h1>

        <div className="mb-8 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Arrastrar Fichas de Turno
          </h2>
          
          {/* EL BANCO SE VUELVE DROPPABLE (Para que reconozca a los hijos). isDropDisabled evita que tiremos cosas adentro */}
          <Droppable droppableId="banco-fichas" direction="horizontal" isDropDisabled={true}>
            {(provided) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps} 
                className="flex gap-4 min-h-[50px]"
              >
                {tiposTurno.map((turno, index) => (
                  // CADA FICHA SE VUELVE DRAGGABLE
                  <Draggable key={turno.id} draggableId={turno.id} index={index}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        // Le damos un efecto de sombra cuando la estás agarrando
                        className={`px-4 py-2 rounded-md border font-bold ${turno.color} ${snapshot.isDragging ? 'shadow-xl scale-110 z-50' : 'shadow-sm'}`}
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

        <TablaSemanal enfermeros={enfermeros} diasSemana={semanaActual} turnosAsignados={turnosAsignados} />
      </div>
    </DragDropContext>
  );
}