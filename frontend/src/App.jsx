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

/* Consultar si tambien hay que agregar licencia en tipos de turno, es decir que pueda faltar por
licencia de maternidad por ejemplo. (SÍ, agregalo acá abajo como un turno más) */

const tiposTurno = [
  { id: 'TM', nombre: 'Mañana (06-14)', color: 'bg-blue-200 text-blue-900 border-blue-400' },
  { id: 'TT', nombre: 'Tarde (14-22)', color: 'bg-orange-200 text-orange-900 border-orange-400' },
  { id: 'TN', nombre: 'Noche (22-06)', color: 'bg-purple-200 text-purple-900 border-purple-400' },
  { id: 'FR', nombre: 'Franco', color: 'bg-gray-300 text-gray-700 border-gray-500' }
];

//Obtener de Supabase
const enfermerosFake = [
  { id: 'e1', nombre: 'Juan Pérez' },
  { id: 'e2', nombre: 'Ana Gómez' },
  { id: 'e3', nombre: 'Carlos López' }
];

export default function App() {
  const [enfermeros] = useState(enfermerosFake);
  const [semanaActual] = useState(generarDiasSemana());
  
  // Memoria para guardar dónde cae cada ficha
  const [turnosAsignados, setTurnosAsignados] = useState({});

  // 1. FUNCIÓN PARA EL BORRADOR
  const guardarBorrador = async () => {
    console.log("Datos crudos para el borrador (JSON completo):", turnosAsignados);
    alert("Progreso guardado localmente. Revisá la consola.");
  };

  // 2. FUNCIÓN PARA PUBLICAR
  const publicarSemana = async () => {
    const turnosParaBD = [];
    
    Object.entries(turnosAsignados).forEach(([celdaId, turnos]) => {
      const [enfermero_id, fecha] = celdaId.split('-'); // El hachazo
      turnos.forEach(turno => {
        turnosParaBD.push({
          enfermero_id: enfermero_id,
          fecha: fecha,
          tipo_turno_id: turno.tipo_id
        });
      });
    });

    console.log("Bulk Insert listo para la tabla turnos_asignados:", turnosParaBD);
    alert(`¡Semana publicada! Se enviarán ${turnosParaBD.length} turnos a la base de datos. Revisá la consola.`);
  };

  // 3. EL CEREBRO FÍSICO (Actualizado con Optimistic UI)
  const alSoltarFicha = (resultado) => {
    const { destination, draggableId } = resultado;
    
    // Si la soltaste fuera de la tabla o en el banco de fichas, cortamos
    if (!destination || destination.droppableId === 'banco-fichas') return;

    const celdaId = destination.droppableId; // Ej: "e2-2026-03-17"
    const infoTurno = tiposTurno.find(t => t.id === draggableId);
    
    // Generamos un ID único para la ficha clonada (necesario para React)
    const turnoNuevo = {
      id_unico: crypto.randomUUID(),
      tipo_id: infoTurno.id,
      nombre: infoTurno.nombre,
      color: infoTurno.color
    };

    // Actualizamos el diccionario sumando el turno a la celda elegida
    setTurnosAsignados(estadoAnterior => {
      const turnosEnCelda = estadoAnterior[celdaId] || [];
      return {
        ...estadoAnterior,
        [celdaId]: [...turnosEnCelda, turnoNuevo]
      };
    });
  };

  // NUEVA FUNCIÓN: El exterminador de turnos
  const eliminarTurno = (celdaId, idUnicoTurno) => {
    setTurnosAsignados(estadoAnterior => {
      // 1. Obtenemos la lista actual de esa celda
      const turnosActuales = estadoAnterior[celdaId] || [];
      
      // 2. Filtramos la lista, sacando el turno que coincide con el ID que queremos matar
      // (Por eso es VITAL el crypto.randomUUID() que pusimos antes)
      const turnosActualizados = turnosActuales.filter(turno => turno.id_unico !== idUnicoTurno);
      
      // 3. Devolvemos el estado nuevo
      return {
        ...estadoAnterior,
        [celdaId]: turnosActualizados
      };
    });
  };

  return (
    // EL PARAGUAS GLOBAL
    <DragDropContext onDragEnd={alSoltarFicha}>
      <div className="min-h-screen bg-slate-100 p-8 font-sans">
        
        {/* CABECERA NUEVA CON LOS BOTONES */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-slate-800">Planilla Semanal de Turnos</h1>
          <div className="flex gap-4">
            <button 
              onClick={guardarBorrador}
              className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded shadow hover:bg-slate-300 transition-colors"
            >
              Guardar Borrador
            </button>
            <button 
              onClick={publicarSemana}
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded shadow hover:bg-blue-700 transition-colors"
            >
              Publicar Semana
            </button>
          </div>
        </div>

        <div className="mb-8 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Arrastrar Fichas de Turno
          </h2>
          
          <Droppable 
            droppableId="banco-fichas" 
            direction="horizontal" 
            isDropDisabled={true}
            // MAGIA NEGRA PARA FICHAS INFINITAS:
            renderClone={(provided, snapshot, rubric) => {
              // rubric.source.index nos dice qué ficha agarró del arreglo
              const turno = tiposTurno[rubric.source.index];
              return (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  // El clon se agranda un poco para que sepas que lo tenés agarrado
                  className={`px-4 py-2 rounded-md border font-bold text-sm shadow-xl scale-110 z-50 ${turno.color}`}
                >
                  {turno.nombre}
                </div>
              );
            }}
          >
            {(provided) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps} 
                className="flex gap-4 min-h-[50px]"
              >
                {tiposTurno.map((turno, index) => (
                  <Draggable key={turno.id} draggableId={turno.id} index={index}>
                    {(provided, snapshot) => (
                      // LA FICHA ORIGINAL QUE SE QUEDA CLAVADA EN EL BANCO
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        // Truco visual: Si estás arrastrando una copia, atenuamos la original
                        className={`px-4 py-2 rounded-md border font-bold text-sm shadow-sm transition-opacity ${turno.color} ${snapshot.isDragging ? 'opacity-50' : 'opacity-100'}`}
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

        <TablaSemanal 
        enfermeros={enfermeros} 
        diasSemana={semanaActual} 
        turnosAsignados={turnosAsignados} 
        onEliminarTurno={eliminarTurno}
        />
      </div>
    </DragDropContext>
  );
}