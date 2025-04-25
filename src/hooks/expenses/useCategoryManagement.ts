
import { useQuery } from "@tanstack/react-query";
import { categoryService, ExpenseCategory } from "@/services/categoryService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export function useCategoryManagement() {
  const { isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  const [localCategories, setLocalCategories] = useState<ExpenseCategory[]>([]);
  
  const { data: categories = [], isLoading: isCategoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: categoryService.fetchCategories,
    retry: 5, // Increased retries
    retryDelay: attempt => Math.min(attempt > 1 ? 2000 * 2 ** attempt : 1000, 30000),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Set up local fallback categories if needed
  useEffect(() => {
    if (categories.length === 0 && !isCategoriesLoading) {
      console.log("Setting up fallback categories");
      setLocalCategories([
        { id: 1, name: "Fijos", access_level: "all" },
        { id: 2, name: "Servicios", access_level: "all" },
        { id: 3, name: "Varios", access_level: "all" }
      ]);
    } else if (categories.length > 0) {
      console.log("Using fetched categories:", categories);
      setLocalCategories(categories);
    }
  }, [categories, isCategoriesLoading]);

  // Detailed logging for debugging
  useEffect(() => {
    console.log("---- CATEGORY MANAGEMENT DEBUG ----");
    console.log("Categories from query:", categories);
    console.log("Local categories:", localCategories);
    console.log("Categories loading:", isCategoriesLoading);
    console.log("Categories error:", categoriesError);
    console.log("User is superadmin:", isSuperAdmin);
    
    if (categories.length === 0 && !isCategoriesLoading) {
      console.warn("No expense categories loaded from database");
    }
  }, [categories, localCategories, isCategoriesLoading, categoriesError, isSuperAdmin]);

  // Filter categories based on user role
  const availableCategories = isSuperAdmin 
    ? localCategories 
    : localCategories.filter(cat => cat.access_level === 'all');

  return {
    categories: localCategories,
    availableCategories,
    isCategoriesLoading
  };
}
