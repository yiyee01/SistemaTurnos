// src/components/enfermero/CalendarioMensual.jsx
import { NavegadorSemana } from './NavegadorSemana'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']



export function CalendarioMensual({ turnosAsignados, mesOffset, onAnterior, onSiguiente, onSeleccionarDia }) {
  const hoy = new Date()
  const fecha = new Date(hoy.getFullYear(), hoy.getMonth() + mesOffset, 1)
  const mes = fecha.getMonth()
  const anio = fecha.getFullYear()

  // Cuántos días tiene el mes
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()

  // Qué día de la semana empieza (0=Dom, ajustamos a lunes=0)
  let iniciaSemana = new Date(anio, mes, 1).getDay()
  if (iniciaSemana === 0) iniciaSemana = 7
  const celdasVacias = iniciaSemana - 1

  return (
    <div className="bg-marca-surface border border-marca-border rounded-xl p-4 mt-6">

      {/* Título + navegador */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-marca-light">
          {MESES[mes]} {anio}
        </p>
        <NavegadorSemana
          onAnterior={onAnterior}
          onSiguiente={onSiguiente}
        />
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 mb-2">
        {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-marca-muted py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grilla de días */}
      <div className="grid grid-cols-7 gap-1">

        {/* Celdas vacías antes del día 1 */}
        {Array.from({ length: celdasVacias }).map((_, i) => (
          <div key={`v-${i}`} />
        ))}

        {/* Días del mes */}
        {Array.from({ length: diasEnMes }, (_, i) => i + 1).map(dia => {
          const fechaStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
          const turnos = turnosAsignados[fechaStr] ?? []
          const esHoy = fechaStr === hoy.toISOString().split('T')[0]
          const tieneTurno = turnos.length > 0
          const estilo = tieneTurno
            ? 'bg-marca-surface3 text-marca-pale shadow-sm border border-marca-border'
            : 'bg-transparent text-marca-muted2 hover:bg-marca-surface2'

          return (
            <div
              key={dia}
              onClick={() => tieneTurno && onSeleccionarDia(fechaStr)}
              className={`relative aspect-square rounded-md flex items-center justify-center
                  text-xs font-medium transition-all ${estilo}
                  ${esHoy ? 'outline-2 outline-marca-mid' : ''}
                  ${tieneTurno ? 'cursor-pointer hover:opacity-90' : 'cursor-default opacity-60'}`}
            >
              {dia}
              {turnos.length > 1 && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>
              )}
            </div>
          )
        })}

      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-marca-border">
        {[
          { cod: 'TM', label: 'Mañana', color: 'bg-blue-600' },
          { cod: 'TT', label: 'Tarde', color: 'bg-amber-600' },
          { cod: 'TN', label: 'Noche', color: 'bg-purple-600' },
          { cod: 'FR', label: 'Franco', color: 'bg-marca-muted' },
          { cod: 'LM', label: 'Lic. Mat', color: 'bg-pink-600' },
          { cod: 'LI', label: 'Licencia', color: 'bg-yellow-600' },
        ].map(item => (
          <div key={item.cod} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-sm ${item.color}`}></span>
            <span className="text-xs text-marca-muted">{item.label}</span>
          </div>
        ))}
      </div>

    </div>
  )
}