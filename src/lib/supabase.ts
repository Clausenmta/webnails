
import { supabase } from "@/integrations/supabase/client";

// This file provides backward compatibility for services 
// that were previously using the old supabase client

export { supabase };

// Utility function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  // Supabase is always configured in this project
  return true;
};
