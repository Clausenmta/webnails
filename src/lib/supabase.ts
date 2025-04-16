
import { supabase } from "@/integrations/supabase/client";

// This file provides backward compatibility for services 
// that were previously using the old supabase client

export { supabase };

// Función para comprobar si la sesión está activa
export const isUserAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Utility function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  // Supabase is always configured in this project
  return true;
};
