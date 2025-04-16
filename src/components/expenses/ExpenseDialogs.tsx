
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Expense, NewExpense } from "@/types/expenses";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseDetail } from "./ExpenseDetail";

interface ExpenseDialogsProps {
  // Add expense dialog props
  isAddExpenseOpen: boolean;
  setIsAddExpenseOpen: (open: boolean) => void;
  addExpenseMutation: {
    mutate: (expense: NewExpense) => void;
    isPending: boolean;
  };
  
  // View expense dialog props
  isViewExpenseOpen: boolean;
  setIsViewExpenseOpen: (open: boolean) => void;
  currentExpense: Expense | null;
  
  // Delete expense dialog props
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  expenseToDelete: Expense | null;
  confirmDeleteExpense: () => void;
}

export function ExpenseDialogs({
  isAddExpenseOpen,
  setIsAddExpenseOpen,
  addExpenseMutation,
  isViewExpenseOpen,
  setIsViewExpenseOpen,
  currentExpense,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  expenseToDelete,
  confirmDeleteExpense,
}: ExpenseDialogsProps) {
  return (
    <>
      {/* Dialog para registrar gasto */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
            <DialogDescription>
              Completa los detalles del gasto para registrarlo
            </DialogDescription>
          </DialogHeader>
          
          <ExpenseForm 
            onSubmit={addExpenseMutation.mutate} 
            isSubmitting={addExpenseMutation.isPending} 
            onCancel={() => setIsAddExpenseOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para ver detalle de gasto */}
      <Dialog open={isViewExpenseOpen} onOpenChange={setIsViewExpenseOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalle del Gasto</DialogTitle>
            <DialogDescription>
              {currentExpense?.concept}
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

      {/* Diálogo de confirmación para eliminar gasto */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El gasto será eliminado permanentemente de la base de datos.
              {expenseToDelete && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p><strong>Concepto:</strong> {expenseToDelete.concept}</p>
                  <p><strong>Monto:</strong> ${expenseToDelete.amount.toLocaleString()}</p>
                  <p><strong>Fecha:</strong> {expenseToDelete.date}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteExpense}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
