
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
      <div className="space-y-2">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-lg font-semibold">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.position}</div>
                      <div className="text-sm text-gray-500">
                        {employee.status === "active" ? "Activo" : "Inactivo"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewProfile(employee)}
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Ver Perfil
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCalculateSalary(employee)}
                    className="flex items-center gap-2"
                  >
                    <Calculator className="h-4 w-4" />
                    Calcular
                  </Button>

                  {onViewSalaryHistory && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewSalaryHistory(employee)}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Historial
                    </Button>
                  )}

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDeleteEmployee(employee.id)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
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
