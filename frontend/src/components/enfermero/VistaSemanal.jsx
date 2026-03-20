// src/components/enfermero/VistaSemanal.jsx
import { TarjetaDia } from './TarjetaDia'
import { NavegadorSemana } from './NavegadorSemana'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// Genera los 7 días a partir del lunes de la semana con offset
function getLunes(offset) {
  const hoy = new Date()
  const dia = hoy.getDay()
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - (dia === 0 ? 6 : dia - 1) + offset * 7)
  lunes.setHours(0, 0, 0, 0)
  return lunes
}

function getDiasSemana(offset) {
  const lunes = getLunes(offset)
  return Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date(lunes)
    fecha.setDate(lunes.getDate() + i)
    return fecha
  })
}

function getEtiqueta(offset) {
  const dias = getDiasSemana(offset)
  const primero = dias[0]
  const ultimo = dias[6]
  return `${primero.getDate()} ${MESES[primero.getMonth()]} — ${ultimo.getDate()} ${MESES[ultimo.getMonth()]}`
}

export function VistaSemanal({ turnosAsignados, semanaOffset, onAnterior, onSiguiente }) {
  const dias = getDiasSemana(semanaOffset)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  return (
    <div>

      {/* Título + navegador */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-widest text-marca-light">
          Semana actual
        </p>
        <NavegadorSemana
          onAnterior={onAnterior}
          onSiguiente={onSiguiente}
          etiqueta={getEtiqueta(semanaOffset)}
        />
      </div>

      {/* Tarjetas — scroll horizontal en móvil, grid en desktop */}
      <div className="flex overflow-x-auto md:grid md:grid-cols-7 gap-3 pb-2">
        {dias.map((fecha, i) => {
          const fechaStr = fecha.toISOString().split('T')[0]
          const esHoy = fecha.getTime() === hoy.getTime()

          // turnosAsignados es un objeto { '2026-03-18': 'TM', '2026-03-19': 'TT', ... }
          const tipoTurno = turnosAsignados[fechaStr] ?? null

          return (
            <div key={i} className="min-w-[120px] md:min-w-0">
              <TarjetaDia
                nombreDia={DIAS[fecha.getDay()]}
                numeroDia={fecha.getDate()}
                tipoTurno={tipoTurno}
                esHoy={esHoy}
              />
            </div>
          )
        })}
      </div>

    </div>
  )
}