import { useState, useEffect } from 'react'
/*Para llamar a supabase es con ./ */
import { supabase } from './supabase/client'
import { TablaSemanal } from './components/tabla_semanal';

// El motor que calcula las fechas dinámicamente
const generarDiasSemana = () => {
  const hoy = new Date();
  const diaSemana = hoy.getDay(); 
  const diferencia = hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
  const lunes = new Date(hoy.setDate(diferencia));

  const nombresDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  
  return nombresDias.map((nombre, index) => {
    const fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + index);
    
    // Formato 'YYYY-MM-DD' listo para inyectar en Supabase
    const fechaSQL = fecha.toISOString().split('T')[0];
    
    return {
      id: fechaSQL,
      nombre: nombre,
      numero: fecha.getDate()
    };
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

  return (
    <div className="min-h-screen bg-slate-100 p-8 font-sans">
      <h1 className="text-3xl font-black text-slate-800 mb-6">Planilla Semanal de Turnos</h1>

      {/* EL BANCO DE FICHAS */}
      <div className="mb-8 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
          Arrastrar Fichas de Turno
        </h2>
        <div className="flex gap-4">
          {tiposTurno.map(turno => (
            <div 
              key={turno.id} 
              className={`px-4 py-2 rounded-md border shadow-sm font-bold cursor-grab transition-transform hover:scale-105 ${turno.color}`}
            >
              {turno.nombre}
            </div>
          ))}
        </div>
      </div>

      {/* LA MATRIZ PRINCIPAL */}
      <TablaSemanal enfermeros={enfermeros} diasSemana={semanaActual} />

    </div>
  );
}