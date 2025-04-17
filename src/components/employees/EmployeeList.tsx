
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { EmployeeStatusToggle } from "./EmployeeStatusToggle";
import { Employee } from "@/types/employees";

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
  return (
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
          {employees.map((employee) => (
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
        </TableBody>
      </Table>
    </div>
  );
}
