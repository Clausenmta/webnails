
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
      // Using a more aggressive type assertion by casting the entire supabase client
      const result = (await (supabase as any)
        .rpc('get_expense_categories'));
      
      const { data, error } = result;
      
      if (error) {
        console.error("Error fetching categories:", error);
        toast.error(`Error: ${error.message}`);
        return [];
      }
      
      // If no data is returned, provide a fallback to avoid null reference errors
      if (!data) {
        console.warn("No categories found, using direct query fallback");
        // Use a direct query as fallback with more aggressive type assertion
        const fallbackResult = await (supabase as any)
          .from('expense_categories')
          .select('*');
          
        const { data: directData, error: directError } = fallbackResult;
          
        if (directError) {
          console.error("Error in fallback query:", directError);
          return [];
        }
        
        return (directData || []) as ExpenseCategory[];
      }
      
      return data as ExpenseCategory[];
    } catch (error) {
      console.error("Error in fetchCategories:", error);
      toast.error(`Error fetching categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }
};
