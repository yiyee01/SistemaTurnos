// src/pages/Enfermero.jsx
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { HeaderEnfermero } from '../components/enfermero/HeaderEnfermero'
import { VistaSemanal } from '../components/enfermero/VistaSemanal'
import { CalendarioMensual } from '../components/enfermero/CalendarioMensual'

// Datos fake hasta conectar Supabase
const turnosFake = {
  '2026-03-17': 'TM',
  '2026-03-18': 'TM',
  '2026-03-19': 'FR',
  '2026-03-20': 'TT',
  '2026-03-21': 'TT',
  '2026-03-22': 'TN',
  '2026-03-23': 'TN',
  '2026-03-24': 'TM',
  '2026-03-25': 'FR',
  '2026-03-26': 'TM',
}

export default function Enfermero() {
  const { session, cerrarSesion } = useAuth()
  const [semanaOffset, setSemanaOffset] = useState(0)
  const [mesOffset, setMesOffset] = useState(0)

  // TODO: reemplazar por query a Supabase
  // const { data } = await supabase
  //   .from('turnos_asignados')
  //   .select('fecha, tipo_turno_id')
  //   .eq('enfermero_id', session.user.id)
  const turnosAsignados = turnosFake

  const nombre = session?.user?.email ?? 'Enfermero'

  return (
    <div className="min-h-screen bg-marca-bg p-4 md:p-8 scrollbar-marca">
      
        <HeaderEnfermero
          nombre={nombre}
          onCerrarSesion={cerrarSesion}
        />
      
        <VistaSemanal
          turnosAsignados={turnosAsignados}
          semanaOffset={semanaOffset}
          onAnterior={() => setSemanaOffset(s => s - 1)}
          onSiguiente={() => setSemanaOffset(s => s + 1)}
        />
      <div className="max-w-2xl mx-auto">
        <CalendarioMensual
          turnosAsignados={turnosAsignados}
          mesOffset={mesOffset}
          onAnterior={() => setMesOffset(m => m - 1)}
          onSiguiente={() => setMesOffset(m => m + 1)}
        />
      </div>
    </div>
  )
}