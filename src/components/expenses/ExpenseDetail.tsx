
import { Button } from "@/components/ui/button";
import { Expense } from "@/types/expenses";

interface ExpenseDetailProps {
  expense: Expense;
  onClose: () => void;
}

export function ExpenseDetail({ expense, onClose }: ExpenseDetailProps) {
  return (
    <div className="py-4">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Fecha</p>
          <p>{expense.date}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Categoría</p>
          <p>{expense.category}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-sm font-medium text-muted-foreground mb-1">Monto</p>
        <p className="text-lg font-bold">${expense.amount.toLocaleString()}</p>
      </div>
      
      {expense.details && (
        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Detalles</p>
          <p className="text-sm whitespace-pre-wrap border p-2 rounded-md">{expense.details}</p>
        </div>
      )}
      
      {expense.due_date && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Fecha de Vencimiento</p>
            <p>{expense.due_date}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Proveedor</p>
            <p>{expense.provider || '-'}</p>
          </div>
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Registrado por: <span className="font-medium">{expense.created_by}</span>
        </p>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}
