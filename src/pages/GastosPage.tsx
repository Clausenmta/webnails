import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Calculator, 
  CalendarIcon, 
  DollarSign, 
  Plus, 
  PencilIcon, 
  Trash2, 
  ArrowUpDown,
  Upload,
  FileText,
  Search,
  Filter,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// Tipos de gastos disponibles
const TIPOS_GASTOS = [
  "Alquiler",
  "Servicios",
  "Insumos",
  "Sueldos",
  "Impuestos",
  "Marketing",
  "Mantenimiento",
  "Otros"
];

// Datos iniciales de ejemplo
const initialGastos = [
  {
    id: 1,
    fecha: "2025-04-01",
    concepto: "Alquiler local",
    monto: 250000,
    tipo: "Alquiler",
    comprobante: "Recibo #1234",
    comprobanteFile: null,
    observaciones: ""
  },
  {
    id: 2,
    fecha: "2025-04-05",
    concepto: "Compra esmaltes",
    monto: 75000,
    tipo: "Insumos",
    comprobante: "Factura A-4567",
    comprobanteFile: null,
    observaciones: "Proveedor: Beauty Supplies"
  },
  {
    id: 3,
    fecha: "2025-04-08",
    concepto: "Pago servicios luz",
    monto: 45000,
    tipo: "Servicios",
    comprobante: "Factura #89012",
    comprobanteFile: null,
    observaciones: ""
  }
];

