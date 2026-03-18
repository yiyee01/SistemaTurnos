// src/components/tabla_semanal.jsx

export function TablaSemanal({ enfermeros, diasSemana }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      
      {/* Cabecera de la tabla */}
      <div className="grid grid-cols-8 bg-slate-800 text-white divide-x divide-slate-600">
        <div className="p-4 font-bold text-center flex items-center justify-center">Enfermero</div>
        {diasSemana.map(dia => (
          <div key={dia.id} className="p-4 flex flex-col items-center justify-center">
            <span className="font-bold">{dia.nombre}</span>
            {/* Acá se imprime el número del día en celeste */}
            <span className="text-xl text-blue-300 font-black">{dia.numero}</span>
          </div>
        ))}
      </div>

      {/* Cuerpo de la tabla */}
      <div className="divide-y divide-slate-200">
        {enfermeros.map(enfermero => (
          <div key={enfermero.id} className="grid grid-cols-8 divide-x divide-slate-200 hover:bg-slate-50 transition-colors">
            
            {/* Nombre del enfermero */}
            <div className="p-4 font-bold text-slate-700 flex items-center justify-center bg-slate-50/50">
              {enfermero.nombre}
            </div>

            {/* Celdas vacías de los días (Acá van a caer las fichas después) */}
            {diasSemana.map(dia => (
              <div 
                key={`${enfermero.id}-${dia.id}`} 
                className="p-2 min-h-[100px] flex flex-col gap-2"
              >
                {/* Zona para soltar turnos */}
              </div>
            ))}

          </div>
        ))}
      </div>
      
    </div>
  );
}