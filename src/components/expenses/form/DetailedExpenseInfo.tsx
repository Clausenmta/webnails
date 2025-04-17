
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewExpense, paymentMethods, PaymentMethod } from "@/types/expenses";

interface DetailedExpenseInfoProps {
  expense: NewExpense;
  onUpdate: (updates: Partial<NewExpense>) => void;
}

export function DetailedExpenseInfo({ expense, onUpdate }: DetailedExpenseInfoProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="details">Detalles (opcional)</Label>
        <Textarea
          id="details"
          value={expense.details || ""}
          onChange={(e) => onUpdate({ details: e.target.value })}
          placeholder="Detalles adicionales del gasto"
        />
      </div>
      
      {(expense.category === "Fijos" || expense.category === "Proveedores") && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
            <Input
              id="dueDate"
              value={expense.due_date || ""}
              onChange={(e) => onUpdate({ due_date: e.target.value })}
              placeholder="DD/MM/YYYY"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="provider">Proveedor</Label>
            <Input
              id="provider"
              value={expense.provider || ""}
              onChange={(e) => onUpdate({ provider: e.target.value })}
              placeholder="Nombre del proveedor"
            />
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        <Label>Medio de Pago</Label>
        <Select 
          value={expense.payment_method} 
          onValueChange={(value) => onUpdate({ payment_method: value as PaymentMethod })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar medio de pago" />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map(method => (
              <SelectItem key={method} value={method}>
                {method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
