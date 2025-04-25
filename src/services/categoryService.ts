
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
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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

      // Mapeo explícito para tipos estrictos TS
      const mapped = (data || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        access_level: cat.access_level === "all" ? "all" : "superadmin"
      })) as ExpenseCategory[];
      
      if (!mapped || mapped.length === 0) {
        console.warn("No categories found in database, creating defaults");
        const defaultCategories: ExpenseCategory[] = [
          { id: 1, name: "Fijos", access_level: "all" },
          { id: 2, name: "Servicios", access_level: "all" },
          { id: 3, name: "Impuestos y Tasas", access_level: "superadmin" },
          { id: 4, name: "Mantenimiento", access_level: "all" },
          { id: 5, name: "Sueldos", access_level: "superadmin" },
          { id: 6, name: "Varios", access_level: "all" },
          { id: 7, name: "Honorarios", access_level: "superadmin" },
          { id: 8, name: "Cargas Sociales", access_level: "superadmin" },
          { id: 9, name: "Proveedores", access_level: "superadmin" },
          { id: 10, name: "Insumos generales", access_level: "all" },
          { id: 11, name: "Marketing", access_level: "superadmin" },
          { id: 12, name: "Ingresos", access_level: "superadmin" },
        ];
        return defaultCategories;
      }
      
      console.log(`Categories fetched successfully: ${mapped.length}`, mapped);
      return mapped;
    } catch (error) {
      console.error("Exception in fetchCategories:", error);
      toast.error(`Error fetching categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Return basic hardcoded defaults as fallback
      return [
        { id: 1, name: "Fijos", access_level: "all" },
        { id: 2, name: "Servicios", access_level: "all" },
        { id: 3, name: "Impuestos y Tasas", access_level: "superadmin" },
        { id: 4, name: "Mantenimiento", access_level: "all" },
        { id: 5, name: "Sueldos", access_level: "superadmin" },
        { id: 6, name: "Varios", access_level: "all" },
        { id: 7, name: "Honorarios", access_level: "superadmin" },
        { id: 8, name: "Cargas Sociales", access_level: "superadmin" },
        { id: 9, name: "Proveedores", access_level: "superadmin" },
        { id: 10, name: "Insumos generales", access_level: "all" },
        { id: 11, name: "Marketing", access_level: "superadmin" },
        { id: 12, name: "Ingresos", access_level: "superadmin" },
      ];
    }
  }
};
