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

export function TarjetaDia({ nombreDia, numeroDia, turnos = [], esHoy, onSeleccionarDia, fechaStr }) {
  const tieneTurno = turnos.length > 0

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

      <div className="flex-1 flex flex-col bg-marca-surface2 border-t border-marca-border2 overflow-hidden">
        {tieneTurno ? (
          turnos.map((t, idx) => {
            const estilos = estilosTurno[t] ?? 'bg-marca-surface2 text-marca-muted border-t-2 border-marca-border2'
            const nombre = nombresTurno[t] ?? 'Sin turno'
            return (
              <div key={idx} className={`flex-1 flex items-center justify-center p-2 text-xs font-medium text-center ${estilos} ${idx > 0 ? 'border-t-0 border-opacity-50' : ''}`}>
                {nombre}
              </div>
            )
          })
        ) : (
          <div className="flex-1 flex items-center justify-center p-4 text-xs font-medium text-center text-marca-muted">
            Sin turno
          </div>
        )}
      </div>
    </div>
  )
}