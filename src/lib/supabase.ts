
import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase-types'

// Valores predeterminados para desarrollo local
// Estos deben ser reemplazados por tus propias credenciales de Supabase
const FALLBACK_URL = 'https://tu-proyecto.supabase.co';
const FALLBACK_KEY = 'tu-clave-anon-publica';

// Intenta usar las variables de entorno, o usa los valores predeterminados
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

// Crea y exporta el cliente de Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Función de utilidad para comprobar si Supabase está configurado correctamente
export const isSupabaseConfigured = () => {
  return supabaseUrl !== FALLBACK_URL && supabaseAnonKey !== FALLBACK_KEY;
};
