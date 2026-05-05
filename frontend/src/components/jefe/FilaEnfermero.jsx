// src/components/jefe/FilaEnfermero.jsx
import { CeldaTurno } from './CeldaTurno'

export function FilaEnfermero({
    enfermero,
    diasSemana,
    turnosAsignados,
    horasSemanales,
    limiteHoras,
    estaBloqueada,
    cumpleFrancos,
    onEliminarTurno,
    onAbrirBottomSheet,
}) {
    const superaLimite = horasSemanales > limiteHoras

    return (
        <div className="flex hover:bg-marca-surface2 transition-colors">

            {/* Nombre — sticky con el padre */}
            <div className="w-40 shrink-0 p-3 flex flex-col justify-center
                      border-r border-marca-border
                      sticky left-0 bg-marca-bg z-10
                      hover:bg-marca-surface2 transition-colors">
                <div className="flex items-center gap-1.5 overflow-hidden">
                    <p className="text-sm font-medium text-marca-pale truncate">
                        {enfermero.nombre} {enfermero.apellido}
                    </p>
                    {!cumpleFrancos && (
                        <span title="Faltan francos obligatorios" 
                              className="text-xs bg-red-950/80 text-red-400 border border-red-800 w-4 h-4 
                                         rounded-full flex items-center justify-center shrink-0 cursor-help">
                            !
                        </span>
                    )}
                </div>
                {enfermero.matricula && (
                    <p className="text-[10px] text-marca-muted2 truncate mt-0.5">
                        Mat: {enfermero.matricula}
                    </p>
                )}
                {superaLimite ? (
                    <span className="text-xs text-amber-400 font-medium mt-0.5">
                        ⚠ {horasSemanales}h
                    </span>
                ) : horasSemanales > 0 ? (
                    <span className="text-xs text-marca-muted mt-0.5">
                        {horasSemanales}h
                    </span>
                ) : null}
            </div>

            {/* Celdas */}
            <div className="flex flex-1">
                {diasSemana.map(dia => {
                    const celdaId = `${enfermero.id}|${dia.id}`
                    const turnos = turnosAsignados[celdaId] ?? []
                    const bloqueada = estaBloqueada(enfermero.id, dia.id)

                    return (
                        <div key={celdaId} className="flex-1 border-r border-marca-border last:border-r-0">
                            <CeldaTurno
                                celdaId={celdaId}
                                turnos={turnos}
                                bloqueada={bloqueada}
                                onEliminar={onEliminarTurno}
                                onAbrirBottomSheet={onAbrirBottomSheet}
                            />
                        </div>
                    )
                })}
            </div>

        </div>
    )
}