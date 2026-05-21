// src/components/PantallaCarga.jsx
import { Clock } from 'lucide-react'

/**
 * Pantalla de carga global.
 * Props:
 *   mensaje         — texto opcional debajo del spinner (default: "Cargando...")
 *   pantallaCompleta — si es true (default), ocupa min-h-screen. Si es false, es un spinner compacto inline.
 */
export function PantallaCarga({ mensaje = 'Cargando...', pantallaCompleta = true }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-5
                     ${pantallaCompleta ? 'min-h-screen bg-marca-bg' : 'py-12'}`}>

      {/* Logo — solo en pantalla completa */}
      {pantallaCompleta && (
        <div className="flex items-center gap-2 mb-2">
          <Clock size={18} className="text-marca-base" strokeWidth={1.5} />
          <span className="text-sm font-semibold text-marca-base tracking-tight">
            SisTurnos
          </span>
        </div>
      )}

      {/* Spinner */}
      <div className="w-10 h-10 rounded-full border-2 border-marca-border
                      border-t-marca-mid animate-spin" />

      {/* Mensaje */}
      <p className="text-sm text-marca-muted">{mensaje}</p>

    </div>
  )
}

