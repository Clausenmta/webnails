
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
import { useQuery } from "@tanstack/react-query";
import { absenceTypeService, TipoAusenciaEnum } from "@/services/absenceTypeService";

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
  // Fetch absence types from the database
  const { data: absenceTypes = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['absenceTypes'],
    queryFn: absenceTypeService.fetchAbsenceTypes
  });
  
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
              value={filters.employeeId ? filters.employeeId.toString() : "all_employees"}
              onValueChange={(value) => setFilters({
                ...filters,
                employeeId: value === "all_employees" ? null : Number(value)
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los empleados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_employees">Todos los empleados</SelectItem>
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
              value={filters.tipoAusencia || "all_types"}
              onValueChange={(value) => setFilters({
                ...filters,
                tipoAusencia: value === "all_types" ? null : value
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_types">Todos los tipos</SelectItem>
                {isLoadingTypes ? (
                  <SelectItem value="loading">Cargando tipos...</SelectItem>
                ) : (
                  absenceTypes.map(tipo => (
                    <SelectItem key={tipo.id} value={tipo.nombre}>
                      {tipo.nombre}
                    </SelectItem>
                  ))
                )}
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
