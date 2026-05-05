import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";

// Forma aplanada del enfermero con su contrato laboral
export type MiembroEquipo = {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
    matricula: string | null;
    especialidad: string | null;
    rol: string;
    estado: string;
    trabaja_en: {
        enfermero_id: string;
        activo: boolean;
        hospitales: { id: number; nombre: string } | null;
        sectores: { id: number; nombre: string } | null;
    }[];
};

export function useEquipo(jefeID: string | undefined) {
    const [enfermeros, setEnfermeros] = useState<MiembroEquipo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [hospitales, setHospitales] = useState<{ id: number; nombre: string }[]>([]);
    const [sectores, setSectores] = useState<{ id: number; nombre: string }[]>([]);

    useEffect(() => {
        cargarDatos();
    }, [jefeID]);

    async function cargarDatos() {
        setCargando(true);
        if (!jefeID) return;

        try {
            // 1. Contratos donde este jefe figura como id_jefe
            const { data: contratos, error: contratosErr } = await supabase
                .from('trabaja_en')
                .select(`
                    enfermero_id,
                    activo,
                    hospitales(id, nombre),
                    sectores(id, nombre)
                `)
                .eq('id_jefe', jefeID);

            if (contratosErr) throw contratosErr;
            if (!contratos?.length) {
                setEnfermeros([]);
                setCargando(false);
                return;
            }

            // 2. Datos personales de esos enfermeros
            const ids = [...new Set(contratos.map(c => c.enfermero_id))];
            const { data: perfiles, error: perfilesErr } = await supabase
                .from('enfermeros')
                .select('id, nombre, apellido, dni, matricula, especialidad, rol, estado')
                .in('id', ids)
                .order('apellido');

            if (perfilesErr) throw perfilesErr;

            // 3. Combinar: misma forma que antes para no romper componentes
            const combinados: MiembroEquipo[] = (perfiles ?? []).map(e => ({
                ...e,
                trabaja_en: contratos.filter(c => c.enfermero_id === e.id) as any,
            }));

            setEnfermeros(combinados);

            // 4. Hospitales y sectores disponibles para los filtros
            const { data: hosp } = await supabase.from('hospitales').select('id, nombre');
            const { data: sect } = await supabase.from('sectores').select('id, nombre');
            if (hosp) setHospitales(hosp);
            if (sect) setSectores(sect);

        } catch (error) {
            console.error('useEquipo error:', error);
        } finally {
            setCargando(false);
        }
    }

    async function toggleBaja(enfermero: MiembroEquipo) {
        // Ahora damos de baja el "contrato" con este jefe, no el usuario entero
        const contrato = enfermero.trabaja_en[0];
        if (!contrato) return { error: "No se encontró el contrato." };

        const nuevo_estado = !contrato.activo;
        
        // Usamos una RPC para saltear la restricción de RLS sobre los UPDATE
        const { error } = await supabase.rpc('toggle_baja_contrato', {
            p_enfermero_id: enfermero.id,
            p_jefe_id: jefeID,
            p_nuevo_estado: nuevo_estado
        });

        if (error) {
            console.error("Detalle del error RPC:", error);
            return { error: error.message || JSON.stringify(error) };
        }

        cargarDatos();
        return { error: null };
    }

    return { enfermeros, hospitales, sectores, cargando, recargar: cargarDatos, toggleBaja };
}
