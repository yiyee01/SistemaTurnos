import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ErrorBoundary } from './components/ErrorBoundary'
import { PageWrapper } from './components/PageWrapper'
import { useAuth } from './hooks/useAuth'
import { PantallaCarga } from './components/PantallaCarga'
import Login from './pages/Login'
import Jefe from './pages/Jefe'
import Enfermero from './pages/Enfermero'
import MiEquipo from './pages/MiEquipo'
import FormularioEnfermero from './pages/FormularioEnfermero'
import HistorialPlanillas from './pages/HistorialPlanillas'

//Funcion que permite que se proteja cada pagina como la de jefe y enfermero validando que sea
//Un jefe o enfermero el que esta en la pagina
function RutaProtegida({ children, rolRequerido }) {
  const { session, rol, cargando } = useAuth()
  if (cargando) return <PantallaCarga mensaje="Verificando sesión..." />;
  if (!session) return <Navigate to="/login" />
  if (rol !== rolRequerido) return <Navigate to="/login" />

  return children
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Ruta publica */}
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />

        {/* Ruta para Jefe de enfermeria */}
        <Route path="/jefe" element={
          <RutaProtegida rolRequerido="jefe">
            <PageWrapper><Jefe /></PageWrapper>
          </RutaProtegida>
        } />

        {/* Ruta solo para enfermeros */}
        <Route path="/enfermero" element={
          <RutaProtegida rolRequerido="enfermero">
            <PageWrapper><Enfermero /></PageWrapper>
          </RutaProtegida>
        } />

        <Route path="/jefe/equipo" element={
          <RutaProtegida rolRequerido="jefe">
            <PageWrapper><MiEquipo /></PageWrapper>
          </RutaProtegida>
        } />

        <Route path="/jefe/equipo/nuevo" element={
          <RutaProtegida rolRequerido="jefe">
            <PageWrapper><FormularioEnfermero /></PageWrapper>
          </RutaProtegida>
        } />

        <Route path="/jefe/equipo/editar/:id" element={
          <RutaProtegida rolRequerido="jefe">
            <PageWrapper><FormularioEnfermero /></PageWrapper>
          </RutaProtegida>
        } />

        <Route path="/jefe/historial" element={
          <RutaProtegida rolRequerido="jefe">
            <PageWrapper><HistorialPlanillas /></PageWrapper>
          </RutaProtegida>
        } />

        {/* Cualquier URL desconocida va al login */}
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  )
}