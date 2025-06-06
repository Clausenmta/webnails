import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, FileText, User, Trash2 } from "lucide-react";
import { Employee } from "@/types/employees";

interface EmployeeListProps {
  employees: Employee[];
  onViewProfile: (employee: Employee) => void;
  onCalculateSalary: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: number) => void;
  onViewSalaryHistory?: (employee: Employee) => void;
}

export const EmployeeList = ({ 
  employees, 
  onViewProfile, 
  onCalculateSalary, 
  onDeleteEmployee,
  onViewSalaryHistory
}: EmployeeListProps) => {
  const filteredEmployees = employees;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="text-lg font-semibold">{employee.name}</div>
              <div className="text-sm text-gray-500">{employee.position}</div>
              <div className="text-sm text-gray-500">
                {employee.status === "active" ? "Activo" : "Inactivo"}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewProfile(employee)}
                  className="flex-1"
                >
                  <User className="mr-2 h-4 w-4" />
                  Ver Perfil
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCalculateSalary(employee)}
                  className="flex-1"
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular
                </Button>

                {onViewSalaryHistory && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewSalaryHistory(employee)}
                    className="flex-1"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Historial
                  </Button>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteEmployee(employee.id)}
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center text-gray-500">
          No se encontraron empleados.
        </div>
      )}
    </div>
  );
};
