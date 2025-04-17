
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { NewExpense, expenseCategories } from "@/types/expenses";
import { format } from "date-fns";
import { FileImage, File, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

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
    provider: ""
  });

  useEffect(() => {
    if (user) {
      setNewExpense(prev => ({ ...prev, created_by: user.username }));
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    if (validFiles.length !== files.length) {
      toast.error("Solo se permiten archivos de imagen o PDF");
      return;
    }
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
      
      <div className="space-y-2">
        <Label>Adjuntos (opcional)</Label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              multiple
            />
            <Label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md"
            >
              <Upload className="h-4 w-4" />
              Subir archivos
            </Label>
            <span className="text-sm text-muted-foreground">
              Imágenes o PDF
            </span>
          </div>
          
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-muted rounded-md"
                >
                  {file.type.startsWith('image/') ? (
                    <FileImage className="h-4 w-4" />
                  ) : (
                    <File className="h-4 w-4" />
                  )}
                  <span className="text-sm truncate max-w-[150px]">
                    {file.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
