
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Expense } from "@/types/expenses";
import { expenseService } from "@/services/expenseService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { exportReport } from "@/utils/reportExport";
import { useCategoryManagement } from "./expenses/useCategoryManagement";
import { useExpenseFilters } from "./expenses/useExpenseFilters";
import { useExpenseMutations } from "./expenses/useExpenseMutations";
import { ExpenseCategory } from "@/services/categoryService";

export function useExpenseManagement() {
  const { user, isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isViewExpenseOpen, setIsViewExpenseOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const { availableCategories } = useCategoryManagement();

  // -------- NEW: build allowed categories for easy lookup ----------
  const allowedCategoryNames = isSuperAdmin
    ? null // no filter for superadmin
    : availableCategories.filter(cat => cat.access_level === 'all').map(cat => cat.name);

  // -------- NEW: Filter expenses for current user profile ----------
  // Si es superadmin: ve todo. Si NO, ve solo los que creo él y de categorías permitidas.
  const filteredExpensesForUser = isSuperAdmin
    ? expenses
    : expenses.filter(expense =>
        expense.created_by === user?.username &&
        allowedCategoryNames?.includes(expense.category)
      );

  // --------- Filtros y helpers de la lógica original, pero usando este nuevo array filtrado -----------
  const {
    filters,
    setFilters,
    uniqueProviders,
    uniqueUsers,
    filteredExpenses,
    filteredExpensesPrevMonth
  } = useExpenseFilters(filteredExpensesForUser);

  const { addExpenseMutation, deleteExpenseMutation } = useExpenseMutations();

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
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
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
