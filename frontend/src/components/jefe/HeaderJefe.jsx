// src/components/jefe/HeaderJefe.jsx
import { HeaderJefeDesktop } from './HeaderJefeDesktop'
import { HeaderJefeMobile } from './HeaderJefeMobile'

export function HeaderJefe({
    semana,
    limiteHoras,
    onCambiarLimite,
    onGuardar,
    onPublicar,
    onCerrarSesion,
    onSemanaAnterior,
    onSemanaSiguiente,
    onMiEquipo,
    onHistorial,
}) {
    return (
        <>
            <HeaderJefeDesktop
                semana={semana}
                limiteHoras={limiteHoras}
                onCambiarLimite={onCambiarLimite}
                onGuardar={onGuardar}
                onPublicar={onPublicar}
                onCerrarSesion={onCerrarSesion}
                onSemanaAnterior={onSemanaAnterior}
                onSemanaSiguiente={onSemanaSiguiente}
                onMiEquipo={onMiEquipo}
                onHistorial={onHistorial}
            />

            <HeaderJefeMobile
                semana={semana}
                onGuardar={onGuardar}
                onPublicar={onPublicar}
                onCerrarSesion={onCerrarSesion}
                onSemanaAnterior={onSemanaAnterior}
                onSemanaSiguiente={onSemanaSiguiente}
                onMiEquipo={onMiEquipo}
                onHistorial={onHistorial}
                limiteHoras={limiteHoras}
                onCambiarLimite={onCambiarLimite}
            />
        </>
    )
}