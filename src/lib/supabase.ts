
import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase-types'

// Obtiene las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica que las credenciales estén disponibles
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan las credenciales de Supabase. Asegúrate de configurar las variables de entorno correctamente.');
}

// Crea y exporta el cliente de Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Función de utilidad para comprobar si Supabase está configurado correctamente
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};
