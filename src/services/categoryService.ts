
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
      // Using type assertion to bypass TypeScript errors
      const result = await (supabase as any).from('expense_categories').select('*').order('name');
      
      const { data, error } = result;
      
      if (error) {
        console.error("Error fetching categories:", error);
        toast.error(`Error: ${error.message}`);
        return [];
      }
      
      // If no data is returned, provide an empty array
      if (!data || data.length === 0) {
        console.warn("No categories found");
        return [];
      }
      
      return data as ExpenseCategory[];
    } catch (error) {
      console.error("Error in fetchCategories:", error);
      toast.error(`Error fetching categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }
};
