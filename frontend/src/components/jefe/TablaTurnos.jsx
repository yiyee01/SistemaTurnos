// src/components/jefe/TablaTurnos.jsx
import { FilaEnfermero } from './FilaEnfermero'

export function TablaTurnos({
    enfermeros,
    diasSemana,
    turnosAsignados,
    limiteHoras,
    calcularHoras,
    estaBloqueada,
    onEliminarTurno,
    onAbrirBottomSheet,
}) {
    return (
        // Un solo contenedor con overflow-x — todo scrollea junto
        <div className="rounded-xl border border-marca-border overflow-x-auto scrollbar-marca">
            <div className="min-w-[600px]">

                {/* Cabecera */}
                <div className="flex bg-marca-surface2 border-b border-marca-border">

                    {/* Columna nombre — sticky */}
                    <div className="w-32 shrink-0 p-3 text-xs font-medium
                          uppercase tracking-widest text-marca-muted
                          border-r border-marca-border
                          sticky left-0 bg-marca-surface2 z-10">
                        Enfermero
                    </div>

                    {/* Días */}
                    <div className="flex flex-1">
                        {diasSemana.map(dia => (
                            <div key={dia.id}
                                className="flex-1 p-3 text-center border-r border-marca-border last:border-r-0">
                                <p className="text-xs font-medium text-marca-muted uppercase tracking-widest">
                                    {dia.nombre}
                                </p>
                                <p className="text-base font-medium text-marca-pale">
                                    {dia.numero}
                                </p>
                            </div>
                        ))}
                    </div>

                </div>

                {/* Filas */}
                <div className="divide-y divide-marca-border">
                    {enfermeros.map(enfermero => (
                        <FilaEnfermero
                            key={enfermero.id}
                            enfermero={enfermero}
                            diasSemana={diasSemana}
                            turnosAsignados={turnosAsignados}
                            horasSemanales={calcularHoras(enfermero.id)}
                            limiteHoras={limiteHoras}
                            estaBloqueada={estaBloqueada}
                            onEliminarTurno={onEliminarTurno}
                            onAbrirBottomSheet={onAbrirBottomSheet}
                        />
                    ))}
                </div>

            </div>
        </div>
    )
}