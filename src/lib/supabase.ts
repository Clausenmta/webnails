
import { supabase, getActiveSession } from "@/integrations/supabase/client";

// This file provides backward compatibility for services 
// that were previously using the old supabase client

export { supabase, getActiveSession };

// Función para comprobar si la sesión está activa
export const isUserAuthenticated = async (): Promise<boolean> => {
  try {
    const session = await getActiveSession();
    return !!session;
  } catch (error) {
    console.error("Error al verificar autenticación:", error);
    return false;
  }
};

// Utility function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return true;
};

// Helper function to ensure user is authenticated before performing database operations
export const ensureAuthenticated = async () => {
  const session = await getActiveSession();
  if (!session) {
    throw new Error("No hay sesión activa. Debe iniciar sesión para realizar esta operación.");
  }
  return session;
};
