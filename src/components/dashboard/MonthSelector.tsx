
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface MonthSelectorProps {
  onMonthChange: (date: Date) => void;
}

export default function MonthSelector({ onMonthChange }: MonthSelectorProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  // Formatea el mes y año para mostrar
  const formattedDate = format(date, "MMMM yyyy", { locale: es });
  const capitalizedMonth = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // Navegación por meses
  const previousMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - 1);
    setDate(newDate);
    onMonthChange(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + 1);
    setDate(newDate);
    onMonthChange(newDate);
  };

  const handleSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      onMonthChange(newDate);
      setOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={previousMonth}
        title="Mes anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-[150px]">
            <Calendar className="mr-2 h-4 w-4" />
            {capitalizedMonth}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            locale={es}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="icon"
        onClick={nextMonth}
        title="Mes siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
