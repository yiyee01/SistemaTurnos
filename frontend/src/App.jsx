// src/App.jsx
import { useState } from 'react';
import { supabase } from './supabase/client'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { TablaSemanal } from './components/tabla_semanal';

const generarDiasDesdeLunes = (lunes) => {
  const nombresDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  return nombresDias.map((nombre, index) => {
    const fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + index);
    return {
      id: fecha.toISOString().split('T')[0],
      nombre,
      numero: fecha.getDate(),
    };
  });
};

const getLunesDeHoy = () => {
  const hoy = new Date();
  const diaSemana = hoy.getDay();
  const diferencia = hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
  const lunes = new Date(hoy.setDate(diferencia));
  lunes.setHours(0, 0, 0, 0);
  return lunes;
};

const formatearFecha = (date) =>
  date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const tiposTurno = [
  { id: 'TM', nombre: 'Mañana (06-14)', color: 'bg-blue-200 text-blue-900 border-blue-400' },
  { id: 'TT', nombre: 'Tarde (14-22)', color: 'bg-orange-200 text-orange-900 border-orange-400' },
  { id: 'TN', nombre: 'Noche (22-06)', color: 'bg-purple-200 text-purple-900 border-purple-400' },
  { id: 'FR', nombre: 'Franco', color: 'bg-gray-300 text-gray-700 border-gray-500' },
  { id: 'LI', nombre: 'Licencia', color: 'bg-green-200 text-green-900 border-green-400' },
];

const enfermerosFake = [
  { id: 'e1', nombre: 'Juan Pérez' },
  { id: 'e2', nombre: 'Ana Gómez' },
  { id: 'e3', nombre: 'Carlos López' },
];

// ─────────────────────────────────────────────────────────────────
// MOTOR DE REGLAS
// Devuelve null si todo está bien, o un string con el mensaje de error.
// ─────────────────────────────────────────────────────────────────
const validarReglas = (turnoNuevoId, celdaId, turnosPorSemana, claveSemana, diasSemana) => {
  // El celdaId tiene formato "e1-2026-03-24", partimos solo en el primer guión
  const guionIdx = celdaId.indexOf('-');
  const enfermeroId = celdaId.slice(0, guionIdx);
  const fecha = celdaId.slice(guionIdx + 1);

  const turnosActuales = turnosPorSemana[claveSemana] || {};
  const turnosHoy = turnosActuales[celdaId] || [];

  // ── REGLA 1: Franco y Licencia son exclusivos del día ──────────────────
  const hayTurnosHoy = turnosHoy.length > 0;
  const yaTieneExclusivo = turnosHoy.some(t => t.tipo_id === 'FR' || t.tipo_id === 'LI');
  const nuevoEsExclusivo = turnoNuevoId === 'FR' || turnoNuevoId === 'LI';

  if (hayTurnosHoy && nuevoEsExclusivo) {
    const label = turnoNuevoId === 'FR' ? 'Franco' : 'Licencia';
    return `No se puede agregar ${label}: ya hay turnos asignados ese día.`;
  }
  if (yaTieneExclusivo && !nuevoEsExclusivo) {
    const tipoExistente = turnosHoy.find(t => t.tipo_id === 'FR' || t.tipo_id === 'LI');
    return `No se puede agregar un turno: ese día ya tiene ${tipoExistente.nombre}.`;
  }

  // ── REGLA 2: No duplicar el mismo turno en el día ──────────────────────
  if (turnosHoy.some(t => t.tipo_id === turnoNuevoId)) {
    const nombre = tiposTurno.find(t => t.id === turnoNuevoId)?.nombre;
    return `Ya tiene ${nombre} asignado ese día.`;
  }

  // ── REGLA 3: Máximo 2 turnos por día ──────────────────────────────────
  if (turnosHoy.length >= 2) {
    return 'Máximo 2 turnos por día por enfermero.';
  }

  // ── REGLA 4: Noche → no puede tener Mañana al día siguiente ───────────
  const indiceHoy = diasSemana.findIndex(d => d.id === fecha);
  if (indiceHoy > 0) {
    const fechaAyer = diasSemana[indiceHoy - 1].id;
    const turnosAyer = turnosActuales[`${enfermeroId}-${fechaAyer}`] || [];
    if (turnosAyer.some(t => t.tipo_id === 'TN') && turnoNuevoId === 'TM') {
      return 'Descanso obligatorio: trabajó de noche ayer, no puede hacer Mañana hoy.';
    }
  }

  // ── REGLA 5: No puede trabajar Noche si hoy ya tiene Tarde (y viceversa) ──
  if (turnoNuevoId === 'TN' && turnosHoy.some(t => t.tipo_id === 'TT')) {
    return 'No se puede asignar Noche: ya tiene Tarde ese día (superposición de horarios).';
  }
  if (turnoNuevoId === 'TT' && turnosHoy.some(t => t.tipo_id === 'TN')) {
    return 'No se puede asignar Tarde: ya tiene Noche ese día (superposición de horarios).';
  }

  // ── REGLA 6: Máximo 6 turnos trabajados en la semana ──────────────────
  const turnosNoDescanso = ['TM', 'TT', 'TN'];
  let turnosTrabajoSemana = 0;
  diasSemana.forEach(dia => {
    const turnosDia = turnosActuales[`${enfermeroId}-${dia.id}`] || [];
    turnosTrabajoSemana += turnosDia.filter(t => turnosNoDescanso.includes(t.tipo_id)).length;
  });
  if (turnosNoDescanso.includes(turnoNuevoId) && turnosTrabajoSemana >= 6) {
    return 'Límite semanal: máximo 6 turnos de trabajo por semana.';
  }

  return null; // ✅ Sin infracción
};

