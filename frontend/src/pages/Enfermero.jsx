// src/pages/Enfermero.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { HeaderEnfermero } from '../components/enfermero/HeaderEnfermero'
import { CalendarioMensual } from '../components/enfermero/CalendarioMensual'
import { ModalTurno } from '../components/enfermero/ModalTurno'
import { PantallaCarga } from '../components/PantallaCarga'
import { supabase } from '../supabase/client'
import { useTurnos } from '../hooks/useTurnos'

export default function Enfermero() {
  const { session, cerrarSesion, nombre } = useAuth()
  const [mesOffset, setMesOffset] = useState(0)
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)

  // Lugares de trabajo del enfermero (puede trabajar en varios)
  const [lugaresTrabajo, setLugaresTrabajo] = useState([])
  const [hospitalId, setHospitalId] = useState(0)
  const [sectorId, setSectorId]   = useState(0)
  const [cargandoPerfil, setCargandoPerfil] = useState(true)

  useEffect(() => {
    async function cargarPerfil() {
      if (!session?.user?.id) return
      const { data } = await supabase
        .from('trabaja_en')
        .select('hospital_id, sector_id, hospitales(nombre), sectores(nombre)')
        .eq('enfermero_id', session.user.id)
        .eq('activo', true)

      if (data?.length) {
        setLugaresTrabajo(data)
        setHospitalId(data[0].hospital_id ?? 0)
        setSectorId(data[0].sector_id   ?? 0)
      }
      setCargandoPerfil(false)
    }
    cargarPerfil()
  }, [session?.user?.id])

  // Mes y año que muestra el calendario (derivados del offset)
  const hoy = new Date()
  const fechaVista = new Date(hoy.getFullYear(), hoy.getMonth() + mesOffset, 1)
  const mesVista  = fechaVista.getMonth() + 1   // 1–12 para useTurnos
  const anioVista = fechaVista.getFullYear()

  const { turnos, cargando: cargandoTurnos } = useTurnos(
    session?.user?.id,
    hospitalId,
    sectorId,
    mesVista,
    anioVista
  )

  if (cargandoPerfil) {
    return <PantallaCarga mensaje="Cargando perfil..." />
  }

  return (
    <div className="min-h-screen bg-marca-bg p-4 md:p-8 scrollbar-marca">

      <HeaderEnfermero
        nombre={nombre ?? session?.user?.email ?? 'Empleado'}
        onCerrarSesion={cerrarSesion}
      />

      <div className="max-w-4xl mx-auto flex flex-col gap-4">

        {/* Selectores de hospital y sector (solo si tiene más de un lugar) */}
        {lugaresTrabajo.length > 1 && (
          <div className="flex gap-3 flex-wrap">
            <select
              value={`${hospitalId}|${sectorId}`}
              onChange={e => {
                const [h, s] = e.target.value.split('|').map(Number)
                setHospitalId(h)
                setSectorId(s)
                setMesOffset(0)
              }}
              className="px-3 py-2 rounded-xl text-sm bg-marca-surface border border-marca-border2
                         text-marca-muted outline-none cursor-pointer hover:border-marca-base transition-colors"
            >
              {lugaresTrabajo.map((l, i) => (
                <option key={i} value={`${l.hospital_id}|${l.sector_id}`}>
                  {l.hospitales?.nombre} — {l.sectores?.nombre}
                </option>
              ))}
            </select>
          </div>
        )}

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
        turnosDia={turnos.filter(t => t.fecha === diaSeleccionado)}
        onCerrar={() => setDiaSeleccionado(null)}
      />
    </div>
  )
}