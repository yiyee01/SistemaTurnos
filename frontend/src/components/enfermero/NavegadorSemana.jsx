// src/components/enfermero/NavegadorSemana.jsx

export function NavegadorSemana({ onAnterior, onSiguiente, etiqueta }) {
  return (
    <div className="flex items-center gap-2">

      <button
        onClick={onAnterior}
        className="w-8 h-8 flex items-center justify-center rounded-md text-sm
                   border border-marca-border2 bg-marca-surface text-marca-muted
                   hover:text-marca-light hover:border-marca-base transition-colors"
      >
        ←
      </button>

      {etiqueta && (
        <span className="text-xs text-marca-light min-w-28 text-center font-medium">
          Semana del {etiqueta}
        </span>
      )}

      <button
        onClick={onSiguiente}
        className="w-8 h-8 flex items-center justify-center rounded-md text-sm
                   border border-marca-border2 bg-marca-surface text-marca-muted
                   hover:text-marca-light hover:border-marca-base transition-colors"
      >
        →
      </button>

    </div>
  )
}