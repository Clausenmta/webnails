
import { createClient } from '@supabase/supabase-js'
import { Database } from './supabase-types'

const supabaseUrl = 'https://your-project-url.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
