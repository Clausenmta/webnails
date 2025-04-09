
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
  UserRoundPlus 
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

// Mock data for the employee list
const mockEmployees = [
  { 
    id: 1, 
    name: "María López", 
    position: "Estilista", 
    startDate: "15/02/2023", 
    phone: "11-1234-5678",
    status: "active" 
  },
  { 
    id: 2, 
    name: "Juan Pérez", 
    position: "Manicurista", 
    startDate: "03/05/2023", 
    phone: "11-8765-4321",
    status: "active" 
  },
  { 
    id: 3, 
    name: "Ana García", 
    position: "Recepcionista", 
    startDate: "22/06/2023", 
    phone: "11-5678-1234",
    status: "active" 
  },
  { 
    id: 4, 
    name: "Carlos Rodriguez", 
    position: "Estilista", 
    startDate: "10/08/2023", 
    phone: "11-4321-8765",
    status: "inactive" 
  },
  { 
    id: 5, 
    name: "Laura Martinez", 
    position: "Manicurista", 
    startDate: "17/10/2023", 
    phone: "11-2345-6789",
    status: "active" 
  },
];

export default function EmpleadosPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState(mockEmployees);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);

  // Handle search and filter
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    filterEmployees(query, selectedPositions, selectedStatus);
  };

  const handlePositionFilter = (position: string) => {
    const updatedPositions = selectedPositions.includes(position)
      ? selectedPositions.filter(p => p !== position)
      : [...selectedPositions, position];
    
    setSelectedPositions(updatedPositions);
    filterEmployees(searchQuery, updatedPositions, selectedStatus);
  };

  const handleStatusFilter = (status: string) => {
    const updatedStatus = selectedStatus.includes(status)
      ? selectedStatus.filter(s => s !== status)
      : [...selectedStatus, status];
    
    setSelectedStatus(updatedStatus);
    filterEmployees(searchQuery, selectedPositions, updatedStatus);
  };

  const filterEmployees = (query: string, positions: string[], statuses: string[]) => {
    let filtered = mockEmployees;
    
    // Apply search filter
    if (query) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(query) || 
        emp.position.toLowerCase().includes(query)
      );
    }
    
    // Apply position filter
    if (positions.length > 0) {
      filtered = filtered.filter(emp => positions.includes(emp.position));
    }
    
    // Apply status filter
    if (statuses.length > 0) {
      filtered = filtered.filter(emp => statuses.includes(emp.status));
    }
    
    setFilteredEmployees(filtered);
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
        <Button className="bg-salon-400 hover:bg-salon-500">
          <UserRoundPlus className="mr-2 h-4 w-4" />
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
                    <div>
                      <h4 className="font-medium mb-2 text-sm">Estado</h4>
                      <div className="space-y-2">
                        {["active", "inactive"].map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`status-${status}`} 
                              checked={selectedStatus.includes(status)}
                              onCheckedChange={() => handleStatusFilter(status)}
                            />
                            <label 
                              htmlFor={`status-${status}`}
                              className="text-sm font-normal capitalize cursor-pointer"
                            >
                              {status === "active" ? "Activo" : "Inactivo"}
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
                          variant={employee.status === "active" ? "default" : "outline"}
                          className={employee.status === "active" 
                            ? "bg-green-500 hover:bg-green-600" 
                            : ""}
                        >
                          {employee.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
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
    </div>
  );
}
