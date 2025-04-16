
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Expense, NewExpense } from "@/types/expenses";
import { expenseService } from "@/services/expenseService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

export function useExpenseManagement() {
  const { user, isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  const queryClient = useQueryClient();
  
  // Estados para diálogos
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isViewExpenseOpen, setIsViewExpenseOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Query para obtener gastos con mejor manejo de errores
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: expenseService.fetchExpenses,
    onSettled: (data, error) => {
      if (error) {
        console.error("Error al obtener gastos:", error);
        toast.error(`Error al cargar gastos: ${(error as Error).message}`);
      }
    }
  });

  // Mutación para agregar gastos con mejor manejo de errores
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

  // Mutación para eliminar gastos con mejor manejo de errores
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
    : expenses.filter(expense => 
        expense.created_by === user?.username || 
        (expense.category !== "Fijos" && expense.category !== "Proveedores")
      );

  const handleViewExpense = (expense: Expense) => {
    setCurrentExpense(expense);
    setIsViewExpenseOpen(true);
  };

  // Función para manejar la eliminación de gastos
  const handleDeleteExpense = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteDialogOpen(true);
  };

  // Función para confirmar la eliminación
  const confirmDeleteExpense = () => {
    if (expenseToDelete) {
      deleteExpenseMutation.mutate(expenseToDelete.id);
    }
  };

  const handleExportReport = () => {
    toast.success("Reporte de gastos exportado correctamente");
    
    // Simulación de descarga de archivo
    const dummyContent = "Reporte de Gastos\n\n" + 
      filteredExpenses.map(expense => 
        `${expense.date} - ${expense.concept} - $${expense.amount.toLocaleString()}`
      ).join('\n');
    
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Gastos_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return {
    // Estado y datos
    expenses,
    filteredExpenses,
    isLoading,
    isSuperAdmin,
    
    // Estado de diálogos
    isAddExpenseOpen,
    setIsAddExpenseOpen,
    isViewExpenseOpen,
    setIsViewExpenseOpen,
    currentExpense,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    expenseToDelete,
    
    // Mutaciones
    addExpenseMutation,
    
    // Manejadores de eventos
    handleViewExpense,
    handleDeleteExpense,
    confirmDeleteExpense,
    handleExportReport
  };
}
