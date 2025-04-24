
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewExpense } from "@/types/expenses";
import { ExpenseCategory } from "@/services/categoryService";
import { useEffect } from "react";

interface BasicExpenseInfoProps {
  expense: NewExpense;
  onUpdate: (updates: Partial<NewExpense>) => void;
  availableCategories: ExpenseCategory[];
}

export function BasicExpenseInfo({ expense, onUpdate, availableCategories }: BasicExpenseInfoProps) {
  // Add logging to help diagnose the issue
  useEffect(() => {
    console.log("Available categories:", availableCategories);
  }, [availableCategories]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Input
            id="date"
            value={expense.date}
            onChange={(e) => onUpdate({ date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select 
            value={expense.category} 
            onValueChange={(value) => onUpdate({ category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.length > 0 ? (
                availableCategories.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-categories" disabled>No hay categorías disponibles</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="concept">Concepto</Label>
        <Input
          id="concept"
          value={expense.concept}
          onChange={(e) => onUpdate({ concept: e.target.value })}
          placeholder="Descripción breve del gasto"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">Monto</Label>
        <Input
          id="amount"
          type="number"
          min="0"
          value={expense.amount || ""}
          onChange={(e) => onUpdate({ amount: Number(e.target.value) })}
        />
      </div>
    </>
  );
}
