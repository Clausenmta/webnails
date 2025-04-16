
import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase-types'

// Obtiene las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YW1wbGUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjI4MDczMiwiZXhwIjoxOTMxODU2NzMyfQ.example';

// Verifica e informa si se están usando credenciales reales o de ejemplo
if (supabaseUrl === 'https://example.supabase.co') {
  console.warn('Utilizando URL de ejemplo para Supabase. La aplicación operará en modo simulación.');
}

// Crea y exporta el cliente de Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Función de utilidad para comprobar si Supabase está configurado correctamente
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://example.supabase.co';
};
