// src/hooks/useTheme.js
import { useState, useEffect } from "react";

export function useTheme() {
  // Detecta preferencia del SO
  const prefiereDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;

  // Busca si el usuario ya eligió algo antes, si no usa el SO
  const [dark, setDark] = useState(
    () =>
      localStorage.getItem("tema") === "dark" ||
      (localStorage.getItem("tema") === null && prefiereDark),
  );

  useEffect(() => {
    // Agrega o saca la clase 'dark' del <html>
    document.documentElement.classList.toggle("dark", dark);
    // Guarda la preferencia
    localStorage.setItem("tema", dark ? "dark" : "light");
  }, [dark]);

  // Escucha cambios del SO (si el usuario no eligió manualmente)
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
