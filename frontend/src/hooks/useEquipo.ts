import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import type { Database } from "../supabase/database.types";

export type MiembroEquipo = Database['public']['Tables']['enfermeros']['Row'] & {
    trabaja_en: {
        hospitales: { id: number, nombre: string } | null;
        sectores: { id: number, nombre: string } | null;
    }[]
};

export function useEquipo(jefeID: string | undefined) {
    const [enfermeros, setEnfermeros] = useState<MiembroEquipo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [hospitales, setHospitales] = useState<{ id: number; nombre: string }[]>([]);
    const [sectores, setSectores] = useState<{ id: number, nombre: string }[]>([]);

    useEffect(() => {
        cargarDatos();
    }, [jefeID]);

    async function cargarDatos() {
        setCargando(true)
        if (!jefeID)
            return;
        try {
            const { data: datos_enfermeros, error: error_enfermero } = await supabase
                .from('enfermeros')
                .select(`id, nombre, apellido, dni, especialidad, id_jefe, matricula, rol, estado,
                    trabaja_en(
                                sector_id, 
                                hospitales(id, nombre),
                                sectores(id, nombre)
                                )`
                )
                .eq('id_jefe', jefeID)
                .eq('estado', "activo")
                .order('apellido');

            if (error_enfermero) throw error_enfermero;
            const { data: hosp } = await supabase.from('hospitales').select('id, nombre');
            const { data: sect } = await supabase.from('sectores').select('id, nombre');

            if (hosp) setHospitales(hosp);
            if (sect) setSectores(sect);
            if (datos_enfermeros) {
                setEnfermeros(datos_enfermeros as unknown as MiembroEquipo[]);
            }
            setCargando(false)

        } catch (error) {
            console.error("Houston, tenemos un problema:", error);
        } finally {
            setCargando(false);
        }
    }

    async function toggleBaja(enfermero: MiembroEquipo) {
        const nuevo_estado = enfermero.estado === 'activo' ? 'inactivo' : 'activo';
        const { error } = await supabase
            .from('enfermeros')
            .update({
                estado: nuevo_estado
            })
            .eq('id', enfermero.id);
        if (!error) {
            cargarDatos();
        }
        return { error };
    }

    return { enfermeros, hospitales, sectores, cargando, recargar: cargarDatos, toggleBaja };
}
