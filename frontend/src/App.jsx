import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Jefe from './pages/Jefe'
import Enfermero from './pages/Enfermero'

//Funcion que permite que se protega cada pagina como la de jefeEnfermero validando que sea
//Un jefe el que esta en la pagina
function RutaProtegida({children, rolRequerido}) {
  const { session, rol, cargando } = useAuth()
  if (cargando) return <div>Cargando...</div>
  if (!session) return <Navigate to="/login" />
  if (rol !== rolRequerido) return <Navigate to="/login" />

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta publica */}
        <Route path="/login" element={<Login />} />

        {/* Ruta para Jefe de enfermeria */}
        <Route path="/jefe" element={
          <RutaProtegida rolRequerido="jefe"> {/* Validamos que sea un jefe */}
            <Jefe /> {/* se devuelve la pagina si es jefe */}
          </RutaProtegida>
        }/>

        {/* Ruta solo para enfermeros */}
        <Route path="/enfermero" element={
          <RutaProtegida rolRequerido="enfermero">
            <Enfermero />
          </RutaProtegida>
        }/>

        {/* Cualquier URL desconocida va al login */}
        <Route path="*" element={<Navigate to="/login" />} />
        
      </Routes>
    </BrowserRouter>
  )
}