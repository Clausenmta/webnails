
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import EmployeeProfileDialog from "@/components/employees/EmployeeProfileDialog";
import SalaryCalculationDialog from "@/components/employees/SalaryCalculationDialog";
import AbsenceCalendar from "@/components/employees/AbsenceCalendar";
import { Users, BriefcaseBusiness, UserRound, UserCheck } from "lucide-react";

export interface Employee {
  id: number;
  name: string;
  position: string;
  joinDate: string;
  contact: string;
  email: string;
  status: "active" | "inactive";
  avatar?: string;
}

export default function EmpleadosPage() {
  const { isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  
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

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsProfileOpen(true);
  };

  const handleSalaryCalculation = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsSalaryOpen(true);
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener empleados por posición para mostrar en panel de resumen
  const employeesByPosition = employees.reduce((acc, employee) => {
    if (employee.status === "active") {
      acc[employee.position] = (acc[employee.position] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Total de empleados activos
  const activeEmployees = employees.filter(emp => emp.status === "active").length;

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
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              employee.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {employee.status === "active" ? "Activo" : "Inactivo"}
                          </span>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Empleados</CardTitle>
                <Users className="h-4 w-4 text-salon-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  Empleados activos
                </p>
              </CardContent>
            </Card>
            
            {Object.entries(employeesByPosition).map(([position, count], index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">{position}</CardTitle>
                  {position === "Estilista" ? (
                    <BriefcaseBusiness className="h-4 w-4 text-salon-500" />
                  ) : position === "Manicurista" ? (
                    <UserCheck className="h-4 w-4 text-salon-500" />
                  ) : (
                    <UserRound className="h-4 w-4 text-salon-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                  <p className="text-xs text-muted-foreground">
                    {count === 1 ? "Empleado" : "Empleados"}
                  </p>
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

      {selectedEmployee && (
        <>
          <EmployeeProfileDialog
            open={isProfileOpen}
            onOpenChange={setIsProfileOpen}
            employee={selectedEmployee}
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
