
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
      // Using a simple query with more aggressive type casting
      const { data, error } = await (supabase
        .from('expense_categories')
        .select('*')
        .order('name') as any);
      
      if (error) {
        console.error("Error fetching categories:", error);
        toast.error(`Error: ${error.message}`);
        return [];
      }
      
      return (data || []) as ExpenseCategory[];
    } catch (error) {
      console.error("Error in fetchCategories:", error);
      toast.error(`Error fetching categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }
};
