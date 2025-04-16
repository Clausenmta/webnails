
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { NewExpense, expenseCategories } from "@/types/expenses";
import { format } from "date-fns";

interface ExpenseFormProps {
  onSubmit: (expense: NewExpense) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function ExpenseForm({ onSubmit, isSubmitting, onCancel }: ExpenseFormProps) {
  const { user } = useAuth();
  
  const [newExpense, setNewExpense] = useState<NewExpense>({
    date: format(new Date(), 'dd/MM/yyyy'),
    concept: "",
    amount: 0,
    category: "Insumos",
    created_by: user?.username || "",
    details: "",
    due_date: "",
    provider: ""
  });

  // Update created_by when user changes
  useEffect(() => {
    if (user) {
      setNewExpense(prev => ({ ...prev, created_by: user.username }));
    }
  }, [user]);

  const handleSubmit = () => {
    const formattedExpense = {
      ...newExpense,
      // If the category is Fijos or Proveedores, ensure it has a "pending" status by default
      status: (newExpense.category === "Fijos" || newExpense.category === "Proveedores") 
        ? "pending" 
        : undefined
    };
    
    onSubmit(formattedExpense);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Input
            id="date"
            value={newExpense.date}
            onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select 
            value={newExpense.category} 
            onValueChange={(value) => setNewExpense({...newExpense, category: value})}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="concept">Concepto</Label>
        <Input
          id="concept"
          value={newExpense.concept}
          onChange={(e) => setNewExpense({...newExpense, concept: e.target.value})}
          placeholder="Descripción breve del gasto"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">Monto</Label>
        <Input
          id="amount"
          type="number"
          min="0"
          value={newExpense.amount || ""}
          onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="details">Detalles (opcional)</Label>
        <Textarea
          id="details"
          value={newExpense.details || ""}
          onChange={(e) => setNewExpense({...newExpense, details: e.target.value})}
          placeholder="Detalles adicionales del gasto"
        />
      </div>
      
      {(newExpense.category === "Fijos" || newExpense.category === "Proveedores") && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
              <Input
                id="dueDate"
                value={newExpense.due_date || ""}
                onChange={(e) => setNewExpense({...newExpense, due_date: e.target.value})}
                placeholder="DD/MM/YYYY"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Proveedor</Label>
              <Input
                id="provider"
                value={newExpense.provider || ""}
                onChange={(e) => setNewExpense({...newExpense, provider: e.target.value})}
                placeholder="Nombre del proveedor"
              />
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!newExpense.concept || !newExpense.amount || isSubmitting}
          className="bg-salon-400 hover:bg-salon-500"
        >
          Registrar Gasto
        </Button>
      </div>
    </div>
  );
}
