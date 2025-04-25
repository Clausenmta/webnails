
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { NewExpense } from "@/types/expenses";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { BasicExpenseInfo } from "./form/BasicExpenseInfo";
import { DetailedExpenseInfo } from "./form/DetailedExpenseInfo";
import { AttachmentsSection } from "./form/AttachmentsSection";
import { ExpenseCategory } from "@/services/categoryService";
import { toast } from "sonner";

interface ExpenseFormProps {
  onSubmit: (expense: NewExpense) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  availableCategories: ExpenseCategory[];
}

export function ExpenseForm({ onSubmit, isSubmitting, onCancel, availableCategories }: ExpenseFormProps) {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Log when the component renders
  useEffect(() => {
    console.log("ExpenseForm rendered with categories:", availableCategories);
    if (availableCategories.length === 0) {
      console.warn("No expense categories available. Check if they were loaded correctly.");
    }
  }, [availableCategories]);
  
  const [newExpense, setNewExpense] = useState<NewExpense>({
    date: format(new Date(), 'dd/MM/yyyy'),
    concept: "",
    amount: 0,
    category: "",
    created_by: user?.username || "",
    details: "",
    due_date: "",
    provider: "",
    payment_method: "Efectivo"
  });

  useEffect(() => {
    if (user) {
      setNewExpense(prev => ({ ...prev, created_by: user.username }));
    }
  }, [user]);

  // Update category if the current one isn't available (e.g. when role changes)
  useEffect(() => {
    if (availableCategories.length > 0 && 
        !availableCategories.some(cat => cat.name === newExpense.category)) {
      console.log("Setting initial category based on available categories");
      setNewExpense(prev => ({ ...prev, category: availableCategories[0].name }));
    }
  }, [availableCategories, newExpense.category]);

  const handleUpdate = (updates: Partial<NewExpense>) => {
    setNewExpense(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = () => {
    if (!newExpense.concept) {
      toast.error("Por favor ingrese un concepto para el gasto");
      return;
    }
    
    if (!newExpense.amount || newExpense.amount <= 0) {
      toast.error("Por favor ingrese un monto válido");
      return;
    }
    
    if (!newExpense.category) {
      toast.error("Por favor seleccione una categoría");
      return;
    }
    
    onSubmit(newExpense);
  };

  return (
    <div className="grid gap-4 py-4">
      <BasicExpenseInfo 
        expense={newExpense}
        onUpdate={handleUpdate}
        availableCategories={availableCategories}
      />
      
      <DetailedExpenseInfo
        expense={newExpense}
        onUpdate={handleUpdate}
      />
      
      <AttachmentsSection
        attachments={attachments}
        onAttachmentsChange={setAttachments}
      />

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!newExpense.concept || !newExpense.amount || isSubmitting}
          className="bg-salon-400 hover:bg-salon-500"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Registrar Gasto
        </Button>
      </div>
    </div>
  );
}
