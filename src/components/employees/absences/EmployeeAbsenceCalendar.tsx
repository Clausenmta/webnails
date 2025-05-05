
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { es } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Absence } from "@/services/absenceService";
import { parseISO } from "date-fns";

interface EmployeeAbsenceCalendarProps {
  date: Date;
  onDateChange: (date: Date | undefined) => void;
  absences: Absence[];
  onAddAbsence: () => void;
}

export function EmployeeAbsenceCalendar({
  date,
  onDateChange,
  absences,
  onAddAbsence
}: EmployeeAbsenceCalendarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendario de Ausencias</CardTitle>
        <CardDescription>
          Registro de ausencias de empleados
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          className="rounded-md border shadow-sm"
          locale={es}
          modifiers={{
            absence: (date) => {
              return absences.some(absence => {
                const start = parseISO(absence.fecha_inicio);
                const end = parseISO(absence.fecha_fin);
                return date >= start && date <= end;
              });
            }
          }}
          modifiersClassNames={{
            absence: "bg-red-100 text-red-800 font-medium"
          }}
        />
        
        <div className="mt-4 flex justify-end">
          <Button
            onClick={onAddAbsence}
            className="bg-salon-400 hover:bg-salon-500"
          >
            <Plus className="mr-2 h-4 w-4" />
            Registrar Ausencia
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
