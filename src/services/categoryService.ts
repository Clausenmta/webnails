
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface ExpenseCategory {
  id: number;
  name: string;
  access_level: 'all' | 'superadmin';
}

export const categoryService = {
  async fetchCategories(): Promise<ExpenseCategory[]> {
    try {
      console.log("Fetching expense categories from database...");
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("No active session found when fetching categories");
        toast.error("Error: No hay sesión activa");
        return [];
      }
      
      // Add 2-second delay to ensure we're properly authorized
      // This helps resolve timing issues with token validation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Make sure we have a valid session token before proceeding
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error("Error refreshing session:", refreshError);
        toast.error(`Error de sesión: ${refreshError.message}`);
        return [];
      }
      
      // Fetch categories with explicit timeout
      const { data, error } = await Promise.race([
        supabase
          .from('expense_categories')
          .select('*')
          .order('name'),
        new Promise<{data: null, error: Error}>((_, reject) => 
          setTimeout(() => reject({data: null, error: new Error('Timeout fetching categories')}), 10000)
        )
      ]) as any;
      
      if (error) {
        console.error("Error fetching categories:", error);
        toast.error(`Error: ${error.message}`);
        return [];
      }
      
      // If no data, create some default categories
      if (!data || data.length === 0) {
        console.warn("No categories found in database, creating defaults");
        
        // Default categories to use when none exist
        const defaultCategories: ExpenseCategory[] = [
          { id: 1, name: "Fijos", access_level: "all" },
          { id: 2, name: "Servicios", access_level: "all" },
          { id: 3, name: "Impuestos y Tasas", access_level: "all" },
          { id: 4, name: "Mantenimiento", access_level: "all" },
          { id: 5, name: "Sueldos", access_level: "superadmin" },
          { id: 6, name: "Varios", access_level: "all" }
        ];
        
        // Attempt to insert defaults (ignoring errors)
        try {
          for (const category of defaultCategories) {
            await supabase
              .from('expense_categories')
              .insert(category);
          }
          console.log("Created default categories successfully");
          return defaultCategories;
        } catch (insertError) {
          console.error("Error creating default categories:", insertError);
          // Return hardcoded defaults even if insert fails
          return defaultCategories;
        }
      }
      
      console.log(`Categories fetched successfully: ${data.length}`, data);
      return data as ExpenseCategory[];
    } catch (error) {
      console.error("Exception in fetchCategories:", error);
      toast.error(`Error fetching categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Return basic hardcoded defaults as fallback
      return [
        { id: 1, name: "Fijos", access_level: "all" },
        { id: 2, name: "Servicios", access_level: "all" },
        { id: 6, name: "Varios", access_level: "all" }
      ];
    }
  }
};
