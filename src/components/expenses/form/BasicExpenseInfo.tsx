
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { NewExpense } from "@/types/expenses";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpenseCategory } from "@/services/categoryService";

interface BasicExpenseInfoProps {
  expense: NewExpense;
  onUpdate: (updates: Partial<NewExpense>) => void;
  availableCategories: ExpenseCategory[];
  autoCloseCalendar?: boolean; // Add prop to auto-close calendar on selection
}

export function BasicExpenseInfo({ expense, onUpdate, availableCategories, autoCloseCalendar = false }: BasicExpenseInfoProps) {
  const [date, setDate] = useState<Date | undefined>(
    expense.date 
      ? parse(expense.date, 'dd/MM/yyyy', new Date())
      : new Date()
  );
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Update local date state when expense.date changes from parent
  useEffect(() => {
    if (expense.date) {
      try {
        setDate(parse(expense.date, 'dd/MM/yyyy', new Date()));
      } catch (error) {
        console.error("Error parsing date:", error);
        setDate(new Date());
      }
    }
  }, [expense.date]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Datos Básicos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'dd/MM/yyyy') : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  if (selectedDate) {
                    const formattedDate = format(selectedDate, 'dd/MM/yyyy');
                    setDate(selectedDate);
                    onUpdate({ date: formattedDate });
                    
                    // Auto close calendar if the prop is true
                    if (autoCloseCalendar) {
                      setTimeout(() => setIsCalendarOpen(false), 100);
                    }
                  }
                }}
                locale={es}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select 
            value={expense.category || ""}
            onValueChange={(value) => onUpdate({ category: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {availableCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="concept">Concepto</Label>
          <Input
            id="concept"
            value={expense.concept}
            onChange={(e) => onUpdate({ concept: e.target.value })}
            placeholder="Descripción breve del gasto"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Monto ($)</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={expense.amount || ''}
            onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
}
