
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Expense, NewExpense } from "@/types/expenses";
import { expenseService } from "@/services/expenseService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { exportReport } from "@/utils/reportExport";

export function useExpenseManagement() {
  const { user, isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  const queryClient = useQueryClient();
  
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

  // Filtrar gastos según el rol del usuario
  const filteredExpenses = isSuperAdmin 
    ? expenses 
    : expenses.filter(expense => expense.created_by === user?.username);

  const handleViewExpense = (expense: Expense) => {
    setCurrentExpense(expense);
    setIsViewExpenseOpen(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    // Verificar si el usuario puede eliminar este gasto
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
    isLoading,
    isSuperAdmin,
    
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
