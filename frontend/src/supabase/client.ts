// src/supabase/client.ts
//Aca llamamos al cliente con las keys que nos da supabase
import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types"; // Importamos los tipos

// Vite expone las variables de entorno usando import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Instanciamos el cliente, pero ahora con los TIPOS inyectados
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
