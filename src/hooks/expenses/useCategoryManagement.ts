
import { useQuery } from "@tanstack/react-query";
import { categoryService, ExpenseCategory } from "@/services/categoryService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useCategoryManagement() {
  const { isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: categoryService.fetchCategories,
    retry: 3,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: any) => {
        console.error("Error fetching expense categories:", error);
        toast.error(`Error al cargar categorías: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  });

  const availableCategories = isSuperAdmin 
    ? categories 
    : categories.filter(cat => cat.access_level === 'all');

  return {
    categories,
    availableCategories,
    isCategoriesLoading
  };
}
