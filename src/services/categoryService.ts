
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
        return [];
      }
      
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching categories:", error);
        toast.error(`Error: ${error.message}`);
        return [];
      }
      
      if (!data || data.length === 0) {
        console.warn("No categories found in database");
      } else {
        console.log(`Categories fetched successfully: ${data.length}`, data);
      }
      
      return (data || []) as ExpenseCategory[];
    } catch (error) {
      console.error("Exception in fetchCategories:", error);
      toast.error(`Error fetching categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }
};
