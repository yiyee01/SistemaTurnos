// src/pages/Login.jsx
import { useState, useEffect } from 'react'
import { VistaLogin } from '../components/VistaLogin'
import { supabase } from '../supabase/client'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const { rol } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (rol === 'jefe') {
      navigate('/jefe')
    } else if (rol === 'enfermero') {
      navigate('/enfermero')
    }
  }, [rol, navigate])

  const handleLogin = async (email, password) => {
    setCargando(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos.')
      setCargando(false)
    }
    // Si no hay error, el hook useAuth escuchará el cambio de sesión, 
    // buscará el rol y el useEffect de arriba redirigirá automáticamente.
  }

  return (
    <VistaLogin
      onSubmit={handleLogin}
      cargando={cargando}
      error={error}
    />
  )
}