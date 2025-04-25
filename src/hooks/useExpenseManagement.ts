import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Expense, NewExpense, PaymentMethod } from "@/types/expenses";
import { expenseService } from "@/services/expenseService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { exportReport } from "@/utils/reportExport";
import { ExpensesFiltersState } from "@/components/expenses/ExpensesFilters";
import { categoryService, ExpenseCategory } from "@/services/categoryService";

export function useExpenseManagement() {
  const { user, isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  const queryClient = useQueryClient();
  
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isViewExpenseOpen, setIsViewExpenseOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Fetch expense categories with better error handling
  const { data: categories = [], isLoading: isCategoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: categoryService.fetchCategories,
    retry: 3, // Retry 3 times before giving up
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    meta: {
      onError: (error: any) => {
        console.error("Error fetching expense categories:", error);
        toast.error(`Error al cargar categorías: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
  });
  
  // Effect to log category fetching status
  useEffect(() => {
    console.log("Categories query state:", { 
      isLoading: isCategoriesLoading,
      error: categoriesError,
      categoriesCount: categories.length,
      categories
    });
  }, [categories, isCategoriesLoading, categoriesError]);
  
  // Filter categories based on user role
  const availableCategories = useMemo(() => {
    return isSuperAdmin 
      ? categories 
      : categories.filter(cat => cat.access_level === 'all');
  }, [categories, isSuperAdmin]);

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: expenseService.fetchExpenses,
    meta: {
      onError: (error: any) => {
        console.error("Error al obtener gastos:", error);
        toast.error(`Error al cargar gastos: ${(error as Error).message}`);
      }
    }
  });

  const [filters, setFilters] = useState<ExpensesFiltersState>(() => {
    const now = new Date();
    return {
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      concept: "",
      category: "",
      provider: "",
      payment_method: "",
      created_by: ""
    }
  });

  const uniqueProviders = useMemo(() => {
    const providers = expenses.map(e => e.provider).filter(Boolean);
    return Array.from(new Set(providers as string[]));
  }, [expenses]);

  const uniqueUsers = useMemo(() => {
    const users = expenses.map(e => e.created_by).filter(Boolean);
    return Array.from(new Set(users));
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      if (filters.date) {
        const [day, month, year] = expense.date.split("/");
        const expDate = new Date(Number(year), Number(month) - 1);
        if (
          expDate.getMonth() !== filters.date.getMonth() ||
          expDate.getFullYear() !== filters.date.getFullYear()
        ) return false;
      }
      if (filters.concept && !expense.concept?.toLowerCase().includes(filters.concept.toLowerCase())) return false;
      if (filters.category && expense.category !== filters.category) return false;
      if (filters.provider && expense.provider !== filters.provider) return false;
      if (filters.payment_method && expense.payment_method !== filters.payment_method) return false;
      if (filters.created_by && expense.created_by !== filters.created_by) return false;
      return true;
    });
  }, [expenses, filters]);

  const filteredExpensesPrevMonth = useMemo(() => {
    return expenses.filter(expense => {
      if (filters.date) {
        const d = filters.date;
        const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
        const [day, month, year] = expense.date.split("/");
        const expDate = new Date(Number(year), Number(month) - 1);
        return (
          expDate.getMonth() === prev.getMonth() &&
          expDate.getFullYear() === prev.getFullYear() &&
          (!filters.category || expense.category === filters.category)
        );
      }
      return false;
    });
  }, [expenses, filters]);

  const addExpenseMutation = useMutation({
    mutationFn: expenseService.addExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsAddExpenseOpen(false);
      toast.success("Gasto registrado correctamente");
    },
    onError: (error: any) => {
      console.error("Error al registrar el gasto:", error);
      toast.error(`Error al registrar el gasto: ${error.message}`);
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: number) => expenseService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
      toast.success("Gasto eliminado correctamente");
    },
    onError: (error: any) => {
      console.error("Error al eliminar el gasto:", error);
      toast.error(`Error al eliminar el gasto: ${error.message}`);
    }
  });

  const handleViewExpense = (expense: Expense) => {
    setCurrentExpense(expense);
    setIsViewExpenseOpen(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    if (isSuperAdmin || expense.created_by === user?.username) {
      setExpenseToDelete(expense);
      setIsDeleteDialogOpen(true);
    } else {
      toast.error("No tienes permisos para eliminar este gasto");
    }
  };

  const confirmDeleteExpense = () => {
    if (expenseToDelete) {
      deleteExpenseMutation.mutate(expenseToDelete.id);
    }
  };

  const handleExportReport = () => {
    const formattedExpenses = filteredExpenses.map(expense => ({
      Fecha: expense.date,
      Concepto: expense.concept,
      Categoría: expense.category,
      Proveedor: expense.provider || '',
      Medio_de_Pago: expense.payment_method || '',
      Monto: expense.amount,
      Registrado_por: expense.created_by,
      Detalles: expense.details || '',
      Estado: expense.status || ''
    }));

    exportReport(formattedExpenses, {
      filename: `Reporte_Gastos_${format(new Date(), 'yyyy-MM-dd')}`,
      format: 'excel'
    });
  };

  return {
    expenses,
    filteredExpenses,
    filteredExpensesPrevMonth,
    filters,
    setFilters,
    uniqueProviders,
    uniqueUsers,
    isLoading,
    isSuperAdmin,
    availableCategories,
    
    isAddExpenseOpen,
    setIsAddExpenseOpen,
    isViewExpenseOpen,
    setIsViewExpenseOpen,
    currentExpense,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    expenseToDelete,
    
    addExpenseMutation,
    
    handleViewExpense,
    handleDeleteExpense,
    confirmDeleteExpense,
    handleExportReport
  };
}
