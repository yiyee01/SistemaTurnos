// src/components/jefe/ModalConfirmarBaja.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { UserX } from 'lucide-react'

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
                        bg-marca-muted border-marca-border">
              {<UserX size={20} />}
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
                       border 
                      text-marca-border 
                      bg-marca-muted
                      hover:text-marca-pale
                      hover:bg-marca-dark transition-colors"
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
