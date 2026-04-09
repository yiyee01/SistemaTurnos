// src/components/VistaLogin.jsx
import { useState } from 'react'
import { CalendarClock, Eye, EyeOff } from 'lucide-react'

export function VistaLogin({ onSubmit, cargando, error }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mostrarPass, setMostrarPass] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(email, password)
  }

  const formularioValido = email.includes('@') && password.length >= 6

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-marca-bg">

      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4
                          bg-marca-dark border border-marca-base">
            <CalendarClock className='text-marca-base' size={40} />
          </div>
          <h1 className="text-xl font-medium mb-1 text-marca-pale">
            Sistema de Turnos
          </h1>
          <p className="text-sm text-marca-muted">
            Ingresá con tu cuenta institucional
          </p>
        </div>

        {/* Card formulario */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 bg-marca-surface border border-marca-border"
        >

          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5 tracking-widest uppercase text-marca-light">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@hospital.com"
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all
                         bg-marca-bg border border-marca-border2 text-marca-pale
                         focus:border-marca-mid placeholder:text-marca-muted2"
            />
          </div>

          {/* Contraseña */}
          <div className="mb-5">
            <label className="block text-xs font-medium mb-1.5 tracking-widest uppercase text-marca-light">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={mostrarPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg px-3 py-2.5 pr-10 text-sm outline-none transition-all
                           bg-marca-bg border border-marca-border2 text-marca-pale
                           focus:border-marca-mid placeholder:text-marca-muted2"
              />
              <button
                type="button"
                onClick={() => setMostrarPass(!mostrarPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-marca-muted2 hover:text-marca-light transition-colors
                           bg-transparent border-none p-0 cursor-pointer"
              >
                {mostrarPass ? (<EyeOff size={16} />) : (<Eye size={16} />)}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg px-3 py-2.5 text-sm mb-4
                            bg-red-950 border border-red-800 text-red-300">
              {error}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={!formularioValido || cargando}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all
                        border border-marca-mid
                        ${formularioValido && !cargando
                ? 'text-marca-border bg-marca-muted hover:text-marca-pale hover:bg-marca-dark transition-colors'
                : 'bg-marca-dark text-marca-base cursor-default opacity-50'
              }`}
          >
            {cargando ? 'Ingresando…' : 'Ingresar'}
          </button>

          {/* Divider + badge */}
          <div className="mt-5 pt-5 border-t border-marca-border flex justify-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium
                             px-3 py-1 rounded-full
                             bg-marca-dark border border-marca-base text-marca-light">
              <span className="w-1.5 h-1.5 rounded-full bg-marca-mid inline-block"></span>
              Acceso según rol asignado
            </span>
          </div>

        </form>

        {/* Footer */}
        <p className="text-center text-xs mt-5 text-marca-muted2">
          ¿Problemas para ingresar? Contactá al administrador.
        </p>

      </div>
    </div>
  )
}