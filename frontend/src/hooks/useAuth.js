// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { supabase } from "../supabase/client"; 

// MODO DESARROLLO
const DEV_MODE = import.meta.env.DEV && import.meta.env.VITE_ALLOW_DEV_AUTH === 'true'; // true en npm run dev, false en build
const DEV_ROL = "enfermero"; // cambiá acá para probar otros roles

export function useAuth() {
  // Saltea todo Supabase mientras desarrollás
  if (DEV_MODE) {
    return {
      session: { user: { email: "dev@test.com" } },
      rol: DEV_ROL,
      cargando: false,
      cerrarSesion: () => console.log("DEV_MODE: cerrarSesion deshabilitado"),
    };
  }

  // ── PRODUCCIÓN: lógica real con Supabase ──────────────────────────
  const [session, setSession] = useState(undefined);
  const [rol, setRol] = useState(null);
  const [cargando, setCargando] = useState(true);

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
  async function cargarRol(userId) {
    setCargando(true);
    const { data, error } = await supabase
      .from("enfermeros")
      .select("rol")
      .eq("id", userId)
      .single();

    if (error) console.error("Error cargando perfil:", error.message);
    setRol(data?.rol ?? null);
    setCargando(false);
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
  }

  return { session, rol, cargando, cerrarSesion };
}
