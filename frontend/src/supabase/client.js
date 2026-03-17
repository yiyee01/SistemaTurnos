// src/supabase/client.js
//Aca llamamos al cliente con las keys que nos da supabase
import { createClient } from "@supabase/supabase-js";

// Vite expone las variables de entorno usando import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Instanciamos el cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
