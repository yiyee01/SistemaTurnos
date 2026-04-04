// src/components/ErrorBoundary.jsx
import React from 'react';
import { motion } from 'framer-motion';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Actualiza el estado para que la siguiente renderización muestre la IU de repuesto.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // También puedes registrar el error en un servicio de reporte de errores
    console.error("ErrorBoundary detectó un error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-marca-bg flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="max-w-md w-full bg-marca-surface border border-marca-border rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-900/50 text-red-500 mx-auto flex items-center justify-center mb-6">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2M12 15h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-marca-pale mb-2">¡Ups! Algo salió mal.</h1>
            <p className="text-marca-muted mb-8">
              Ocurrió un error inesperado en la aplicación. Puedes intentar recargar la página para ver si se soluciona.
            </p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-marca-base text-marca-pale font-medium rounded-xl hover:bg-marca-mid hover:text-white transition-colors"
              >
                Recargar página
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="px-6 py-2.5 bg-marca-surface2 text-marca-pale font-medium border border-marca-border rounded-xl hover:bg-marca-surface3 transition-colors"
              >
                Ir al Inicio
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children; 
  }
}
