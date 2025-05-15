
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { NewExpense, paymentMethods } from "@/types/expenses";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DetailedExpenseInfoProps {
  expense: NewExpense;
  onUpdate: (updates: Partial<NewExpense>) => void;
  autoCloseCalendar?: boolean; // Add prop to auto-close calendar on selection
}

export function DetailedExpenseInfo({ expense, onUpdate, autoCloseCalendar = false }: DetailedExpenseInfoProps) {
  const [dueDate, setDueDate] = useState<Date | undefined>(
    expense.due_date 
      ? parse(expense.due_date, 'dd/MM/yyyy', new Date())
      : undefined
  );
  
  const [isDueDateCalendarOpen, setIsDueDateCalendarOpen] = useState(false);

  // Update local date state when expense.due_date changes from parent
  useEffect(() => {
    if (expense.due_date) {
      try {
        setDueDate(parse(expense.due_date, 'dd/MM/yyyy', new Date()));
      } catch (error) {
        console.error("Error parsing due date:", error);
      }
    }
  }, [expense.due_date]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Datos Adicionales</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="provider">Proveedor</Label>
          <Input
            id="provider"
            value={expense.provider || ''}
            onChange={(e) => onUpdate({ provider: e.target.value })}
            placeholder="Nombre del proveedor (opcional)"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="payment_method">Medio de Pago</Label>
          <Select 
            value={expense.payment_method || 'Efectivo'}
            onValueChange={(value) => onUpdate({ payment_method: value as any })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar medio de pago" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method} value={method}>
                  {method}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="due_date">Fecha de Vencimiento (opcional)</Label>
          <Popover open={isDueDateCalendarOpen} onOpenChange={setIsDueDateCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, 'dd/MM/yyyy') : "Seleccionar fecha (opcional)"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={(selected) => {
                  setDueDate(selected);
                  if (selected) {
                    onUpdate({ due_date: format(selected, 'dd/MM/yyyy') });
                    
                    // Auto close calendar if the prop is true
                    if (autoCloseCalendar) {
                      setTimeout(() => setIsDueDateCalendarOpen(false), 100);
                    }
                  } else {
                    onUpdate({ due_date: '' });
                  }
                }}
                locale={es}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="details">Detalles Adicionales (opcional)</Label>
          <Textarea
            id="details"
            rows={3}
            placeholder="Información adicional sobre el gasto"
            value={expense.details || ''}
            onChange={(e) => onUpdate({ details: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
