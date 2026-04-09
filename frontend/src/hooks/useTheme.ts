// src/hooks/useTheme.js
import { useState, useEffect } from "react";

export function useTheme() {
  const [dark, setDark] = useState(() => {
    const guardado = localStorage.getItem("tema");

    // Si ya eligió algo → respetarlo
    if (guardado === "dark") return true;
    if (guardado === "light") return false;

    // Sin preferencia guardada → modo oscuro por defecto
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("tema", dark ? "dark" : "light");
  }, [dark]);

  // Escucha cambios del SO solo si el usuario nunca eligió manualmente
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (localStorage.getItem("tema") === null) {
        setDark(e.matches);
      }
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const toggleTema = () => setDark((d) => !d);

  return { dark, toggleTema };
}
