
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NewExpense } from "@/types/expenses";
import { ExpenseCategory } from "@/services/categoryService";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BasicExpenseInfoProps {
  expense: NewExpense;
  onUpdate: (updates: Partial<NewExpense>) => void;
  availableCategories: ExpenseCategory[];
}

export function BasicExpenseInfo({ expense, onUpdate, availableCategories }: BasicExpenseInfoProps) {
  const { isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  const [hasLogged, setHasLogged] = useState(false);
  
  // Estado para manejar la fecha seleccionada
  const [date, setDate] = useState<Date | undefined>(
    expense.date ? parseDate(expense.date) : new Date()
  );
  
  // Función para parsear una fecha en formato DD/MM/YYYY a Date
  function parseDate(dateStr: string): Date | undefined {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Los meses en JS van de 0-11
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date();
  }
  
  // Ensure at least one category is always available
  const ensuredCategories = availableCategories.length > 0 
    ? availableCategories 
    : [{ id: 999, name: "Varios", access_level: "all" }];

  // Filter categories based on user role
  const filteredCategories = ensuredCategories.filter(
    category => category.access_level === 'all' || (isSuperAdmin && category.access_level === 'superadmin')
  );

  // Add detailed logging to help diagnose the issue
  useEffect(() => {
    // Log once to avoid console spam
    if (!hasLogged) {
      console.log("=== EXPENSE FORM CATEGORIES DEBUG ===");
      console.log("Raw available categories:", availableCategories);
      console.log("Ensured categories:", ensuredCategories);
      console.log("Filtered categories for current user:", filteredCategories);
      console.log("User is superadmin:", isSuperAdmin);
      console.log("Current expense category:", expense.category);
      console.log("================================");
      setHasLogged(true);
    }
  }, [availableCategories, ensuredCategories, filteredCategories, isSuperAdmin, expense.category, hasLogged]);

  // Ensure a valid category is selected when categories are loaded
  useEffect(() => {
    if (filteredCategories.length > 0 && !expense.category) {
      console.log("Setting default category to:", filteredCategories[0].name);
      onUpdate({ category: filteredCategories[0].name });
    }
  }, [filteredCategories, expense.category, onUpdate]);

  // Manejador para cambios en la fecha
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      // Formatear la fecha como DD/MM/YYYY
      const formattedDate = format(selectedDate, 'dd/MM/yyyy');
      onUpdate({ date: formattedDate });
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Fecha</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'dd/MM/yyyy') : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select 
            value={expense.category || (filteredCategories.length > 0 ? filteredCategories[0].name : "varios")} 
            onValueChange={(value) => onUpdate({ category: value })}
            defaultValue={filteredCategories[0]?.name}
          >
            <SelectTrigger className="bg-white border-gray-300">
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent 
              className="bg-white z-[100] max-h-60 shadow-lg border border-gray-200" 
              position="popper"
            >
              {filteredCategories.length > 0 ? (
                filteredCategories.map(category => (
                  <SelectItem 
                    key={category.id} 
                    value={category.name}
                    className="hover:bg-gray-100"
                  >
                    {category.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="varios">Varios</SelectItem>
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
