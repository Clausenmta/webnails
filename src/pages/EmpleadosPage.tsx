
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { 
  Filter, 
  Plus, 
  Search, 
  User, 
  Wallet,
  FileText,
  UserCheck,
  UserX
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import EmployeeProfileDialog from "@/components/employees/EmployeeProfileDialog";
import SalaryCalculationDialog from "@/components/employees/SalaryCalculationDialog";

// Extended employee type
export type Employee = {
  id: number;
  name: string;
  position: string;
  startDate: string;
  phone: string;
  status: "active" | "inactive";
  // Extended employee data
  email?: string;
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
};

// Mock data for the employee list
const mockEmployees: Employee[] = [
  { 
    id: 1, 
    name: "María López", 
    position: "Estilista", 
    startDate: "15/02/2023", 
    phone: "11-1234-5678",
    status: "active",
    email: "maria.lopez@example.com",
    address: "Av. Corrientes 1234, CABA",
    documentId: "27123456",
    birthday: "15/05/1990",
    bankAccount: "Banco Nación 0012345-6",
    documents: [
      {
        id: 1,
        name: "Recibo Febrero 2023",
        date: "28/02/2023",
        type: "salary",
        url: "#"
      },
      {
        id: 2,
        name: "Contrato Inicial",
        date: "15/02/2023",
        type: "contract",
        url: "#"
      }
    ]
  },
  { 
    id: 2, 
    name: "Juan Pérez", 
    position: "Manicurista", 
    startDate: "03/05/2023", 
    phone: "11-8765-4321",
    status: "active",
    email: "juan.perez@example.com",
    address: "Calle Florida 567, CABA",
    documentId: "25789012",
    birthday: "10/07/1988",
    bankAccount: "Banco Galicia 7891234-5"
  },
  { 
    id: 3, 
    name: "Ana García", 
    position: "Recepcionista", 
    startDate: "22/06/2023", 
    phone: "11-5678-1234",
    status: "active",
    email: "ana.garcia@example.com",
    address: "Av. Santa Fe 890, CABA",
    documentId: "30456789",
    birthday: "22/11/1995",
    bankAccount: "Banco Santander 3456789-0"
  },
  { 
    id: 4, 
    name: "Carlos Rodriguez", 
    position: "Estilista", 
    startDate: "10/08/2023", 
    phone: "11-4321-8765",
    status: "inactive",
    email: "carlos.rodriguez@example.com",
    address: "Av. Callao 1234, CABA",
    documentId: "28901234",
    birthday: "03/04/1985",
    bankAccount: "Banco ICBC 9012345-6"
  },
  { 
    id: 5, 
    name: "Laura Martinez", 
    position: "Manicurista", 
    startDate: "17/10/2023", 
    phone: "11-2345-6789",
    status: "active",
    email: "laura.martinez@example.com",
    address: "Calle Libertad 567, CABA",
    documentId: "29345678",
    birthday: "17/09/1992",
    bankAccount: "Banco Macro 2345678-9"
  },
];

export default function EmpleadosPage() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState(
    employees.filter(emp => emp.status === "active")
  );
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  
  // State for dialog visibility
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    status: "active",
    position: "Estilista"
  });

  // Handle search and filter
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    filterEmployees(query, selectedPositions);
  };

  const handlePositionFilter = (position: string) => {
    const updatedPositions = selectedPositions.includes(position)
      ? selectedPositions.filter(p => p !== position)
      : [...selectedPositions, position];
    
    setSelectedPositions(updatedPositions);
    filterEmployees(searchQuery, updatedPositions);
  };

  const filterEmployees = (query: string, positions: string[]) => {
    let filtered = employees.filter(emp => emp.status === "active");
    
    // Apply search filter
    if (query) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(query) || 
        emp.position.toLowerCase().includes(query) ||
        emp.phone.toLowerCase().includes(query) ||
        (emp.email && emp.email.toLowerCase().includes(query))
      );
    }
    
    // Apply position filter
    if (positions.length > 0) {
      filtered = filtered.filter(emp => positions.includes(emp.position));
    }
    
    setFilteredEmployees(filtered);
  };

  // Handle employee status change
  const toggleEmployeeStatus = (employee: Employee) => {
    const newStatus: "active" | "inactive" = employee.status === "active" ? "inactive" : "active";
    const updatedEmployees = employees.map(emp => 
      emp.id === employee.id ? { ...emp, status: newStatus } : emp
    );
    
    setEmployees(updatedEmployees);
    setFilteredEmployees(updatedEmployees.filter(emp => emp.status === "active"));
    
    toast.success(`Estado de ${employee.name} actualizado a ${newStatus === "active" ? "activo" : "inactivo"}`);
  };

  // Handle creating a new employee
  const handleCreateEmployee = (employeeData: Partial<Employee>) => {
    const newEmployeeData: Employee = {
      id: employees.length + 1,
      name: employeeData.name || "",
      position: employeeData.position || "Estilista",
      startDate: new Date().toLocaleDateString("es-AR"),
      phone: employeeData.phone || "",
      status: "active", // Explicitly set as a literal type
      email: employeeData.email,
      address: employeeData.address,
      documentId: employeeData.documentId,
      birthday: employeeData.birthday,
      bankAccount: employeeData.bankAccount,
      documents: employeeData.documents || []
    };
    
    const updatedEmployees = [...employees, newEmployeeData];
    setEmployees(updatedEmployees);
    setFilteredEmployees(updatedEmployees.filter(emp => emp.status === "active"));
    
    toast.success(`Empleado ${newEmployeeData.name} creado exitosamente`);
    setIsProfileDialogOpen(false);
    setNewEmployee({
      status: "active",
      position: "Estilista"
    });
  };

  // Handle updating an employee
  const handleUpdateEmployee = (employeeData: Employee) => {
    const updatedEmployees = employees.map(emp => 
      emp.id === employeeData.id ? employeeData : emp
    );
    
    setEmployees(updatedEmployees);
    setFilteredEmployees(updatedEmployees.filter(emp => emp.status === "active"));
    
    toast.success(`Empleado ${employeeData.name} actualizado exitosamente`);
    setIsProfileDialogOpen(false);
    setSelectedEmployee(null);
  };

  // Open profile dialog with the selected employee
  const openProfileDialog = (employee: Employee | null = null) => {
    setSelectedEmployee(employee);
    setIsProfileDialogOpen(true);
  };

  // Open salary calculation dialog with the selected employee
  const openSalaryDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsSalaryDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Empleados</h2>
          <p className="text-muted-foreground">
            Gestiona la información de tus empleados
          </p>
        </div>
        <Button 
          className="bg-salon-400 hover:bg-salon-500" 
          onClick={() => openProfileDialog(null)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Empleado
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar empleados..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Filter className="h-3.5 w-3.5" />
                    <span>Filtros</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-4" align="end">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Posición</h4>
                      <div className="space-y-2">
                        {["Estilista", "Manicurista", "Recepcionista"].map((position) => (
                          <div key={position} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`position-${position}`} 
                              checked={selectedPositions.includes(position)}
                              onCheckedChange={() => handlePositionFilter(position)}
                            />
                            <label 
                              htmlFor={`position-${position}`}
                              className="text-sm font-normal cursor-pointer"
                            >
                              {position}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {filteredEmployees.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Posición</TableHead>
                    <TableHead>Fecha de Inicio</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.startDate}</TableCell>
                      <TableCell>{employee.phone}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="default"
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Activo
                        </Badge>
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openProfileDialog(employee)}
                          title="Ver perfil"
                        >
                          <User className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openSalaryDialog(employee)}
                          title="Calcular sueldo"
                        >
                          <Wallet className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toggleEmployeeStatus(employee)}
                          className="text-red-500"
                          title="Desactivar empleado"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium">No se encontraron empleados</h3>
              <p className="text-muted-foreground mt-1">
                Intenta con otra búsqueda o agrega nuevos empleados
              </p>
            </div>
          )}
          
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Employee Profile Dialog */}
      <EmployeeProfileDialog 
        open={isProfileDialogOpen}
        onOpenChange={setIsProfileDialogOpen}
        employee={selectedEmployee}
        onSave={selectedEmployee ? handleUpdateEmployee : handleCreateEmployee}
        newEmployeeData={newEmployee}
        setNewEmployeeData={setNewEmployee}
      />

      {/* Salary Calculation Dialog */}
      <SalaryCalculationDialog
        open={isSalaryDialogOpen}
        onOpenChange={setIsSalaryDialogOpen}
        employee={selectedEmployee}
      />
    </div>
  );
}
