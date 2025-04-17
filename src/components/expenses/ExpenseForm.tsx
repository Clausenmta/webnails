
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { NewExpense } from "@/types/expenses";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { BasicExpenseInfo } from "./form/BasicExpenseInfo";
import { DetailedExpenseInfo } from "./form/DetailedExpenseInfo";
import { AttachmentsSection } from "./form/AttachmentsSection";

interface ExpenseFormProps {
  onSubmit: (expense: NewExpense) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function ExpenseForm({ onSubmit, isSubmitting, onCancel }: ExpenseFormProps) {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const [newExpense, setNewExpense] = useState<NewExpense>({
    date: format(new Date(), 'dd/MM/yyyy'),
    concept: "",
    amount: 0,
    category: "Insumos",
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

  const handleUpdate = (updates: Partial<NewExpense>) => {
    setNewExpense(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="grid gap-4 py-4">
      <BasicExpenseInfo 
        expense={newExpense}
        onUpdate={handleUpdate}
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
          onClick={() => onSubmit(newExpense)}
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
