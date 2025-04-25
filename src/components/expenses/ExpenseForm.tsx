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

  // Ensure we have at least one default category - use `as const` to infer the correct type
  const ensuredCategories: ExpenseCategory[] = availableCategories?.length > 0 
    ? availableCategories 
    : [{ id: 999, name: "Varios", access_level: "all" as "all" }];

  // Debug categories passed to form
  useEffect(() => {
    console.log("==== EXPENSE FORM RENDER ====");
    console.log("ExpenseForm rendered with categories:", availableCategories);
    console.log("Ensured categories:", ensuredCategories); 
    
    if (!availableCategories || availableCategories.length === 0) {
      console.warn("No expense categories available in ExpenseForm");
    }
  }, [availableCategories, ensuredCategories]);
  
  const [newExpense, setNewExpense] = useState<NewExpense>({
    date: format(new Date(), 'dd/MM/yyyy'),
    concept: "",
    amount: 0,
    category: ensuredCategories[0]?.name || "Varios",
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

  // Set a default category if available
  useEffect(() => {
    if (ensuredCategories.length > 0 && !newExpense.category) {
      console.log("Setting initial category:", ensuredCategories[0].name);
      setNewExpense(prev => ({ ...prev, category: ensuredCategories[0].name }));
    }
  }, [ensuredCategories, newExpense.category]);

  const handleUpdate = (updates: Partial<NewExpense>) => {
    console.log("Updating expense form with:", updates);
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
    
    // If category is empty, set to default
    if (!newExpense.category) {
      const defaultCategory = ensuredCategories[0]?.name || "Varios";
      setNewExpense(prev => ({ ...prev, category: defaultCategory }));
      console.log("Set default category before submit:", defaultCategory);
    }
    
    onSubmit(newExpense);
  };

  return (
    <div className="grid gap-4 py-4">
      <BasicExpenseInfo 
        expense={newExpense}
        onUpdate={handleUpdate}
        availableCategories={ensuredCategories}
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
