
import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Employee } from "@/types/employees";

// Tipos de ausencia
const tiposAusencia = [
  { value: "Enfermedad", label: "Enfermedad" },
  { value: "Vacaciones", label: "Vacaciones" },
  { value: "Licencia", label: "Licencia" },
  { value: "Ausencia justificada", label: "Ausencia justificada" },
  { value: "Otros", label: "Otros" }
];

interface FiltersType {
  employeeId: number | null;
  tipoAusencia: string | null;
  startDate: Date;
  endDate: Date;
}

interface AbsenceFiltersProps {
  employees: Employee[];
  filters: FiltersType;
  setFilters: (filters: FiltersType) => void;
}

export default function AbsenceFilters({
  employees,
  filters,
  setFilters
}: AbsenceFiltersProps) {
  
  const handleReset = () => {
    setFilters({
      employeeId: null,
      tipoAusencia: null,
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date())
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Empleado</Label>
            <Select
              value={filters.employeeId ? filters.employeeId.toString() : ""}
              onValueChange={(value) => setFilters({
                ...filters,
                employeeId: value ? Number(value) : null
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los empleados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los empleados</SelectItem>
                {employees.map(employee => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Ausencia</Label>
            <Select
              value={filters.tipoAusencia || ""}
              onValueChange={(value) => setFilters({
                ...filters,
                tipoAusencia: value || null
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los tipos</SelectItem>
                {tiposAusencia.map(tipo => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rango de fechas</Label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate
                      ? format(filters.startDate, 'dd/MM/yyyy')
                      : "Fecha inicio"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => date && setFilters({
                      ...filters,
                      startDate: date
                    })}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>

              <span>-</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate
                      ? format(filters.endDate, 'dd/MM/yyyy')
                      : "Fecha fin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => date && setFilters({
                      ...filters,
                      endDate: date
                    })}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full"
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
