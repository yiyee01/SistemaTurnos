import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/database.types";

export type Turno = {
    fecha: string;
    hospitales: { id: number; nombre: string } | null;
    sectores: { id: number; nombre: string } | null;
    tipos_turno: { id: number; cod: string; hora_inicio: string | null; hora_fin: string | null } | null;
}

//Aca obtenemos los turnos de un enfermero para un hospital y sector
// mes: 1–12, anio: ej 2026 — si se proveen, filtra solo ese mes
export function useTurnos(
    id_enfermero: string | undefined,
    id_hospital: number,
    id_sector: number,
    mes?: number,
    anio?: number
) {
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargar_turnos();
    }, [id_enfermero, id_hospital, id_sector, mes, anio]);

    async function cargar_turnos() {
        setCargando(true);
        if (!id_enfermero || !id_hospital || !id_sector) {
            setTurnos([]);
            setCargando(false);
            return;
        }
        try {
            let query = supabase
                .from('turnos_asignados')
                .select(`fecha,
                        hospitales(id, nombre),
                        sectores(id, nombre),
                        tipos_turno(id, cod, hora_inicio, hora_fin)`)
                .eq('enfermero_id', id_enfermero)
                .eq('hospital_id', id_hospital)
                .eq('sector_id', id_sector)
                .order('fecha', { ascending: true })

            // Filtro por mes/año si se proveen (evita cargar todo el historial)
            if (mes && anio) {
                const primerDia = `${anio}-${String(mes).padStart(2, '0')}-01`
                const ultimoDia = new Date(anio, mes, 0).getDate()  // día 0 del mes siguiente = último día
                const ultimoDiaStr = `${anio}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`
                query = query.gte('fecha', primerDia).lte('fecha', ultimoDiaStr)
            }

            const { data, error } = await query
            if (error) throw error;
            setTurnos((data ?? []) as unknown as Turno[]);
        } catch (error) {
            console.error('useTurnos error:', error);
        } finally {
            setCargando(false);
        }
    }

    return { turnos, cargando, recargar: cargar_turnos };
}