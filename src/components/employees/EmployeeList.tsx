
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Filter } from "lucide-react";
import { EmployeeStatusToggle } from "./EmployeeStatusToggle";
import { Employee } from "@/types/employees";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface EmployeeListProps {
  employees: Employee[];
  onViewProfile: (employee: Employee) => void;
  onCalculateSalary: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: number) => void;
}

export function EmployeeList({ 
  employees, 
  onViewProfile, 
  onCalculateSalary, 
  onDeleteEmployee 
}: EmployeeListProps) {
  const [positionFilter, setPositionFilter] = useState<string>("all");
  
  // Get unique positions from employees data
  const uniquePositions = Array.from(new Set(employees.map(emp => emp.position)));
  
  // Filter employees by selected position
  const filteredEmployees = positionFilter === "all" 
    ? employees 
    : employees.filter(emp => emp.position === positionFilter);

  return (
    <>
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por posición" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las posiciones</SelectItem>
              {uniquePositions.map(position => (
                <SelectItem key={position} value={position}>{position}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Posición</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.position}</TableCell>
                <TableCell>{employee.contact}</TableCell>
                <TableCell className="text-center">
                  <EmployeeStatusToggle
                    employeeId={employee.id}
                    currentStatus={employee.status}
                    onStatusChange={() => {}}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewProfile(employee)}
                    >
                      Ver Perfil
                    </Button>
                    {employee.status === "active" && employee.position !== "Recepcionista" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCalculateSalary(employee)}
                      >
                        Calcular Sueldo
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteEmployee(employee.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredEmployees.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No hay empleados con la posición seleccionada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
