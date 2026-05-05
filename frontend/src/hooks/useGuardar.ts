import { useState } from "react";
import { supabase } from "../supabase/client";

type ResultadoGuardado = { ok: boolean; error?: string }

export function useGuardar() {
    const [guardando, setGuardando] = useState(false);

    async function invocarEdgeFunction(payload: object): Promise<ResultadoGuardado> {
        setGuardando(true);
        try {
            const { data, error: fnErr } = await supabase.functions.invoke('guardar-planificacion', { body: payload });

            // Error de red / función no encontrada / error HTTP
            if (fnErr) {
                console.error('[useGuardar] edge function error:', fnErr);
                return { ok: false, error: fnErr.message };
            }

            // La edge function devuelve { error: '...' } cuando algo falla internamente
            if (data?.error) {
                console.error('[useGuardar] error desde edge function:', data.error);
                return { ok: false, error: data.error };
            }

            return { ok: true };
        } catch (e: any) {
            const msg = e.message ?? 'Error inesperado.';
            console.error('[useGuardar] catch:', msg);
            return { ok: false, error: msg };
        } finally {
            setGuardando(false);
        }
    }

    function guardarBorrador(
        turnosAsignados: Record<string, any[]>,
        sectorId: number,
        fechaMes: Date,
        hospitalId: number
    ): Promise<ResultadoGuardado> {
        return invocarEdgeFunction({
            mes:        fechaMes.getMonth() + 1,
            anio:       fechaMes.getFullYear(),
            modo:       'borrador',
            id_sector:  sectorId,
            id_hospital: hospitalId,
            estado_json: turnosAsignados,
        });
    }

    function guardarPlanificacion(
        turnosAsignados: Record<string, any[]>,
        sectorId: number,
        fechaMes: Date,
        hospitalId: number
    ): Promise<ResultadoGuardado> {
        return invocarEdgeFunction({
            mes:        fechaMes.getMonth() + 1,
            anio:       fechaMes.getFullYear(),
            modo:       'planificacion',
            id_sector:  sectorId,
            id_hospital: hospitalId,
            estado_json: turnosAsignados,
        });
    }

    return { guardarBorrador, guardarPlanificacion, guardando };
}