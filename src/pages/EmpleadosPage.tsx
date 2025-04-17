import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import EmployeeProfileDialog from "@/components/employees/EmployeeProfileDialog";
import SalaryCalculationDialog from "@/components/employees/SalaryCalculationDialog";
import AbsenceCalendar from "@/components/employees/AbsenceCalendar";
import { Users, BriefcaseBusiness, UserRound, UserCheck, UserPlus, Trash2 } from "lucide-react";
import { EmployeeStatusToggle } from "@/components/employees/EmployeeStatusToggle";
import { employeeService } from "@/services/employeeService";

export interface Employee {
  id: number;
  name: string;
  position: string;
  email: string;
  status: "active" | "inactive";
  joinDate: string;
  contact?: string;
  salary?: number;
  billingAverage?: number;
  currentMonthBilling?: number;
  phone?: string;
  address?: string;
  documentId?: string;
  birthday?: string;
  bankAccount?: string;
  documents?: {
    id: number;
    name: string;
    date: string;
    type: "salary" | "contract" | "other";
    url: string;
  }[];
}

export default function EmpleadosPage() {
  const { isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  const queryClient = useQueryClient();
  
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: "María García",
      position: "Estilista",
      joinDate: "10/01/2023",
      contact: "11-1234-5678",
      email: "maria@nailsandco.com",
      status: "active",
    },
    {
      id: 2,
      name: "Laura Martínez",
      position: "Manicurista",
      joinDate: "15/03/2023",
      contact: "11-2345-6789",
      email: "laura@nailsandco.com",
      status: "active",
    },
    {
      id: 3,
      name: "Juan Pérez",
      position: "Estilista",
      joinDate: "05/05/2023",
      contact: "11-3456-7890",
      email: "juan@nailsandco.com",
      status: "active",
    },
    {
      id: 4,
      name: "Ana López",
      position: "Recepcionista",
      joinDate: "20/06/2023",
      contact: "11-4567-8901",
      email: "ana@nailsandco.com",
      status: "active",
    },
    {
      id: 5,
      name: "Carlos Rodríguez",
      position: "Manicurista",
      joinDate: "12/08/2023",
      contact: "11-5678-9012",
      email: "carlos@nailsandco.com",
      status: "inactive",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSalaryOpen, setIsSalaryOpen] = useState(false);
  
  const [newEmployeeData, setNewEmployeeData] = useState<Partial<Employee>>({
    name: "",
    position: "Estilista",
    status: "active",
    documents: []
  });

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsProfileOpen(true);
  };

  const handleSalaryCalculation = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsSalaryOpen(true);
  };

  const handleSaveEmployee = (employeeData: Employee | Partial<Employee>) => {
    if ('id' in employeeData && employeeData.id) {
      setEmployees(prev => 
        prev.map(emp => emp.id === employeeData.id ? { ...emp, ...employeeData } as Employee : emp)
      );
    } else {
      const newEmployee = {
        ...employeeData,
        id: Math.max(0, ...employees.map(e => e.id)) + 1,
        joinDate: new Date().toLocaleDateString('es-AR'),
        status: 'active',
      } as Employee;
      
      setEmployees(prev => [newEmployee, ...prev]);
    }
    setIsProfileOpen(false);
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    try {
      await employeeService.deleteEmployee(employeeId);
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
    }
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsProfileOpen(true);
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const employeesByPosition = employees.reduce((acc, employee) => {
    if (employee.status === "active") {
      acc[employee.position] = (acc[employee.position] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const activeEmployees = employees.filter(emp => emp.status === "active").length;

  const positionSummary = employees.reduce((acc, employee) => {
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

  Object.keys(positionSummary).forEach(position => {
    const { count, totalBilling } = positionSummary[position];
    positionSummary[position].avgBilling = count > 0 ? totalBilling / count : 0;
  });

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
            onClick={handleAddEmployee}
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
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left">Nombre</th>
                      <th className="py-3 px-4 text-left">Posición</th>
                      <th className="py-3 px-4 text-left">Contacto</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="border-b">
                        <td className="py-3 px-4">{employee.name}</td>
                        <td className="py-3 px-4">{employee.position}</td>
                        <td className="py-3 px-4">{employee.contact}</td>
                        <td className="py-3 px-4 text-center">
                          <EmployeeStatusToggle
                            employeeId={employee.id}
                            currentStatus={employee.status}
                            onStatusChange={() => queryClient.invalidateQueries({ queryKey: ['employees'] })}
                          />
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEmployeeClick(employee)}
                            >
                              Ver Perfil
                            </Button>
                            {employee.status === "active" && employee.position !== "Recepcionista" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSalaryCalculation(employee)}
                              >
                                Calcular Sueldo
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Empleados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{employees.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {employees.filter(e => e.status === "active").length} activos, {employees.filter(e => e.status === "inactive").length} inactivos
                </p>
              </CardContent>
            </Card>
            
            {Object.entries(positionSummary).map(([position, data]) => (
              <Card key={position}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {position}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.count}</div>
                  <div className="flex flex-col mt-1">
                    <p className="text-xs text-muted-foreground">
                      Facturación Total: ${data.totalBilling.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Promedio: ${data.avgBilling.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Desglose de Sueldos</CardTitle>
              <CardDescription>
                Resumen de sueldos por posición
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left">Posición</th>
                      <th className="py-3 px-4 text-center">Cantidad</th>
                      <th className="py-3 px-4 text-right">Promedio Mensual</th>
                      <th className="py-3 px-4 text-right">Total Mensual</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Estilista</td>
                      <td className="py-3 px-4 text-center">{employeesByPosition["Estilista"] || 0}</td>
                      <td className="py-3 px-4 text-right">$42,000</td>
                      <td className="py-3 px-4 text-right">$84,000</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Manicurista</td>
                      <td className="py-3 px-4 text-center">{employeesByPosition["Manicurista"] || 0}</td>
                      <td className="py-3 px-4 text-right">$38,000</td>
                      <td className="py-3 px-4 text-right">$76,000</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Recepcionista</td>
                      <td className="py-3 px-4 text-center">{employeesByPosition["Recepcionista"] || 0}</td>
                      <td className="py-3 px-4 text-right">$25,000</td>
                      <td className="py-3 px-4 text-right">$25,000</td>
                    </tr>
                    <tr className="font-bold">
                      <td className="py-3 px-4">TOTAL</td>
                      <td className="py-3 px-4 text-center">{activeEmployees}</td>
                      <td className="py-3 px-4 text-right">-</td>
                      <td className="py-3 px-4 text-right">$185,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="absences">
          <AbsenceCalendar employees={employees} />
        </TabsContent>
      </Tabs>

      {selectedEmployee !== null && (
        <>
          <EmployeeProfileDialog
            open={isProfileOpen}
            onOpenChange={setIsProfileOpen}
            employee={selectedEmployee}
            onSave={handleSaveEmployee}
            newEmployeeData={newEmployeeData}
            setNewEmployeeData={setNewEmployeeData}
          />
          <SalaryCalculationDialog
            open={isSalaryOpen}
            onOpenChange={setIsSalaryOpen}
            employee={selectedEmployee}
          />
        </>
      )}
    </div>
  );
}
