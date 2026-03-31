// src/components/enfermero/TarjetaDia.jsx

// Mapeamos cada tipo de turno a sus clases de color
const estilosTurno = {
  TM: 'bg-blue-950 text-blue-300 border-t-2 border-blue-600',
  TT: 'bg-amber-950 text-amber-300 border-t-2 border-amber-600',
  TN: 'bg-purple-950 text-purple-300 border-t-2 border-purple-600',
  FR: 'bg-marca-surface2 text-marca-muted border-t-2 border-marca-muted',
  LM: 'bg-pink-950 text-pink-300 border-t-2 border-pink-600',
  LI: 'bg-yellow-950 text-yellow-300 border-t-2 border-yellow-600',
}

const nombresTurno = {
  TM: 'Mañana (06-14)',
  TT: 'Tarde (14-22)',
  TN: 'Noche (22-06)',
  FR: 'Franco',
  LM: 'Lic. Maternidad',
  LI: 'Licencia',
}

export function TarjetaDia({ nombreDia, numeroDia, tipoTurno, esHoy, onSeleccionarDia, fechaStr }) {
  const estilos = estilosTurno[tipoTurno] ?? 'bg-marca-surface2 text-marca-muted border-t-2 border-marca-border2'
  const nombre = nombresTurno[tipoTurno] ?? 'Sin turno'
  const tieneTurno = tipoTurno !== null

  return (
    <div
      onClick={() => tieneTurno && onSeleccionarDia(fechaStr)}
      className={`flex flex-col rounded-xl overflow-hidden border transition-all
                  ${esHoy ? 'border-marca-base' : 'border-marca-border'}
                  ${tieneTurno ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
    >
      <div className="bg-marca-surface2 text-center py-2 px-3">
        <p className="text-xs font-medium uppercase tracking-widest text-marca-muted">
          {nombreDia}
        </p>
        <p className={`text-lg font-medium leading-tight
                       ${esHoy ? 'text-marca-mid' : 'text-marca-pale'}`}>
          {numeroDia}
        </p>
      </div>

      <div className={`flex-1 flex items-center justify-center p-4 text-xs font-medium text-center ${estilos}`}>
        {nombre}
      </div>
    </div>
  )
}