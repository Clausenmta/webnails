
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, Edit, Trash, ArrowUpDown, ChevronDown, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

// Mock data for repairs
const initialArreglos = [
  { id: 1, cliente: "María López", descripcion: "Uñas quebradas", estado: "Pendiente", fecha: "2025-04-10", precio: 1500 },
  { id: 2, cliente: "Laura Fernández", descripcion: "Reparación de dos uñas", estado: "Completado", fecha: "2025-04-08", precio: 2000 },
  { id: 3, cliente: "Carolina Silva", descripcion: "Uñas dañadas", estado: "En proceso", fecha: "2025-04-09", precio: 1800 },
];

// Estado options
const estadoOptions = ["Pendiente", "En proceso", "Completado", "Cancelado"];

export default function ArreglosPage() {
  const [arreglos, setArreglos] = useState(initialArreglos);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentArreglo, setCurrentArreglo] = useState({
    id: 0,
    cliente: "",
    descripcion: "",
    estado: "Pendiente",
    fecha: new Date().toISOString().split("T")[0],
    precio: 0
  });

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: "fecha",
    direction: "desc"
  });

  // Filter arreglos based on search term
  const filteredArreglos = arreglos.filter(
    (arreglo) =>
      arreglo.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arreglo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arreglo.estado.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort arreglos based on sortConfig
  const sortedArreglos = [...filteredArreglos].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  // Reset form fields
  const resetForm = () => {
    setCurrentArreglo({
      id: 0,
      cliente: "",
      descripcion: "",
      estado: "Pendiente",
      fecha: new Date().toISOString().split("T")[0],
      precio: 0
    });
  };

  // Open add dialog
  const handleAddClick = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const handleEditClick = (arreglo) => {
    setCurrentArreglo(arreglo);
    setIsEditDialogOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentArreglo({
      ...currentArreglo,
      [name]: name === "precio" ? Number(value) : value,
    });
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setCurrentArreglo({
      ...currentArreglo,
      [name]: value,
    });
  };

  // Save new arreglo
  const handleSaveNew = () => {
    if (!currentArreglo.cliente || !currentArreglo.descripcion || !currentArreglo.fecha) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    const newArreglo = {
      ...currentArreglo,
      id: arreglos.length > 0 ? Math.max(...arreglos.map(a => a.id)) + 1 : 1,
    };

    setArreglos([...arreglos, newArreglo]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success("Arreglo agregado exitosamente");
  };

  // Update existing arreglo
  const handleUpdate = () => {
    if (!currentArreglo.cliente || !currentArreglo.descripcion || !currentArreglo.fecha) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    const updatedArreglos = arreglos.map(arreglo => 
      arreglo.id === currentArreglo.id ? currentArreglo : arreglo
    );

    setArreglos(updatedArreglos);
    setIsEditDialogOpen(false);
    resetForm();
    toast.success("Arreglo actualizado exitosamente");
  };

  // Delete arreglo
  const handleDelete = (id) => {
    if (confirm("¿Está seguro de que desea eliminar este arreglo?")) {
      const updatedArreglos = arreglos.filter(arreglo => arreglo.id !== id);
      setArreglos(updatedArreglos);
      toast.success("Arreglo eliminado exitosamente");
    }
  };

  // Export functions
  const exportToPDF = () => {
    toast.success("Exportando a PDF...");
    // Implement actual PDF export functionality here
  };

  const exportToExcel = () => {
    toast.success("Exportando a Excel...");
    // Implement actual Excel export functionality here
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Arreglos</h2>
          <p className="text-muted-foreground">
            Gestiona los servicios que requieren arreglo
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <FileText className="mr-2 h-4 w-4" />
                Exportar
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportToPDF}>
                <FileText className="mr-2 h-4 w-4" />
                Exportar a PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar a Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button className="bg-salon-400 hover:bg-salon-500 w-full sm:w-auto" onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Arreglo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Listado de Arreglos</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar arreglos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("cliente")}
                    >
                      Cliente
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("estado")}
                    >
                      Estado
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("fecha")}
                    >
                      Fecha
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("precio")}
                    >
                      Precio
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedArreglos.length > 0 ? (
                  sortedArreglos.map((arreglo) => (
                    <TableRow key={arreglo.id}>
                      <TableCell className="font-medium">{arreglo.cliente}</TableCell>
                      <TableCell>{arreglo.descripcion}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          arreglo.estado === 'Completado' ? 'bg-green-100 text-green-800' : 
                          arreglo.estado === 'En proceso' ? 'bg-blue-100 text-blue-800' : 
                          arreglo.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {arreglo.estado}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(arreglo.fecha).toLocaleDateString()}</TableCell>
                      <TableCell>${arreglo.precio.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(arreglo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(arreglo.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No se encontraron arreglos.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Arreglo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  name="cliente"
                  placeholder="Nombre del cliente"
                  value={currentArreglo.cliente}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  name="descripcion"
                  placeholder="Descripción del arreglo"
                  value={currentArreglo.descripcion}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={currentArreglo.estado}
                    onValueChange={(value) => handleSelectChange("estado", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadoOptions.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    name="fecha"
                    type="date"
                    value={currentArreglo.fecha}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="precio">Precio</Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  placeholder="0"
                  value={currentArreglo.precio}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-salon-400 hover:bg-salon-500" onClick={handleSaveNew}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Arreglo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-cliente">Cliente</Label>
                <Input
                  id="edit-cliente"
                  name="cliente"
                  placeholder="Nombre del cliente"
                  value={currentArreglo.cliente}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-descripcion">Descripción</Label>
                <Input
                  id="edit-descripcion"
                  name="descripcion"
                  placeholder="Descripción del arreglo"
                  value={currentArreglo.descripcion}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-estado">Estado</Label>
                  <Select
                    value={currentArreglo.estado}
                    onValueChange={(value) => handleSelectChange("estado", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadoOptions.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-fecha">Fecha</Label>
                  <Input
                    id="edit-fecha"
                    name="fecha"
                    type="date"
                    value={currentArreglo.fecha}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-precio">Precio</Label>
                <Input
                  id="edit-precio"
                  name="precio"
                  type="number"
                  placeholder="0"
                  value={currentArreglo.precio}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-salon-400 hover:bg-salon-500" onClick={handleUpdate}>
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
