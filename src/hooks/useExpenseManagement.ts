
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

/**
 * Filtra los gastos según el rol y las categorías permitidas para el usuario.
 * @param expenses Lista total de gastos
 * @param isSuperAdmin ¿El usuario es superadmin?
 * @param username Nombre de usuario del usuario actual
 * @param allowedCategories Lista de nombres de las categorías permitidas para usuarios normales
 * @returns Lista de gastos filtrados según las reglas de visibilidad
 */
function filterExpensesByRole(
  expenses: Expense[],
  isSuperAdmin: boolean,
  username: string | undefined,
  allowedCategories: string[] | null
) {
  if (isSuperAdmin) return expenses;
  if (!username || !allowedCategories) return [];
  // Solo mostrar los gastos creados por el usuario y de categorías habilitadas
  return expenses.filter(
    expense =>
      expense.created_by === username &&
      allowedCategories.includes(expense.category)
  );
}

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

  // Construye las categorías permitidas por el usuario (solo nombre)
  const allowedCategoryNames = isSuperAdmin
    ? null
    : availableCategories.filter(cat => cat.access_level === 'all').map(cat => cat.name);

  // Lógica centralizada de filtrado para reusabilidad y claridad
  const filteredExpensesForUser = filterExpensesByRole(
    expenses,
    isSuperAdmin,
    user?.username,
    allowedCategoryNames
  );

  // Pasa el resultado filtrado al hook de filtros de gastos
  const {
    filters,
    setFilters,
    uniqueProviders,
    uniqueUsers,
    filteredExpenses,
    filteredExpensesPrevMonth
  } = useExpenseFilters(filteredExpensesForUser);

  const { addExpenseMutation, deleteExpenseMutation, markAsPaidMutation } = useExpenseMutations();

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

  const handleMarkAsPaid = (expenseId: number) => {
    markAsPaidMutation.mutate(expenseId);
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
    markAsPaidMutation,
    
    handleViewExpense,
    handleDeleteExpense,
    confirmDeleteExpense,
    handleMarkAsPaid,
    handleExportReport
  };
}
