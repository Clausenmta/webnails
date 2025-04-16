
import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase-types'

// Estas URLs y claves las obtendrás de tu proyecto de Supabase
// Ve a Configuración del proyecto > API para obtenerlas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

