import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Employee } from "@/types/employees";
import { employeeService } from "@/services/employeeService";
import { EmployeeList } from "@/components/employees/EmployeeList";
import { EmployeeStats } from "@/components/employees/EmployeeStats";
import { SalarySummary } from "@/components/employees/SalarySummary";
import EmployeeProfileDialog from "@/components/employees/EmployeeProfileDialog";
import SalaryCalculationDialog from "@/components/employees/SalaryCalculationDialog";
import AbsenceCalendar from "@/components/employees/AbsenceCalendar";
import { EmployeeSalaryHistoryDialog } from "@/components/employees/EmployeeSalaryHistoryDialog";
import { GlobalSalaryCalculation } from "@/components/employees/GlobalSalaryCalculation";

export default function EmpleadosPage() {
  const { isAuthorized } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSalaryOpen, setIsSalaryOpen] = useState(false);
  const [isSalaryHistoryOpen, setIsSalaryHistoryOpen] = useState(false);
  const [selectedEmployeeForHistory, setSelectedEmployeeForHistory] = useState<Employee | null>(null);
  
  const [newEmployeeData, setNewEmployeeData] = useState<Partial<Employee>>({
    name: "",
    position: "Estilista",
    status: "active",
    documents: []
  });

  const { data: employees = [], isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeService.fetchEmployees,
    select: (data) => {
      return data.map(emp => ({
        id: emp.id,
        name: emp.name,
        position: emp.position,
        joinDate: emp.hire_date,
        email: emp.email,
        status: emp.status as "active" | "inactive",
        contact: emp.phone,
        salary: emp.salary,
        phone: emp.phone,
        address: emp.address,
        currentMonthBilling: emp.performance_rating || 0, // Usando performance_rating como currentMonthBilling
        billingAverage: emp.performance_rating || 0, // También usando performance_rating
        documents: []
      }));
    }
  });

  const handleSaveEmployee = async (employeeData: Employee | Partial<Employee>) => {
    try {
      if ('id' in employeeData && employeeData.id) {
        await employeeService.updateEmployee(employeeData.id, {
          name: employeeData.name || '',
          email: employeeData.email || '',
          position: employeeData.position || 'Estilista',
          phone: employeeData.phone,
          address: employeeData.address,
          status: employeeData.status || 'active',
          hire_date: employeeData.joinDate || new Date().toLocaleDateString('es-AR'),
          salary: employeeData.salary || 0,
          created_by: 'admin'
        });
        toast.success("Empleado actualizado correctamente");
      } else {
        await employeeService.addEmployee({
          name: employeeData.name || '',
          email: employeeData.email || 'empleado@nailsandco.com',
          position: employeeData.position || 'Estilista',
          phone: employeeData.phone,
          address: employeeData.address,
          status: 'active',
          hire_date: new Date().toLocaleDateString('es-AR'),
          salary: employeeData.salary || 0,
          created_by: 'admin'
        });
        toast.success("Empleado creado correctamente");
      }
      
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Error al guardar empleado:", error);
      toast.error("Error al guardar el empleado");
    }
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    try {
      await employeeService.deleteEmployee(employeeId);
      toast.success("Empleado eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      toast.error("Error al eliminar el empleado");
    }
  };

  const handleViewSalaryHistory = (employee: Employee) => {
    setSelectedEmployeeForHistory(employee);
    setIsSalaryHistoryOpen(true);
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Recalcular los datos de employeesByPosition para asegurar precisión
  const employeesByPosition = employees
    .filter(emp => emp.status === "active")
    .reduce((acc, employee) => {
      acc[employee.position] = (acc[employee.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const activeEmployees = employees.filter(emp => emp.status === "active").length;

  // Recalcular el positionSummary basado en datos reales
  const positionSummary = employees.reduce((acc, employee) => {
    if (employee.status !== "active") return acc;
    
    const position = employee.position;
    
    if (!acc[position]) {
      acc[position] = {
        count: 0,
        totalBilling: 0,
        avgBilling: 0
      };
    }
    
    acc[position].count += 1;
    acc[position].totalBilling += employee.currentMonthBilling || 0;
    
    return acc;
  }, {} as Record<string, { count: number, totalBilling: number, avgBilling: number }>);

  // Calcular promedios después de que todos los valores se hayan sumado
  Object.keys(positionSummary).forEach(position => {
    const { count, totalBilling } = positionSummary[position];
    positionSummary[position].avgBilling = count > 0 ? totalBilling / count : 0;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Cargando empleados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <p>Error al cargar empleados. Por favor intente de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Empleados</h2>
          <p className="text-muted-foreground">
            Gestión del personal del salón
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-[300px]"
          />
          <Button
            onClick={() => {
              setSelectedEmployee(null);
              setIsProfileOpen(true);
            }}
            className="bg-salon-600 hover:bg-salon-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Agregar Empleado
          </Button>
        </div>
      </div>

      <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees">Listado de Empleados</TabsTrigger>
          <TabsTrigger value="global-calculation">Cálculo Global</TabsTrigger>
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="absences">Ausencias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Personal Activo</CardTitle>
              <CardDescription>
                Gestión de empleados y cálculo de sueldos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeList
                employees={filteredEmployees}
                onViewProfile={(employee) => {
                  setSelectedEmployee(employee);
                  setIsProfileOpen(true);
                }}
                onCalculateSalary={(employee) => {
                  setSelectedEmployee(employee);
                  setIsSalaryOpen(true);
                }}
                onDeleteEmployee={handleDeleteEmployee}
                onViewSalaryHistory={handleViewSalaryHistory}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="global-calculation">
          <GlobalSalaryCalculation employees={employees} />
        </TabsContent>
        
        <TabsContent value="summary">
          <EmployeeStats
            employees={employees}
            positionSummary={positionSummary}
          />
          <SalarySummary
            employees={employees}
            employeesByPosition={employeesByPosition}
            activeEmployees={activeEmployees}
          />
        </TabsContent>
        
        <TabsContent value="absences">
          <AbsenceCalendar employees={employees} />
        </TabsContent>
      </Tabs>

      <EmployeeProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        employee={selectedEmployee}
        onSave={handleSaveEmployee}
        newEmployeeData={newEmployeeData}
        setNewEmployeeData={setNewEmployeeData}
      />
      
      {selectedEmployee && (
        <SalaryCalculationDialog
          open={isSalaryOpen}
          onOpenChange={setIsSalaryOpen}
          employee={selectedEmployee}
        />
      )}
      
      {selectedEmployeeForHistory && (
        <EmployeeSalaryHistoryDialog
          open={isSalaryHistoryOpen}
          onOpenChange={setIsSalaryHistoryOpen}
          employee={selectedEmployeeForHistory}
        />
      )}
    </div>
  );
}
