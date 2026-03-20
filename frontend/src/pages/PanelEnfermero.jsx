// src/pages/PanelEnfermero.jsx
import { useState } from 'react';

// Datos falsos para probar el diseño rápido
const turnosSemanaFake = [
  { dia: 'Lunes 18', turno: 'Mañana (06-14)', color: 'bg-blue-200 text-blue-900 border-blue-400' },
  { dia: 'Martes 19', turno: 'Mañana (06-14)', color: 'bg-blue-200 text-blue-900 border-blue-400' },
  { dia: 'Miércoles 20', turno: 'Franco', color: 'bg-gray-300 text-gray-700 border-gray-500' },
  { dia: 'Jueves 21', turno: 'Tarde (14-22)', color: 'bg-orange-200 text-orange-900 border-orange-400' },
  { dia: 'Viernes 22', turno: 'Tarde (14-22)', color: 'bg-orange-200 text-orange-900 border-orange-400' },
  { dia: 'Sábado 23', turno: 'Noche (22-06)', color: 'bg-purple-200 text-purple-900 border-purple-400' },
  { dia: 'Domingo 24', turno: 'Noche (22-06)', color: 'bg-purple-200 text-purple-900 border-purple-400' },
];

export function PanelEnfermero() {
  const [semana, setSemana] = useState(turnosSemanaFake);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      
      {/* 1. CABECERA */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">Hola, Juan Pérez</h1>
          <p className="text-slate-500 font-medium">Tus turnos asignados</p>
        </div>
        <button className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-100 transition-colors">
          Cerrar Sesión
        </button>
      </div>

      {/* 2. VISTA SEMANAL (El Carrusel Híbrido) */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-700">Semana actual</h2>
          {/* Controles de Juani */}
          <div className="flex gap-2">
            <button className="p-2 bg-white border rounded hover:bg-slate-50">&larr;</button>
            <button className="p-2 bg-white border rounded hover:bg-slate-50">&rarr;</button>
          </div>
        </div>

        {/* CONTENEDOR MÁGICO: En celular es flex con scroll horizontal (overflow-x-auto). En PC (md:) es grid de 7 columnas */}
        <div className="flex overflow-x-auto md:grid md:grid-cols-7 gap-4 pb-4 snap-x">
          {semana.map((item, index) => (
            <div 
              key={index} 
              // En celular cada tarjeta ocupa el 80% del ancho (min-w-[80%]). En PC ocupa su columna entera.
              className="min-w-[80%] md:min-w-0 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden snap-center"
            >
              {/* Encabezado del día */}
              <div className="bg-slate-800 text-white text-center py-2 font-bold text-sm">
                {item.dia}
              </div>
              {/* Bloque de color del turno */}
              <div className={`flex-1 flex items-center justify-center p-6 font-black text-center ${item.color}`}>
                {item.turno}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. VISTA MENSUAL (El Macro View) */}
      <div>
        <h2 className="text-xl font-bold text-slate-700 mb-4">Calendario Mensual (Marzo)</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          
          {/* Días de la semana */}
          <div className="grid grid-cols-7 text-center font-bold text-slate-500 mb-2 text-sm">
            <div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div><div>Do</div>
          </div>
          
          {/* Grilla de días (Ejemplo estático para que vean el diseño) */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {/* Días vacíos previos al inicio de mes */}
            <div className="aspect-square rounded bg-transparent"></div>
            <div className="aspect-square rounded bg-transparent"></div>
            
            {/* Días con turnos (Pintamos el fondo) */}
            <div className="aspect-square rounded bg-blue-200 flex items-center justify-center font-bold text-blue-900 text-sm md:text-base">1</div>
            <div className="aspect-square rounded bg-blue-200 flex items-center justify-center font-bold text-blue-900 text-sm md:text-base">2</div>
            <div className="aspect-square rounded bg-gray-300 flex items-center justify-center font-bold text-gray-700 text-sm md:text-base">3</div>
            <div className="aspect-square rounded bg-orange-200 flex items-center justify-center font-bold text-orange-900 text-sm md:text-base">4</div>
            <div className="aspect-square rounded bg-purple-200 flex items-center justify-center font-bold text-purple-900 text-sm md:text-base">5</div>
            {/* ... seguirían los 30 días generados con un .map() en el futuro ... */}
          </div>

        </div>
      </div>

    </div>
  );
}