
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, Edit, Trash, ArrowUpDown, ChevronDown, FileText, FileSpreadsheet, Calendar as CalendarIcon, CheckSquare } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

// Mock data for repairs
const initialArreglos = [
  { 
    id: 1, 
    cliente: "María López", 
    descripcion: "Uñas quebradas", 
    estado: "Pendiente", 
    fecha: "2025-04-10", 
    precio: 1500,
    comandaOriginal: "Cecilia",
    fechaComanda: "2025-04-05",
    arregladoPor: "Cecilia",
    observaciones: "Cliente habitual",
    fechaArreglo: "2025-04-10",
    descuenta: "NO"
  },
  { 
    id: 2, 
    cliente: "Laura Fernández", 
    descripcion: "Reparación de dos uñas", 
    estado: "Completado", 
    fecha: "2025-04-08", 
    precio: 2000,
    comandaOriginal: "Lourdes",
    fechaComanda: "2025-04-01",
    arregladoPor: "Lourdes",
    observaciones: "Urgente",
    fechaArreglo: "2025-04-08",
    descuenta: "SI"
  },
  { 
    id: 3, 
    cliente: "Carolina Silva", 
    descripcion: "Uñas dañadas", 
    estado: "En proceso", 
    fecha: "2025-04-09", 
    precio: 1800,
    comandaOriginal: "Ludmila",
    fechaComanda: "2025-04-03",
    arregladoPor: "Daiana",
    observaciones: "",
    fechaArreglo: "2025-04-09",
    descuenta: "NO"
  },
];

// Estado options
const estadoOptions = ["Pendiente", "En proceso", "Completado", "Cancelado"];

// Manicuristas options
const manicuristasOptions = [
  "Cecilia", "Lourdes", "Ludmila", "Analia", "Rocio", 
  "Graciela", "Samanta", "Belen", "Daiana", "Agostina", "Daniela"
];

