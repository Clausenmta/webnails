
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseService } from "@/services/expenseService";
import { NewExpense } from "@/types/expenses";
import { toast } from "sonner";

export function useExpenseMutations() {
  const queryClient = useQueryClient();

  const addExpenseMutation = useMutation({
    mutationFn: (expense: NewExpense) => {
      // If category is empty for any reason, set a default
      if (!expense.category) {
        console.log("Setting default category in mutation");
        expense.category = "Varios";
      }
      return expenseService.addExpense(expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Gasto registrado correctamente");
    },
    onError: (error: any) => {
      console.error("Error al registrar el gasto:", error);
      toast.error(`Error al registrar el gasto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: number) => expenseService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Gasto eliminado correctamente");
    },
    onError: (error: any) => {
      console.error("Error al eliminar el gasto:", error);
      toast.error(`Error al eliminar el gasto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  });

  const markAsPaidMutation = useMutation({
    mutationFn: (id: number) => expenseService.markExpenseAsPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success("Gasto marcado como pagado");
    },
    onError: (error: any) => {
      console.error("Error al marcar el gasto como pagado:", error);
      toast.error(`Error al marcar como pagado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  });

  return {
    addExpenseMutation,
    deleteExpenseMutation,
    markAsPaidMutation
  };
}
