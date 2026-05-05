// src/components/jefe/ModalGuardar.jsx

/**
 * Modal multipaso para guardar borrador o planificación.
 *
 * Props:
 *   modo        — 'borrador' | 'planificacion'
 *   abierto     — boolean que controla si el modal está visible
 *   onConfirmar — función async que ejecuta el guardado; debe devolver { ok, error }
 *   onCancelar  — función que cierra el modal (solo se llama en la pantalla de confirmación)
 *   onExportarPDF — función que inicia la exportación (solo aplica en modo 'planificacion')
 *   onCerrar    — función que cierra el modal desde la pantalla de éxito
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FilePlus, CalendarCheck, CheckCircle } from 'lucide-react'

const SVG_PDF = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M9 13h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9v-3z" />
    <path d="M13 13h2" />
    <path d="M13 16h2" />
  </svg>
)

// ── Spinner ───────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
        strokeOpacity="0.3" />
      <path d="M12 2v4" />
    </svg>
  )
}

// ── Componente principal ──────────────────────────────────

export function ModalGuardar({
  modo = 'borrador',
  abierto,
  onConfirmar,
  onCancelar,
  onExportarPDF,
  onCerrar,
}) {
  const [pantalla, setPantalla] = useState('confirmacion') // 'confirmacion' | 'cargando' | 'exito'

  const esBorrador = modo === 'borrador'

  // Color y datos según modo
  const accentBg = esBorrador ? 'bg-marca-muted' : 'bg-emerald-950'
  const accentBorde = esBorrador ? 'border-marca-light' : 'border-emerald-700'
  const accentColor = esBorrador ? 'text-marca-border' : 'text-emerald-300'
  const titulo = esBorrador ? 'Guardar borrador' : 'Guardar planificación'
  const descripcion = esBorrador
    ? 'Se guardará el estado actual de la planilla sin publicarla. Podrás seguir editando.'
    : 'Se publicará la planificación. El equipo de enfermería podrá ver sus turnos asignados.'
  const svgIcono = esBorrador ? <FilePlus /> : <CalendarCheck />

  async function handleConfirmar() {
    setPantalla('cargando')
    const resultado = await onConfirmar?.()
    if (resultado?.ok !== false) {
      setPantalla('exito')
    } else {
      // Si falla, volver a la confirmación (idealmente el padre muestra el error)
      setPantalla('confirmacion')
    }
  }

  function handleCerrar() {
    setPantalla('confirmacion') // reiniciar para la próxima vez
    onCerrar?.()
  }

  const contentRender = () => {
    if (pantalla === 'cargando') {
      return (
        <Card key="cargando">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${accentBg} ${accentBorde} border`}>
              <div className={accentColor}>
                <Spinner />
              </div>
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-marca-pale">Guardando…</p>
              <p className="text-sm text-marca-muted mt-1">
                {esBorrador ? 'Guardando borrador' : 'Publicando planificación'}
              </p>
            </div>
          </div>
        </Card>
      )
    }

    if (pantalla === 'exito') {
      return (
        <Card key="exito">
          {/* Ícono éxito */}
          <div className="w-11 h-11 rounded-full flex items-center justify-center
                          bg-emerald-950 border border-emerald-700 text-emerald-400">
            {<CheckCircle />}
          </div>

          {/* Texto */}
          <div>
            <h2 className="text-base font-medium text-marca-pale mb-1">
              {esBorrador ? '¡Borrador guardado!' : '¡Planificación guardada!'}
            </h2>
            <p className="text-sm text-marca-muted leading-relaxed">
              {esBorrador
                ? 'El borrador fue guardado correctamente. Podés seguir editando cuando quieras.'
                : 'La planificación fue publicada. Tu equipo ya puede ver los turnos asignados.'}
            </p>
          </div>

          {/* Acciones */}
          {esBorrador ? (
            // Borrador: solo cerrar
            <div className="pt-1">
              <button
                onClick={handleCerrar}
                className="w-full py-2.5 rounded-lg text-sm font-medium
                           bg-marca-base border border-marca-mid text-marca-pale
                           hover:bg-marca-dark transition-colors"
              >
                Listo
              </button>
            </div>
          ) : (
            // Planificación: exportar PDF + cerrar
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => { onExportarPDF?.(); handleCerrar() }}
                className="w-full flex items-center justify-center gap-2
                           py-2.5 rounded-lg text-sm font-medium
                           bg-emerald-950 border border-emerald-700 text-emerald-300
                           hover:bg-emerald-900 transition-colors"
              >
                {SVG_PDF}
                Exportar como PDF
              </button>
              <button
                onClick={handleCerrar}
                className="w-full py-2.5 rounded-lg text-sm font-medium
                           border border-marca-border2 text-marca-muted
                           hover:text-marca-light hover:border-marca-base transition-colors"
              >
                Ahora no
              </button>
            </div>
          )}
        </Card>
      )
    }

    return (
      <Card key="confirmacion" onClick={e => e.stopPropagation()}>
        {/* Ícono */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center
                         ${accentBg} ${accentBorde} border ${accentColor}`}>
          {svgIcono}
        </div>

        {/* Texto */}
        <div>
          <h2 className="text-base font-medium text-marca-pale mb-2">
            {titulo}
          </h2>
          <p className="text-sm text-marca-muted leading-relaxed">
            {descripcion}
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
            onClick={handleConfirmar}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium
                        ${accentBg} ${accentBorde} border ${accentColor}
                        ${esBorrador ? 'hover:bg-marca-base' : 'hover:bg-emerald-900'} transition-colors`}
          >
            {titulo}
          </button>
        </div>
      </Card>
    )
  }

  return (
    <AnimatePresence>
      {abierto && (
        <Overlay onClick={onCancelar}>
          {contentRender()}
        </Overlay>
      )}
    </AnimatePresence>
  )
}

// ── Helpers de layout ────────────────────────────────────

function Overlay({ children, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

function Card({ children, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="w-full max-w-sm bg-marca-surface border border-marca-border
                 rounded-2xl p-6 flex flex-col gap-4"
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
