// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";
import { Session } from "@supabase/supabase-js";

export function useAuth() {

  // ── PRODUCCIÓN ──────────────────────────
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [rol, setRol] = useState<'jefe' | 'enfermero' | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    // 1. Sesión que ya existe (guardada en localStorage por Supabase)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) cargarRol(session.user.id);
      else setCargando(false);
    });

    // 2. Escucha cambios: login, logout, token vencido
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) cargarRol(session.user.id);
      else {
        setRol(null);
        setCargando(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Busca el rol en la tabla 'perfiles' de Supabase
  async function cargarRol(userId: string) {
    const { data, error } = await supabase
      .from("enfermeros")
      .select("rol")
      .eq("id", userId)
      .single();

    if (error || !data) {
      if (error) console.error("Error cargando perfil:", error.message);
      setRol(null);
    } else {
      setRol((data as any).rol as 'jefe' | 'enfermero' | null);
    }
    setCargando(false);
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
  }

  return { session, rol, cargando, cerrarSesion };
}
