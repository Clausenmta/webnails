import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, Edit, Trash, ArrowUpDown, ChevronDown, FileText, FileSpreadsheet, Calendar as CalendarIcon, CheckSquare, Filter, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useArreglosManagement } from "@/hooks/useArreglosManagement";
import { useAuth } from "@/contexts/AuthContext";
import { NewArreglo, Arreglo } from "@/services/arreglosService";

const estadoOptions = ["pendiente", "en_proceso", "completado", "cancelado"];
const manicuristasOptions = [
  "Cecilia", "Lourdes", "Ludmila", "Analia", "Rocio", 
  "Graciela", "Samanta", "Belen", "Daiana", "Agostina", "Daniela"
];
const descuentaOptions = ["SI", "NO"];

export default function ArreglosPage() {
  const { user } = useAuth();
  const {
    filteredArreglos,
    isLoading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    currentArreglo,
    setCurrentArreglo,
    searchTerm,
    setSearchTerm,
    filtros,
    setFiltros,
    filtrosAplicados,
    cantidadFiltrosAplicados,
    vistaActiva,
    setVistaActiva,
    addArregloMutation,
    updateArregloMutation,
    deleteArregloMutation,
    fechaComandaDate,
    setFechaComandaDate,
    fechaArregloDate,
    setFechaArregloDate,
    fechaDesdeDate,
    setFechaDesdeDate,
    fechaHastaDate,
    setFechaHastaDate,
    mismaManicura,
    setMismaManicura,
    sortConfig,
    setSortConfig,
    handleApplyFilters,
    handleResetFilters,
    handleExportReport,
    resetForm
  } = useArreglosManagement();

  const [formData, setFormData] = useState<Partial<NewArreglo>>({
    client_name: "",
    description: "",
    status: "pendiente",
    date: new Date().toISOString().split("T")[0],
    price: 0,
    created_by: "",
    service_type: "",
    payment_status: "pendiente",
    notes: ""
  });

  useEffect(() => {
    if (currentArreglo) {
      setFormData(currentArreglo);
      setFechaComandaDate(currentArreglo.date ? new Date(currentArreglo.date) : undefined);
      setFechaArregloDate(currentArreglo.completed_date ? new Date(currentArreglo.completed_date) : undefined);
      setMismaManicura(currentArreglo.created_by === currentArreglo.assigned_to);
    } else {
      setFormData({
        client_name: "",
        description: "",
        status: "pendiente",
        date: new Date().toISOString().split("T")[0],
        price: 0,
        created_by: user?.username || "",
        service_type: "",
        payment_status: "pendiente",
        notes: ""
      });
    }
  }, [currentArreglo, user]);

  const handleToggleFilter = (field: keyof typeof filtros, value: string) => {
    if (field === 'estados' || field === 'manicuristasOriginal' || field === 'manicuristasArreglo') {
      const currentValues = filtros[field] || [];
      
      if (currentValues.includes(value)) {
        setFiltros({
          ...filtros,
          [field]: currentValues.filter(v => v !== value)
        });
      } else {
        setFiltros({
          ...filtros,
          [field]: [...currentValues, value]
        });
      }
    }
  };

  const handleFilterChange = (field: keyof typeof filtros, value: any) => {
    setFiltros({
      ...filtros,
      [field]: value
    });
  };

  const handleAddClick = () => {
    setCurrentArreglo(null);
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (arreglo: any) => {
    setCurrentArreglo(arreglo);
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price" ? Number(value) : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "created_by" && mismaManicura) {
      setFormData(prev => ({
        ...prev,
        assigned_to: value
      }));
    }
  };

  const handleMismaManicuraChange = (checked: boolean) => {
    setMismaManicura(checked);
    
    if (checked && formData.created_by) {
      setFormData(prev => ({
        ...prev,
        assigned_to: prev.created_by
      }));
    }
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (name === "date") {
      setFechaComandaDate(date);
      setFormData({
        ...formData,
        date: date ? date.toISOString().split("T")[0] : "",
      });
    } else if (name === "completed_date") {
      setFechaArregloDate(date);
      setFormData({
        ...formData,
        completed_date: date ? date.toISOString().split("T")[0] : "",
      });
    } else if (name === "fechaDesde") {
      setFechaDesdeDate(date);
      setFiltros({
        ...filtros,
        fechaDesde: date ? date.toISOString().split("T")[0] : null,
      });
    } else if (name === "fechaHasta") {
      setFechaHastaDate(date);
      setFiltros({
        ...filtros,
        fechaHasta: date ? date.toISOString().split("T")[0] : null,
      });
    }
  };

  const handleSaveNew = () => {
    if (!formData.client_name || !formData.description || !formData.date) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    addArregloMutation.mutate(formData as NewArreglo);
  };

  const handleUpdate = () => {
    if (!currentArreglo) return;
    
    if (!formData.client_name || !formData.description || !formData.date) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    updateArregloMutation.mutate({ 
      id: currentArreglo.id, 
      updates: formData as Partial<NewArreglo> 
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este arreglo?")) {
      deleteArregloMutation.mutate(id);
    }
  };

  const handleSort = (key: keyof Arreglo) => {
    setSortConfig({
      key: key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc",
    });
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'completado': return 'bg-green-100 text-green-800';
      case 'en_proceso': return 'bg-blue-100 text-blue-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const mapStatus = (status: string) => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En proceso';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
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
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportReport}>
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar arreglos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-row gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1" 
                onClick={() => setIsFilterDialogOpen(true)}
              >
                <Filter className="h-4 w-4" />
                Filtros
                {cantidadFiltrosAplicados > 0 && (
                  <Badge className="ml-1 bg-salon-400">{cantidadFiltrosAplicados}</Badge>
                )}
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <ToggleGroup 
              type="single" 
              value={vistaActiva}
              onValueChange={(value) => {
                if (value) setVistaActiva(value);
              }}
              className="justify-start"
            >
              <ToggleGroupItem value="todos" className="text-xs">
                Todos
              </ToggleGroupItem>
              <ToggleGroupItem value="pendientes" className="text-xs">
                Pendientes
              </ToggleGroupItem>
              <ToggleGroupItem value="proceso" className="text-xs">
                En proceso
              </ToggleGroupItem>
              <ToggleGroupItem value="completados" className="text-xs">
                Completados
              </ToggleGroupItem>
              <ToggleGroupItem value="cancelados" className="text-xs">
                Cancelados
              </ToggleGroupItem>
            </ToggleGroup>
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
                      onClick={() => handleSort("client_name")}
                    >
                      Cliente
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("status")}
                    >
                      Estado
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("created_by")}
                    >
                      Comanda Original
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("assigned_to")}
                    >
                      Arreglado Por
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("date")}
                    >
                      Fecha
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => handleSort("price")}
                    >
                      Precio
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Cargando arreglos...
                    </TableCell>
                  </TableRow>
                ) : filteredArreglos.length > 0 ? (
                  filteredArreglos.map((arreglo) => (
                    <TableRow key={arreglo.id}>
                      <TableCell className="font-medium">{arreglo.client_name}</TableCell>
                      <TableCell>{arreglo.description}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoBadgeClass(arreglo.status)}`}>
                          {mapStatus(arreglo.status)}
                        </span>
                      </TableCell>
                      <TableCell>{arreglo.created_by}</TableCell>
                      <TableCell>{arreglo.assigned_to || '-'}</TableCell>
                      <TableCell>{arreglo.date}</TableCell>
                      <TableCell>${arreglo.price.toLocaleString()}</TableCell>
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Arreglo</DialogTitle>
            <DialogDescription>
              Complete los datos del arreglo a realizar
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="client_name">Cliente</Label>
                <Input
                  id="client_name"
                  name="client_name"
                  placeholder="Nombre del cliente"
                  value={formData.client_name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Descripción del arreglo"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="created_by">Comanda Original</Label>
                  <Select
                    value={formData.created_by || ""}
                    onValueChange={(value) => handleSelectChange("created_by", value)}
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
                  <Label htmlFor="date">Fecha Comanda</Label>
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
                        onSelect={(date) => handleDateChange("date", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="assigned_to">Arreglado Por</Label>
                  <Select
                    value={formData.assigned_to || ""}
                    onValueChange={(value) => handleSelectChange("assigned_to", value)}
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
                  <Label htmlFor="completed_date">Fecha Arreglo</Label>
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
                        onSelect={(date) => handleDateChange("completed_date", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Observaciones</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Observaciones adicionales"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={formData.status || "pendiente"}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadoOptions.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {mapStatus(estado)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payment_status">Pago</Label>
                  <Select
                    value={formData.payment_status || "pendiente"}
                    onValueChange={(value) => handleSelectChange("payment_status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estado de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="pagado">Pagado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="0"
                    value={formData.price || 0}
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
            <Button 
              className="bg-salon-400 hover:bg-salon-500" 
              onClick={handleSaveNew}
              disabled={addArregloMutation.isPending}
            >
              {addArregloMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Arreglo</DialogTitle>
            <DialogDescription>
              Actualice los datos del arreglo
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-client_name">Cliente</Label>
                <Input
                  id="edit-client_name"
                  name="client_name"
                  placeholder="Nombre del cliente"
                  value={formData.client_name || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Input
                  id="edit-description"
                  name="description"
                  placeholder="Descripción del arreglo"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-created_by">Comanda Original</Label>
                  <Select
                    value={formData.created_by || ""}
                    onValueChange={(value) => handleSelectChange("created_by", value)}
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
                  <Label htmlFor="edit-date">Fecha Comanda</Label>
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
                        onSelect={(date) => handleDateChange("date", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-assigned_to">Arreglado Por</Label>
                  <Select
                    value={formData.assigned_to || ""}
                    onValueChange={(value) => handleSelectChange("assigned_to", value)}
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
                  <Label htmlFor="edit-completed_date">Fecha Arreglo</Label>
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
                        onSelect={(date) => handleDateChange("completed_date", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Observaciones</Label>
                <Textarea
                  id="edit-notes"
                  name="notes"
                  placeholder="Observaciones adicionales"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select
                    value={formData.status || "pendiente"}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadoOptions.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {mapStatus(estado)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-payment_status">Pago</Label>
                  <Select
                    value={formData.payment_status || "pendiente"}
                    onValueChange={(value) => handleSelectChange("payment_status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estado de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="pagado">Pagado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Precio</Label>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    placeholder="0"
                    value={formData.price || 0}
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
            <Button 
              className="bg-salon-400 hover:bg-salon-500" 
              onClick={handleUpdate}
              disabled={updateArregloMutation.isPending}
            >
              {updateArregloMutation.isPending ? "Actualizando..." : "Actualizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Filtrar Arreglos</DialogTitle>
            <DialogDescription>
              Seleccione los criterios para filtrar los arreglos
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label>Estado</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {estadoOptions.map((estado) => (
                    <Badge
                      key={estado}
                      variant={filtros.estados.includes(estado) ? "default" : "outline"}
                      className={filtros.estados.includes(estado) ? "bg-salon-400 hover:bg-salon-500" : ""}
                      onClick={() => handleToggleFilter('estados', estado)}
                    >
                      {mapStatus(estado)}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Comanda Original</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {manicuristasOptions.map((manicurista) => (
                    <Badge
                      key={manicurista}
                      variant={filtros.manicuristasOriginal.includes(manicurista) ? "default" : "outline"}
                      className={filtros.manicuristasOriginal.includes(manicurista) ? "bg-salon-400 hover:bg-salon-500" : ""}
                      onClick={() => handleToggleFilter('manicuristasOriginal', manicurista)}
                    >
                      {manicurista}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Arreglado Por</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {manicuristasOptions.map((manicurista) => (
                    <Badge
                      key={manicurista}
                      variant={filtros.manicuristasArreglo.includes(manicurista) ? "default" : "outline"}
                      className={filtros.manicuristasArreglo.includes(manicurista) ? "bg-salon-400 hover:bg-salon-500" : ""}
                      onClick={() => handleToggleFilter('manicuristasArreglo', manicurista)}
                    >
                      {manicurista}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Fecha Desde</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fechaDesdeDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaDesdeDate ? format(fechaDesdeDate, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fechaDesdeDate}
                        onSelect={(date) => handleDateChange("fechaDesde", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>Fecha Hasta</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fechaHastaDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaHastaDate ? format(fechaHastaDate, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fechaHastaDate}
                        onSelect={(date) => handleDateChange("fechaHasta", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="precioMinimo">Precio Mínimo</Label>
                  <Input
                    id="precioMinimo"
                    type="number"
                    placeholder="0"
                    value={filtros.precioMinimo}
                    onChange={(e) => handleFilterChange('precioMinimo', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="precioMaximo">Precio Máximo</Label>
                  <Input
                    id="precioMaximo"
                    type="number"
                    placeholder="0"
                    value={filtros.precioMaximo}
                    onChange={(e) => handleFilterChange('precioMaximo', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleResetFilters}>
              Restablecer
            </Button>
            <Button
              className="bg-salon-400 hover:bg-salon-500"
              onClick={handleApplyFilters}
            >
              Aplicar Filtros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
