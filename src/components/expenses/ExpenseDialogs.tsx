
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ExpenseDetail } from "./ExpenseDetail";
import { ExpenseForm } from "./ExpenseForm";
import { Expense, NewExpense } from "@/types/expenses";
import { UseMutationResult } from "@tanstack/react-query";
import { ExpenseCategory } from "@/services/categoryService";
import { toast } from "sonner";

interface ExpenseDialogsProps {
  isAddExpenseOpen: boolean;
  setIsAddExpenseOpen: (open: boolean) => void;
  addExpenseMutation: UseMutationResult<Expense, Error, NewExpense>;
  availableCategories: ExpenseCategory[];
  isViewExpenseOpen: boolean;
  setIsViewExpenseOpen: (open: boolean) => void;
  currentExpense: Expense | null;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  expenseToDelete: Expense | null;
  confirmDeleteExpense: () => void;
}

export function ExpenseDialogs({
  isAddExpenseOpen,
  setIsAddExpenseOpen,
  addExpenseMutation,
  availableCategories,
  isViewExpenseOpen,
  setIsViewExpenseOpen,
  currentExpense,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  expenseToDelete,
  confirmDeleteExpense
}: ExpenseDialogsProps) {
  const handleExpenseSubmit = (expense: NewExpense) => {
    addExpenseMutation.mutate(expense, {
      onSuccess: () => {
        // Close modal and show success toast
        setIsAddExpenseOpen(false);
        toast.success("Gasto registrado correctamente ✅");
      }
    });
  };

  return (
    <>
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
            <DialogDescription>
              Complete el formulario para registrar un nuevo gasto
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm
            onSubmit={handleExpenseSubmit}
            isSubmitting={addExpenseMutation.isPending}
            onCancel={() => setIsAddExpenseOpen(false)}
            availableCategories={availableCategories}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewExpenseOpen} onOpenChange={setIsViewExpenseOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detalle del Gasto</DialogTitle>
            <DialogDescription>
              Información completa sobre el gasto seleccionado
            </DialogDescription>
          </DialogHeader>
          {currentExpense && (
            <ExpenseDetail 
              expense={currentExpense} 
              onClose={() => setIsViewExpenseOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación del gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El gasto será eliminado permanentemente
              de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteExpense}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </Dialog>
    </>
  );
}
