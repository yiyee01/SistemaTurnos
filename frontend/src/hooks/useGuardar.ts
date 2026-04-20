import { useState } from "react";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/database.types";

// ── Tipos ──────────────────────────────────────────────────
export type Borrador = Database['public']['Tables']['borradores']['Insert'];

type ResultadoGuardado = { ok: boolean; error?: string }

// ── Hook ───────────────────────────────────────────────────
export function useGuardar() {
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function guardarBorrador(
        turnosAsignados: Record<string, any[]>,
        sectorId: number,
        lunesBase: Date,
        hospitalId: number
    ): Promise<ResultadoGuardado> {
        setGuardando(true);
        setError(null);
        try {
            const payload = {
                mes: lunesBase.getMonth() + 1,
                anio: lunesBase.getFullYear(),
                modo: 'borrador' as const,
                id_sector: sectorId,
                id_hospital: hospitalId,
                estado_json: turnosAsignados,
            };
            const { data, error: fnErr } = await supabase.functions.invoke('guardar-planificacion', { body: payload });
            if (fnErr) { setError(fnErr.message); return { ok: false, error: fnErr.message }; }
            if (data?.error) { setError(data.error); return { ok: false, error: data.error }; }
            return { ok: true };
        } catch (e: any) {
            const msg = e.message ?? 'Error inesperado.';
            setError(msg);
            return { ok: false, error: msg };
        } finally {
            setGuardando(false);
        }
    }

    async function guardarPlanificacion(
        turnosAsignados: Record<string, any[]>,
        sectorId: number,
        lunesBase: Date,
        hospitalId: number
    ): Promise<ResultadoGuardado> {
        setGuardando(true);
        setError(null);
        try {
            const payload = {
                mes: lunesBase.getMonth() + 1,
                anio: lunesBase.getFullYear(),
                modo: 'planificacion' as const,
                id_sector: sectorId,
                id_hospital: hospitalId,
                estado_json: turnosAsignados,
            };
            const { data, error: fnErr } = await supabase.functions.invoke('guardar-planificacion', { body: payload });
            if (fnErr) { setError(fnErr.message); return { ok: false, error: fnErr.message }; }
            if (data?.error) { setError(data.error); return { ok: false, error: data.error }; }
            return { ok: true };
        } catch (e: any) {
            const msg = e.message ?? 'Error inesperado.';
            setError(msg);
            return { ok: false, error: msg };
        } finally {
            setGuardando(false);
        }
    }

    return { guardarBorrador, guardarPlanificacion, guardando, error };
}