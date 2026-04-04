// src/components/jefe/ModalConfirmarBaja.jsx
import { motion, AnimatePresence } from 'framer-motion'

const SVG_BAJA = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#F09595">
    <path d="M1,20a1,1,0,0,0,1,1h8a1,1,0,0,0,0-2H3.071A7.011,7.011,0,0,1,10,13a5.044,5.044,0,1,0-3.377-1.337A9.01,9.01,0,0,0,1,20ZM10,5A3,3,0,1,1,7,8,3,3,0,0,1,10,5Zm12.707,9.707L20.414,17l2.293,2.293a1,1,0,1,1-1.414,1.414L19,18.414l-2.293,2.293a1,1,0,0,1-1.414-1.414L17.586,17l-2.293-2.293a1,1,0,0,1,1.414-1.414L19,15.586l2.293-2.293a1,1,0,0,1,1.414,1.414Z" />
  </svg>
)

/**
 * Modal de confirmación antes de dar de baja a un enfermero.
 *
 * Props:
 *   enfermero   — objeto { nombre, apellido } del enfermero a dar de baja
 *   onConfirmar — función que ejecuta la baja
 *   onCancelar  — función que cierra el modal
 */
export function ModalConfirmarBaja({ enfermero, onConfirmar, onCancelar }) {
  return (
    <AnimatePresence>
      {enfermero && (
        // Overlay — clic afuera cierra
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={onCancelar}
        >
          {/* Card del modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-sm bg-marca-surface border border-marca-border
                       rounded-2xl p-6 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >

        {/* Ícono */}
        <div className="w-11 h-11 rounded-full flex items-center justify-center
                        bg-red-950 border border-red-800">
          {SVG_BAJA}
        </div>

        {/* Texto */}
        <div>
          <h2 className="text-base font-medium text-marca-pale mb-2">
            ¿Dar de baja a este enfermero?
          </h2>
          <p className="text-sm text-marca-muted leading-relaxed">
            Estás por dar de baja a{' '}
            <span className="text-marca-pale font-medium">
              {enfermero.nombre} {enfermero.apellido}
            </span>
            . Ya no podrá ingresar al sistema ni aparecerá en la planilla de turnos.
          </p>
        </div>

        {/* Acciones */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancelar}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium
                       border border-marca-border2 text-marca-muted
                       hover:text-marca-light hover:border-marca-base transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium
                       bg-red-950 border border-red-800 text-red-300
                       hover:bg-red-900 transition-colors"
          >
            Dar de baja
          </button>
        </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
