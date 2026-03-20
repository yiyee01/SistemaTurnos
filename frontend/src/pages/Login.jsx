// src/pages/Login.jsx
import { useState } from 'react'
import { VistaLogin } from '../components/VistaLogin'
import { supabase } from '../supabase/client'

export default function Login() {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (email, password) => {
    setCargando(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos.')
    }
    // Si el login es exitoso, useAuth detecta la sesión
    // y App.jsx redirige automáticamente según el rol

    setCargando(false)
  }

  return (
    <VistaLogin
      onSubmit={handleLogin}
      cargando={cargando}
      error={error}
    />
  )
}