// Descuenta options
const descuentaOptions = ["SI", "NO"];

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
    precio: 0,
    comandaOriginal: "",
    fechaComanda: new Date().toISOString().split("T")[0],
    arregladoPor: "",
    observaciones: "",
    fechaArreglo: new Date().toISOString().split("T")[0],
    descuenta: "NO"
  });

  // Calendar states
  const [fechaComandaDate, setFechaComandaDate] = useState<Date | undefined>(undefined);
  const [fechaArregloDate, setFechaArregloDate] = useState<Date | undefined>(undefined);

  // Checkbox state for "Misma manicura que original"
  const [mismaManicura, setMismaManicura] = useState(false);

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
      arreglo.estado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arreglo.comandaOriginal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arreglo.arregladoPor.toLowerCase().includes(searchTerm.toLowerCase())
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
      precio: 0,
      comandaOriginal: "",
      fechaComanda: new Date().toISOString().split("T")[0],
      arregladoPor: "",
      observaciones: "",
      fechaArreglo: new Date().toISOString().split("T")[0],
      descuenta: "NO"
    });
    setFechaComandaDate(undefined);
    setFechaArregloDate(undefined);
    setMismaManicura(false);
  };

  // Open add dialog
  const handleAddClick = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  // Open edit dialog
  const handleEditClick = (arreglo) => {
    setCurrentArreglo(arreglo);
    setFechaComandaDate(arreglo.fechaComanda ? new Date(arreglo.fechaComanda) : undefined);
    setFechaArregloDate(arreglo.fechaArreglo ? new Date(arreglo.fechaArreglo) : undefined);
    setMismaManicura(arreglo.comandaOriginal === arreglo.arregladoPor);
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

    // If changing comanda original and "misma manicura" is checked, auto-fill arregladoPor
    if (name === "comandaOriginal" && mismaManicura) {
      setCurrentArreglo(prev => ({
        ...prev,
        arregladoPor: value
      }));
    }
  };

  // Handle checkbox change
  const handleMismaManicuraChange = (checked) => {
    setMismaManicura(checked);
    
    // If checked and there's a comanda original selected, auto-fill arregladoPor
    if (checked && currentArreglo.comandaOriginal) {
      setCurrentArreglo(prev => ({
        ...prev,
        arregladoPor: prev.comandaOriginal
      }));
    }
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    if (name === "fechaComanda") {
      setFechaComandaDate(date);
      setCurrentArreglo({
        ...currentArreglo,
        fechaComanda: date ? date.toISOString().split("T")[0] : "",
      });
    } else if (name === "fechaArreglo") {
      setFechaArregloDate(date);
      setCurrentArreglo({
        ...currentArreglo,
        fechaArreglo: date ? date.toISOString().split("T")[0] : "",
      });
    }
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
                      onClick={() => handleSort("comandaOriginal")}
                    >
                      Comanda Original
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("arregladoPor")}
                    >
                      Arreglado Por
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
                      <TableCell>{arreglo.comandaOriginal}</TableCell>
                      <TableCell>{arreglo.arregladoPor}</TableCell>
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
                    <TableCell colSpan={8} className="h-24 text-center">
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
        <DialogContent className="sm:max-w-[600px]">
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
                  <Label htmlFor="comandaOriginal">Comanda Original</Label>
                  <Select
                    value={currentArreglo.comandaOriginal}
                    onValueChange={(value) => handleSelectChange("comandaOriginal", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar manicurista" />
                    </SelectTrigger>
                    <SelectContent>
                      {manicuristasOptions.map((manicurista) => (
                        <SelectItem key={manicurista} value={manicurista}>
                          {manicurista}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fechaComanda">Fecha Comanda</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fechaComandaDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaComandaDate ? format(fechaComandaDate, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fechaComandaDate}
                        onSelect={(date) => handleDateChange("fechaComanda", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="arregladoPor">Arreglado Por</Label>
                  <Select
                    value={currentArreglo.arregladoPor}
                    onValueChange={(value) => handleSelectChange("arregladoPor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar manicurista" />
                    </SelectTrigger>
                    <SelectContent>
                      {manicuristasOptions.map((manicurista) => (
                        <SelectItem key={manicurista} value={manicurista}>
                          {manicurista}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2 mt-1">
                    <Checkbox 
                      id="misma-manicura" 
                      checked={mismaManicura}
                      onCheckedChange={handleMismaManicuraChange}
                    />
                    <label
                      htmlFor="misma-manicura"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Misma manicura que original
                    </label>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fechaArreglo">Fecha Arreglo</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fechaArregloDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaArregloDate ? format(fechaArregloDate, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fechaArregloDate}
                        onSelect={(date) => handleDateChange("fechaArreglo", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  name="observaciones"
                  placeholder="Observaciones adicionales"
                  value={currentArreglo.observaciones}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
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
                  <Label htmlFor="descuenta">Descuenta</Label>
                  <Select
                    value={currentArreglo.descuenta}
                    onValueChange={(value) => handleSelectChange("descuenta", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="¿Descuenta?" />
                    </SelectTrigger>
                    <SelectContent>
                      {descuentaOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
        <DialogContent className="sm:max-w-[600px]">
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
                  <Label htmlFor="edit-comandaOriginal">Comanda Original</Label>
                  <Select
                    value={currentArreglo.comandaOriginal}
                    onValueChange={(value) => handleSelectChange("comandaOriginal", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar manicurista" />
                    </SelectTrigger>
                    <SelectContent>
                      {manicuristasOptions.map((manicurista) => (
                        <SelectItem key={manicurista} value={manicurista}>
                          {manicurista}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-fechaComanda">Fecha Comanda</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fechaComandaDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaComandaDate ? format(fechaComandaDate, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fechaComandaDate}
                        onSelect={(date) => handleDateChange("fechaComanda", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-arregladoPor">Arreglado Por</Label>
                  <Select
                    value={currentArreglo.arregladoPor}
                    onValueChange={(value) => handleSelectChange("arregladoPor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar manicurista" />
                    </SelectTrigger>
                    <SelectContent>
                      {manicuristasOptions.map((manicurista) => (
                        <SelectItem key={manicurista} value={manicurista}>
                          {manicurista}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2 mt-1">
                    <Checkbox 
                      id="edit-misma-manicura" 
                      checked={mismaManicura}
                      onCheckedChange={handleMismaManicuraChange}
                    />
                    <label
                      htmlFor="edit-misma-manicura"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Misma manicura que original
                    </label>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-fechaArreglo">Fecha Arreglo</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fechaArregloDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaArregloDate ? format(fechaArregloDate, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fechaArregloDate}
                        onSelect={(date) => handleDateChange("fechaArreglo", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-observaciones">Observaciones</Label>
                <Textarea
                  id="edit-observaciones"
                  name="observaciones"
                  placeholder="Observaciones adicionales"
                  value={currentArreglo.observaciones}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
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
                  <Label htmlFor="edit-descuenta">Descuenta</Label>
                  <Select
                    value={currentArreglo.descuenta}
                    onValueChange={(value) => handleSelectChange("descuenta", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="¿Descuenta?" />
                    </SelectTrigger>
                    <SelectContent>
                      {descuentaOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
