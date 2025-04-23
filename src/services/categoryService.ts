
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
      // Using a more generic approach with rpc to avoid TypeScript errors
      const { data, error } = await supabase
        .rpc('get_expense_categories') as { data: ExpenseCategory[] | null, error: any };
      
      if (error) {
        console.error("Error fetching categories:", error);
        toast.error(`Error: ${error.message}`);
        return [];
      }
      
      // If no data is returned, provide a fallback to avoid null reference errors
      if (!data) {
        console.warn("No categories found, using direct query fallback");
        // Use a direct query as fallback
        const { data: directData, error: directError } = await supabase
          .from('expense_categories')
          .select('*') as unknown as { data: ExpenseCategory[] | null, error: any };
          
        if (directError) {
          console.error("Error in fallback query:", directError);
          return [];
        }
        
        return directData || [];
      }
      
      return data;
    } catch (error) {
      console.error("Error in fetchCategories:", error);
      toast.error(`Error fetching categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }
};
