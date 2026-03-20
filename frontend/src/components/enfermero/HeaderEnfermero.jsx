// HeaderEnfermero.jsx
import { useTheme } from '../../hooks/useTheme'

export function HeaderEnfermero({ nombre, onCerrarSesion }) {
  const { dark, toggleTema } = useTheme()

  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-2xl font-medium text-marca-pale mb-1">
          Hola, {nombre}
        </h1>
        <p className="text-sm text-marca-muted">Tus turnos asignados</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Toggle tema */}
        <button
          onClick={toggleTema}
          className="w-9 h-9 flex items-center justify-center rounded-lg
                     border border-marca-border2 bg-marca-surface
                     text-marca-muted hover:text-marca-light
                     hover:border-marca-base transition-colors"
          title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {dark ? '☀️' : '🌙'}
        </button>

        <button
          onClick={onCerrarSesion}
          className="text-sm text-marca-muted border border-marca-border2
                     bg-marca-surface rounded-lg px-4 py-2
                     hover:text-marca-light hover:border-marca-base transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
