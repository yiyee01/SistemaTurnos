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
export function useTurnos(id_enfermero: string | undefined, id_hospital: number, id_sector: number) {
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargar_turnos(); //Primer argumento, funcion que se llama ni bien se invoque useTurnos
    }, [id_enfermero, id_hospital, id_sector]); //Segundo argumento, array de dependencias, si cambia alguno de estos, se vuelve a ejecutar la funcion del primer argumento

    async function cargar_turnos() {
        setCargando(true);
        if (!id_enfermero) {
            return;
        }
        try {
            const { data: turnos, error: error_turnos } = await supabase
                .from('turnos_asignados')
                .select(`fecha, hospitales(id, nombre),
                        sectores(id, nombre),
                        tipos_turno(id, cod, hora_inicio, hora_fin),
                        enfermero:enfermeros!fk_turno_enfermero(id, nombre, matricula)`)
                .eq('enfermero_id', id_enfermero)
                .eq('hospital_id', id_hospital)
                .eq('sector_id', id_sector)
                .order('fecha', { ascending: true })

            if (error_turnos) {
                throw error_turnos;
            }
            if (turnos) {
                console.log("No hay turnos pa:" + turnos);
                setTurnos(turnos as unknown as Turno[]);
                setCargando(false);
            }
        } catch (error) {
            console.error("Houston, tenemos un problema:", error);
        } finally {
            setCargando(false);
        }
    }

    return { turnos, cargando, recargar: cargar_turnos };
}