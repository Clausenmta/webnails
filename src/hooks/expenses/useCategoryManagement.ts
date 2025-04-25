
import { useQuery } from "@tanstack/react-query";
import { categoryService, ExpenseCategory } from "@/services/categoryService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";

export function useCategoryManagement() {
  const { isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  
  const { data: categories = [], isLoading: isCategoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: categoryService.fetchCategories,
    retry: 3,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Log for debugging
  useEffect(() => {
    console.log("Categories from query:", categories);
    console.log("Categories loading:", isCategoriesLoading);
    console.log("Categories error:", categoriesError);
    
    if (categories.length === 0 && !isCategoriesLoading) {
      console.warn("No expense categories loaded. This could be due to an empty database or a fetch issue.");
    }
  }, [categories, isCategoriesLoading, categoriesError]);

  const availableCategories = isSuperAdmin 
    ? categories 
    : categories.filter(cat => cat.access_level === 'all');

  useEffect(() => {
    console.log("Available categories for current user:", availableCategories);
  }, [availableCategories]);

  return {
    categories,
    availableCategories,
    isCategoriesLoading
  };
}
