// src/pages/Enfermero.jsx
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { HeaderEnfermero } from '../components/enfermero/HeaderEnfermero'
import { VistaSemanal } from '../components/enfermero/VistaSemanal'
import { CalendarioMensual } from '../components/enfermero/CalendarioMensual'
import { ModalTurno } from '../components/enfermero/ModalTurno'
import { supabase } from '../supabase/client'
import { useTurnos } from '../hooks/useTurnos'

export default function Enfermero() {
  const { session, cerrarSesion } = useAuth()
  const [semanaOffset, setSemanaOffset] = useState(0)
  const [mesOffset, setMesOffset] = useState(0)
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const { turnos } = useTurnos(session?.user?.id, 1, 1)

  //Hay que permitir al enfermero cambiar entre hospitales y sectores
  // y eso mandar a useTurnos

  const nombre = session?.user?.email ?? 'Enfermero'

  return (
    <div className="min-h-screen bg-marca-bg p-4 md:p-8 scrollbar-marca">

      <HeaderEnfermero
        nombre={nombre}
        onCerrarSesion={cerrarSesion}
      />

      {/* <VistaSemanal
        turnosAsignados={turnosAsignados}
        semanaOffset={semanaOffset}
        onAnterior={() => setSemanaOffset(s => s - 1)}
        onSiguiente={() => setSemanaOffset(s => s + 1)}
        onSeleccionarDia={setDiaSeleccionado}
      /> */}

      <div className="max-w-4xl mx-auto">
        <CalendarioMensual
          turnosAsignados={turnos}
          mesOffset={mesOffset}
          onAnterior={() => setMesOffset(m => m - 1)}
          onSiguiente={() => setMesOffset(m => m + 1)}
          onSeleccionarDia={setDiaSeleccionado}
        />
      </div>
      <ModalTurno
        fecha={diaSeleccionado}
        onCerrar={() => setDiaSeleccionado(null)}
      />
    </div>
  )
}