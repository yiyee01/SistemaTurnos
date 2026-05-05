// src/components/ProcesandoOverlay.jsx
import { Loader2 } from 'lucide-react'

export function ProcesandoOverlay({ mensaje = 'Procesando…', submensaje = 'Por favor, esperá unos segundos.' }) {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: 'rgba(0,0,0,0.65)' }}
    >
      <div className="w-full max-w-xs bg-marca-surface border border-marca-border
                      rounded-2xl p-6 flex flex-col items-center gap-4 shadow-2xl">
        <div className="w-12 h-12 rounded-full flex items-center justify-center
                        bg-marca-surface2 border border-marca-border2 text-marca-light">
          <Loader2 className="animate-spin" size={26} />
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-marca-pale">{mensaje}</p>
          <p className="text-sm text-marca-muted mt-1">{submensaje}</p>
        </div>
      </div>
    </div>
  )
}