export default function GastosPage() {
  // Estado para la lista de gastos
  const [gastos, setGastos] = useState(initialGastos);
  
  // Estado para el gasto actual (nuevo o edición)
  const [currentGasto, setCurrentGasto] = useState({
    id: 0,
    fecha: "",
    concepto: "",
    monto: 0,
    tipo: "",
    comprobante: "",
    comprobanteFile: null as File | null,
    observaciones: ""
  });
  
  // Estado para el manejo de la fecha con el calendario
  const [fechaGasto, setFechaGasto] = useState<Date | undefined>(undefined);
  
  // Estados para los diálogos
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  // Estado para la ordenación
  const [sortConfig, setSortConfig] = useState({
    key: "fecha",
    direction: "desc" as "asc" | "desc"
  });

  // Estados para la búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filtros, setFiltros] = useState({
    tipos: [] as string[],
    fechaDesde: null as string | null,
    fechaHasta: null as string | null,
    montoMinimo: "" as string,
    montoMaximo: "" as string
  });
  
  // Estado para los filtros aplicados
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtros);
  
  // Estado para las fechas del filtro
  const [fechaDesdeFilter, setFechaDesdeFilter] = useState<Date | undefined>(undefined);
  const [fechaHastaFilter, setFechaHastaFilter] = useState<Date | undefined>(undefined);
  
  // Contador de filtros aplicados
  const [cantidadFiltrosAplicados, setCantidadFiltrosAplicados] = useState(0);

  // Función para resetear el formulario
  const resetForm = () => {
    setCurrentGasto({
      id: 0,
      fecha: "",
      concepto: "",
      monto: 0,
      tipo: "",
      comprobante: "",
      comprobanteFile: null,
      observaciones: ""
    });
    setFechaGasto(undefined);
  };

  // Función para abrir el diálogo de agregar
  const handleAddOpen = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  // Función para abrir el diálogo de edición
  const handleEditOpen = (gasto) => {
    setCurrentGasto(gasto);
    setFechaGasto(gasto.fecha ? new Date(gasto.fecha) : undefined);
    setIsEditDialogOpen(true);
  };

  // Función para abrir el diálogo de eliminación
  const handleDeleteOpen = (gasto) => {
    setCurrentGasto(gasto);
    setIsDeleteDialogOpen(true);
  };

  // Función para manejar los cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentGasto(prev => ({
      ...prev,
      [name]: name === "monto" ? parseFloat(value) || 0 : value
    }));
  };

  // Función para manejar cambios en campos de tipo Select
  const handleSelectChange = (name, value) => {
    setCurrentGasto(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para manejar cambios en la fecha
  const handleDateChange = (date) => {
    setFechaGasto(date);
    setCurrentGasto(prev => ({
      ...prev,
      fecha: date ? format(date, "yyyy-MM-dd") : ""
    }));
  };

  // Función para manejar el cambio en el archivo de comprobante
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setCurrentGasto(prev => ({
        ...prev,
        comprobante: file.name,
        comprobanteFile: file
      }));
    }
  };

  // Función para agregar un nuevo gasto
  const handleAddGasto = () => {
    // Validar campos requeridos
    if (!currentGasto.fecha || !currentGasto.concepto || !currentGasto.monto || !currentGasto.tipo) {
      toast.error("Por favor complete todos los campos obligatorios");
      return;
    }

    const newGasto = {
      ...currentGasto,
      id: Math.max(0, ...gastos.map(g => g.id)) + 1
    };

    setGastos(prev => [...prev, newGasto]);
    setIsAddDialogOpen(false);
    toast.success("Gasto agregado correctamente");
    resetForm();
  };

  // Función para editar un gasto
  const handleEditGasto = () => {
    // Validar campos requeridos
    if (!currentGasto.fecha || !currentGasto.concepto || !currentGasto.monto || !currentGasto.tipo) {
      toast.error("Por favor complete todos los campos obligatorios");
      return;
    }

    setGastos(prev => 
      prev.map(gasto => 
        gasto.id === currentGasto.id ? currentGasto : gasto
      )
    );
    setIsEditDialogOpen(false);
    toast.success("Gasto actualizado correctamente");
    resetForm();
  };

  // Función para eliminar un gasto
  const handleDeleteGasto = () => {
    setGastos(prev => prev.filter(gasto => gasto.id !== currentGasto.id));
    setIsDeleteDialogOpen(false);
    toast.success("Gasto eliminado correctamente");
    resetForm();
  };

  // Función para manejar cambios en los filtros
  const handleFilterChange = (name, value) => {
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para manejar cambios en los filtros de tipo (multiple select)
  const handleTipoFilterToggle = (tipo) => {
    setFiltros(prev => {
      const tiposActuales = [...prev.tipos];
      const index = tiposActuales.indexOf(tipo);
      
      if (index >= 0) {
        tiposActuales.splice(index, 1);
      } else {
        tiposActuales.push(tipo);
      }
      
      return {
        ...prev,
        tipos: tiposActuales
      };
    });
  };

  // Función para manejar cambios en las fechas de filtro
  const handleFilterDateChange = (name, date) => {
    if (name === "fechaDesde") {
      setFechaDesdeFilter(date);
      setFiltros(prev => ({
        ...prev,
        fechaDesde: date ? format(date, "yyyy-MM-dd") : null
      }));
    } else if (name === "fechaHasta") {
      setFechaHastaFilter(date);
      setFiltros(prev => ({
        ...prev,
        fechaHasta: date ? format(date, "yyyy-MM-dd") : null
      }));
    }
  };

  // Función para aplicar los filtros
  const handleApplyFilters = () => {
    setFiltrosAplicados({...filtros});
    
    // Calcular la cantidad de filtros aplicados
    let count = 0;
    if (filtros.tipos.length > 0) count++;
    if (filtros.fechaDesde) count++;
    if (filtros.fechaHasta) count++;
    if (filtros.montoMinimo) count++;
    if (filtros.montoMaximo) count++;
    
    setCantidadFiltrosAplicados(count);
    setIsFilterDialogOpen(false);
    toast.success("Filtros aplicados");
  };

  // Función para resetear los filtros
  const handleResetFilters = () => {
    setFiltros({
      tipos: [],
      fechaDesde: null,
      fechaHasta: null,
      montoMinimo: "",
      montoMaximo: ""
    });
    setFechaDesdeFilter(undefined);
    setFechaHastaFilter(undefined);
    setFiltrosAplicados({
      tipos: [],
      fechaDesde: null,
      fechaHasta: null,
      montoMinimo: "",
      montoMaximo: ""
    });
    setCantidadFiltrosAplicados(0);
    toast.success("Filtros reseteados");
  };

  // Filtrar los gastos según el término de búsqueda y los filtros aplicados
  const filteredGastos = gastos.filter(gasto => {
    // Filtrar por término de búsqueda
    if (searchTerm && !gasto.concepto.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !gasto.tipo.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !gasto.comprobante.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !gasto.observaciones.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filtrar por tipo de gasto
    if (filtrosAplicados.tipos.length > 0 && !filtrosAplicados.tipos.includes(gasto.tipo)) {
      return false;
    }
    
    // Filtrar por fecha desde
    if (filtrosAplicados.fechaDesde) {
      const fechaGasto = new Date(gasto.fecha);
      const fechaDesde = new Date(filtrosAplicados.fechaDesde);
      if (fechaGasto < fechaDesde) return false;
    }
    
    // Filtrar por fecha hasta
    if (filtrosAplicados.fechaHasta) {
      const fechaGasto = new Date(gasto.fecha);
      const fechaHasta = new Date(filtrosAplicados.fechaHasta);
      if (fechaGasto > fechaHasta) return false;
    }
    
    // Filtrar por monto mínimo
    if (filtrosAplicados.montoMinimo && gasto.monto < parseFloat(filtrosAplicados.montoMinimo)) {
      return false;
    }
    
    // Filtrar por monto máximo
    if (filtrosAplicados.montoMaximo && gasto.monto > parseFloat(filtrosAplicados.montoMaximo)) {
      return false;
    }
    
    return true;
  });

  // Ordenar los gastos según la configuración actual
  const sortedGastos = [...filteredGastos].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Función para ordenar la tabla
  const handleSort = (key) => {
    let direction: "asc" | "desc" = "asc";
    
    if (sortConfig.key === key) {
      direction = sortConfig.direction === "asc" ? "desc" : "asc";
    }
    
    setSortConfig({ key, direction });
  };

  // Cálculo del total de gastos
  const totalGastos = filteredGastos.reduce((sum, gasto) => sum + gasto.monto, 0);
  
  // Formatear montos como pesos argentinos
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gastos</h2>
          <p className="text-muted-foreground">
            Gestiona y visualiza los gastos del negocio
          </p>
        </div>
        <Button className="bg-salon-400 hover:bg-salon-500" onClick={handleAddOpen}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Gasto
        </Button>
      </div>
      
      {/* Resumen de gastos */}
      <div className="stats-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Total de Gastos</h3>
            <p className="text-muted-foreground">Período actual</p>
          </div>
          <div className="flex items-center gap-3">
            <Calculator className="h-5 w-5 text-salon-400" />
            <span className="text-2xl font-bold">{formatCurrency(totalGastos)}</span>
          </div>
        </div>
      </div>
      
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar gastos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => setIsFilterDialogOpen(true)}
        >
          <Filter className="h-4 w-4" />
          Filtros
          {cantidadFiltrosAplicados > 0 && (
            <Badge className="ml-1 bg-salon-400 text-white">
              {cantidadFiltrosAplicados}
            </Badge>
          )}
        </Button>
      </div>
      
      {/* Tabla de gastos */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("fecha")}
              >
                <div className="flex items-center gap-1">
                  Fecha
                  <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("concepto")}
              >
                <div className="flex items-center gap-1">
                  Concepto
                  <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("tipo")}
              >
                <div className="flex items-center gap-1">
                  Tipo
                  <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-right"
                onClick={() => handleSort("monto")}
              >
                <div className="flex items-center gap-1 justify-end">
                  Monto
                  <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                </div>
              </TableHead>
              <TableHead>Comprobante</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedGastos.length > 0 ? (
              sortedGastos.map((gasto) => (
                <TableRow key={gasto.id}>
                  <TableCell>
                    {gasto.fecha ? format(new Date(gasto.fecha), "dd/MM/yyyy") : ""}
                  </TableCell>
                  <TableCell>{gasto.concepto}</TableCell>
                  <TableCell>
                    <span className="inline-block px-2 py-1 rounded-full bg-salon-100 text-salon-700 text-xs font-medium">
                      {gasto.tipo}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(gasto.monto)}
                  </TableCell>
                  <TableCell>
                    {gasto.comprobante && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{gasto.comprobante}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditOpen(gasto)}
                      >
                        <PencilIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteOpen(gasto)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hay gastos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Diálogo para agregar gasto */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Gasto</DialogTitle>
            <DialogDescription>
              Complete los detalles del gasto a registrar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fecha">Fecha <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="fecha"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaGasto && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaGasto ? format(fechaGasto, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaGasto}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="concepto">Concepto <span className="text-destructive">*</span></Label>
              <Input
                id="concepto"
                name="concepto"
                value={currentGasto.concepto}
                onChange={handleInputChange}
                placeholder="Ej: Compra de materiales"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo <span className="text-destructive">*</span></Label>
              <Select
                onValueChange={(value) => handleSelectChange("tipo", value)}
                value={currentGasto.tipo}
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Seleccionar tipo de gasto" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_GASTOS.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="monto">Monto <span className="text-destructive">*</span></Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="monto"
                  name="monto"
                  type="number"
                  value={currentGasto.monto || ""}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="comprobante">Comprobante</Label>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label 
                    htmlFor="file-upload" 
                    className="cursor-pointer flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Upload className="h-4 w-4" />
                      <span>{currentGasto.comprobante || "Adjuntar comprobante"}</span>
                    </div>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
                {currentGasto.comprobante && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span>{currentGasto.comprobante}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Input
                id="observaciones"
                name="observaciones"
                value={currentGasto.observaciones}
                onChange={handleInputChange}
                placeholder="Notas adicionales"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddGasto}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para editar gasto */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Gasto</DialogTitle>
            <DialogDescription>
              Modifique los detalles del gasto seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-fecha">Fecha <span className="text-destructive">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="edit-fecha"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fechaGasto && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fechaGasto ? format(fechaGasto, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={fechaGasto}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-concepto">Concepto <span className="text-destructive">*</span></Label>
              <Input
                id="edit-concepto"
                name="concepto"
                value={currentGasto.concepto}
                onChange={handleInputChange}
                placeholder="Ej: Compra de materiales"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-tipo">Tipo <span className="text-destructive">*</span></Label>
              <Select
                onValueChange={(value) => handleSelectChange("tipo", value)}
                value={currentGasto.tipo}
              >
                <SelectTrigger id="edit-tipo">
                  <SelectValue placeholder="Seleccionar tipo de gasto" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_GASTOS.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-monto">Monto <span className="text-destructive">*</span></Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-monto"
                  name="monto"
                  type="number"
                  value={currentGasto.monto || ""}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-comprobante">Comprobante</Label>
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label 
                    htmlFor="edit-file-upload" 
                    className="cursor-pointer flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Upload className="h-4 w-4" />
                      <span>{currentGasto.comprobante || "Adjuntar comprobante"}</span>
                    </div>
                  </Label>
                  <Input
                    id="edit-file-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
                {currentGasto.comprobante && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span>{currentGasto.comprobante}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-observaciones">Observaciones</Label>
              <Input
                id="edit-observaciones"
                name="observaciones"
                value={currentGasto.observaciones}
                onChange={handleInputChange}
                placeholder="Notas adicionales"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditGasto}>Actualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para confirmar eliminación */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Gasto</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar este gasto? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p><strong>Concepto:</strong> {currentGasto.concepto}</p>
            <p><strong>Fecha:</strong> {currentGasto.fecha ? format(new Date(currentGasto.fecha), "dd/MM/yyyy") : ""}</p>
            <p><strong>Monto:</strong> {formatCurrency(currentGasto.monto)}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteGasto}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para filtros */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filtrar Gastos</DialogTitle>
            <DialogDescription>
              Seleccione los criterios para filtrar la lista de gastos
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tipo de Gasto</Label>
              <div className="flex flex-wrap gap-2">
                {TIPOS_GASTOS.map((tipo) => (
                  <Badge
                    key={tipo}
                    variant={filtros.tipos.includes(tipo) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer",
                      filtros.tipos.includes(tipo) ? "bg-salon-400 hover:bg-salon-500" : ""
                    )}
                    onClick={() => handleTipoFilterToggle(tipo)}
                  >
                    {tipo}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Rango de Fechas</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <Label className="text-xs">Desde</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !fechaDesdeFilter && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaDesdeFilter ? format(fechaDesdeFilter, "dd/MM/yyyy") : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fechaDesdeFilter}
                        onSelect={(date) => handleFilterDateChange("fechaDesde", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid gap-1">
                  <Label className="text-xs">Hasta</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !fechaHastaFilter && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaHastaFilter ? format(fechaHastaFilter, "dd/MM/yyyy") : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fechaHastaFilter}
                        onSelect={(date) => handleFilterDateChange("fechaHasta", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Rango de Montos</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <Label className="text-xs">Mínimo</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0"
                      className="pl-9"
                      value={filtros.montoMinimo}
                      onChange={(e) => handleFilterChange("montoMinimo", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid gap-1">
                  <Label className="text-xs">Máximo</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0"
                      className="pl-9"
                      value={filtros.montoMaximo}
                      onChange={(e) => handleFilterChange("montoMaximo", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {cantidadFiltrosAplicados > 0 && (
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  {cantidadFiltrosAplicados} filtro(s) aplicado(s)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-sm gap-1"
                  onClick={handleResetFilters}
                >
                  <X className="h-3.5 w-3.5" />
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFilterDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApplyFilters}>Aplicar Filtros</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
