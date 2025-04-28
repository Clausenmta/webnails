
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewExpense, paymentMethods, PaymentMethod } from "@/types/expenses";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DetailedExpenseInfoProps {
  expense: NewExpense;
  onUpdate: (updates: Partial<NewExpense>) => void;
}

export function DetailedExpenseInfo({ expense, onUpdate }: DetailedExpenseInfoProps) {
  // Estado para manejar la fecha de vencimiento seleccionada
  const [dueDate, setDueDate] = useState<Date | undefined>(
    expense.due_date ? parseDate(expense.due_date) : undefined
  );
  
  // Función para parsear una fecha en formato DD/MM/YYYY a Date
  function parseDate(dateStr: string): Date | undefined {
    if (!dateStr) return undefined;
    
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Los meses en JS van de 0-11
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return undefined;
  }
  
  // Manejador para cambios en la fecha de vencimiento
  const handleDueDateSelect = (selectedDate: Date | undefined) => {
    setDueDate(selectedDate);
    // Formatear la fecha como DD/MM/YYYY si existe, o cadena vacía si es undefined
    const formattedDate = selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '';
    onUpdate({ due_date: formattedDate });
  };

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
      
      <div className="space-y-2">
        <Label htmlFor="provider">Proveedor</Label>
        <Input
          id="provider"
          value={expense.provider || ""}
          onChange={(e) => onUpdate({ provider: e.target.value })}
          placeholder="Nombre del proveedor"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, 'dd/MM/yyyy') : "Seleccionar fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={handleDueDateSelect}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
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