// ─────────────────────────────────────────────────────────────────

export default function App() {
  const [enfermeros] = useState(enfermerosFake);
  const [lunesActual, setLunesActual] = useState(getLunesDeHoy);
  const semanaActual = generarDiasDesdeLunes(lunesActual);
  const claveSemana = lunesActual.toISOString().split('T')[0];

  const [turnosPorSemana, setTurnosPorSemana] = useState({});
  const turnosAsignados = turnosPorSemana[claveSemana] || {};

  // Toast de error
  const [errorMsg, setErrorMsg] = useState(null);
  const mostrarError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4000);
  };

  // --- Navegación ---
  const irSemanaAnterior = () => {
    setLunesActual(prev => {
      const nuevo = new Date(prev);
      nuevo.setDate(nuevo.getDate() - 7);
      return nuevo;
    });
  };
  const irSemanaSiguiente = () => {
    setLunesActual(prev => {
      const nuevo = new Date(prev);
      nuevo.setDate(nuevo.getDate() + 7);
      return nuevo;
    });
  };
  const irSemanaActual = () => setLunesActual(getLunesDeHoy());
  const esSemanaActual = claveSemana === getLunesDeHoy().toISOString().split('T')[0];

  const setTurnosSemanaActual = (updater) => {
    setTurnosPorSemana(prev => ({
      ...prev,
      [claveSemana]: updater(prev[claveSemana] || {}),
    }));
  };

  // --- Borrador & Publicar ---
  const guardarBorrador = async () => {
    console.log(`Borrador semana ${claveSemana}:`, turnosAsignados);
    alert('Progreso guardado localmente. Revisá la consola.');
  };

  const publicarSemana = async () => {
    const turnosParaBD = [];
    Object.entries(turnosAsignados).forEach(([celdaId, turnos]) => {
      const guionIdx = celdaId.indexOf('-');
      const enfermero_id = celdaId.slice(0, guionIdx);
      const fecha = celdaId.slice(guionIdx + 1);
      turnos.forEach(turno => {
        turnosParaBD.push({ enfermero_id, fecha, tipo_turno_id: turno.tipo_id });
      });
    });
    console.log('Bulk Insert listo:', turnosParaBD);
    alert(`¡Semana publicada! Se enviarán ${turnosParaBD.length} turnos. Revisá la consola.`);
  };

  // --- Drag & Drop con validación ---
  const alSoltarFicha = (resultado) => {
    const { destination, draggableId } = resultado;
    if (!destination || destination.droppableId === 'banco-fichas') return;

    const celdaId = destination.droppableId;

    const error = validarReglas(
      draggableId,
      celdaId,
      turnosPorSemana,
      claveSemana,
      semanaActual
    );

    if (error) {
      mostrarError(error);
      return;
    }

    const infoTurno = tiposTurno.find(t => t.id === draggableId);
    const turnoNuevo = {
      id_unico: crypto.randomUUID(),
      tipo_id: infoTurno.id,
      nombre: infoTurno.nombre,
      color: infoTurno.color,
    };

    setTurnosSemanaActual(estadoAnterior => {
      const turnosEnCelda = estadoAnterior[celdaId] || [];
      return { ...estadoAnterior, [celdaId]: [...turnosEnCelda, turnoNuevo] };
    });
  };

  const eliminarTurno = (celdaId, idUnicoTurno) => {
    setTurnosSemanaActual(estadoAnterior => {
      const turnosActuales = estadoAnterior[celdaId] || [];
      const turnosActualizados = turnosActuales.filter(t => t.id_unico !== idUnicoTurno);
      return { ...estadoAnterior, [celdaId]: turnosActualizados };
    });
  };

  const domingo = new Date(lunesActual);
  domingo.setDate(lunesActual.getDate() + 6);

  return (
    <DragDropContext onDragEnd={alSoltarFicha}>
      <div className="min-h-screen bg-slate-100 p-8 font-sans">

        {/* TOAST DE ERROR */}
        {errorMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-red-600 text-white font-bold rounded-xl shadow-2xl">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* CABECERA */}
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

        {/* NAVEGADOR DE SEMANA */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-xl shadow-sm border border-slate-200 px-5 py-3">
          <button
            onClick={irSemanaAnterior}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
          >
            ← Anterior
          </button>
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-slate-800">
              {formatearFecha(lunesActual)} — {formatearFecha(domingo)}
            </span>
            {!esSemanaActual && (
              <button onClick={irSemanaActual} className="mt-1 text-xs text-blue-600 font-bold hover:underline">
                Volver a la semana actual
              </button>
            )}
            {esSemanaActual && (
              <span className="mt-1 text-xs text-green-600 font-bold">Semana actual</span>
            )}
          </div>
          <button
            onClick={irSemanaSiguiente}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
          >
            Siguiente →
          </button>
        </div>

        {/* LEYENDA DE REGLAS 
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 leading-relaxed">
          <p className="font-bold mb-1">Reglas de asignación activas:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Franco y Licencia son exclusivos: no se combinan con otros turnos el mismo día.</li>
            <li>No se puede repetir el mismo turno en el día.</li>
            <li>Máximo 2 turnos por día por enfermero.</li>
            <li>Post-noche: no se puede asignar Mañana al día siguiente de un Noche.</li>
            <li>Sin superposición horaria: Tarde y Noche no pueden coexistir el mismo día.</li>
            <li>Máximo 6 turnos de trabajo (TM/TT/TN) por semana.</li>
          </ul>
        </div> */}

        {/* BANCO DE FICHAS */}
        <div className="mb-8 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Arrastrar Fichas de Turno
          </h2>
          <Droppable
            droppableId="banco-fichas"
            direction="horizontal"
            isDropDisabled={true}
            renderClone={(provided, snapshot, rubric) => {
              const turno = tiposTurno[rubric.source.index];
              return (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`px-4 py-2 rounded-md border font-bold text-sm shadow-xl scale-110 z-50 ${turno.color}`}
                >
                  {turno.nombre}
                </div>
              );
            }}
          >
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="flex gap-4 min-h-12.5">
                {tiposTurno.map((turno, index) => (
                  <Draggable key={turno.id} draggableId={turno.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
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

        {/* TABLA */}
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