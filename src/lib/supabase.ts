
import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase-types'

// Obtiene las variables de entorno
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica que las credenciales estén disponibles
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan las credenciales de Supabase. Asegúrate de configurar las variables de entorno correctamente.');
  // Proporciona valores de respaldo para evitar errores de inicialización
  supabaseUrl = 'https://example.supabase.co';
  supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjI4MDczMiwiZXhwIjoxOTMxODU2NzMyfQ.example';
  console.warn('Utilizando URL de ejemplo para Supabase. La aplicación operará en modo simulación.');
}

// Crea y exporta el cliente de Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Función de utilidad para comprobar si Supabase está configurado correctamente
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://example.supabase.co';
};
