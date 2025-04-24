
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
      // Using a more aggressive type assertion - cast the entire function call
      const result = await supabase.rpc('get_expense_categories');
      const { data, error } = result as unknown as { data: ExpenseCategory[] | null; error: any };
      
      if (error) {
        console.error("Error fetching categories:", error);
        toast.error(`Error: ${error.message}`);
        return [];
      }
      
      // If no data is returned, provide a fallback to avoid null reference errors
      if (!data) {
        console.warn("No categories found, using direct query fallback");
        // Use a direct query as fallback with more aggressive type assertion
        const fallbackResult = await supabase.from('expense_categories').select('*');
        const { data: directData, error: directError } = fallbackResult as unknown as { 
          data: ExpenseCategory[] | null; 
          error: any 
        };
          
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
