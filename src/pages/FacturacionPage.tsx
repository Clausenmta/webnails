
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, FileText, Trash2, Edit, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Tipo de datos para las facturas
interface Factura {
  id: string;
  numero: string;
  fecha: string;
  cliente: string;
  monto: number;
  estado: "Pagada" | "Pendiente" | "Cancelada";
}

// Datos de ejemplo
const facturasIniciales: Factura[] = [
  {
    id: "1",
    numero: "F-2023-001",
    fecha: "2023-10-15",
    cliente: "María González",
    monto: 1500,
    estado: "Pagada",
  },
  {
    id: "2",
    numero: "F-2023-002",
    fecha: "2023-10-20",
    cliente: "Juan Pérez",
    monto: 2300,
    estado: "Pendiente",
  },
  {
    id: "3",
    numero: "F-2023-003",
    fecha: "2023-11-05",
    cliente: "Laura Rodríguez",
    monto: 1800,
    estado: "Pagada",
  },
  {
    id: "4",
    numero: "F-2023-004",
    fecha: "2023-11-15",
    cliente: "Carlos Fernández",
    monto: 3200,
    estado: "Cancelada",
  },
  {
    id: "5",
    numero: "F-2023-005",
    fecha: "2023-12-01",
    cliente: "Ana Martínez",
    monto: 1950,
    estado: "Pendiente",
  },
];

// Componente principal de la página de facturación
export default function FacturacionPage() {
  const [facturas, setFacturas] = useState<Factura[]>(facturasIniciales);
  const [filtro, setFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<string | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [facturaActual, setFacturaActual] = useState<Factura | null>(null);

  // Formulario para crear/editar facturas
  const form = useForm<Omit<Factura, "id">>({
    defaultValues: {
      numero: "",
      fecha: new Date().toISOString().split('T')[0],
      cliente: "",
      monto: 0,
      estado: "Pendiente",
    }
  });

  // Filtrar facturas según los criterios de búsqueda
  const facturasFiltradas = facturas.filter(factura => {
    const coincideFiltro = 
      factura.numero.toLowerCase().includes(filtro.toLowerCase()) ||
      factura.cliente.toLowerCase().includes(filtro.toLowerCase());
    
    const coincideEstado = 
      !estadoFiltro || factura.estado === estadoFiltro;
    
    return coincideFiltro && coincideEstado;
  });

  // Manejar la creación o edición de una factura
  const handleSubmit = (data: Omit<Factura, "id">) => {
    if (facturaActual) {
      // Editar factura existente
      setFacturas(facturas.map(f => 
        f.id === facturaActual.id ? { ...data, id: facturaActual.id } : f
      ));
      toast.success("Factura actualizada correctamente");
    } else {
      // Crear nueva factura
      const nuevaFactura: Factura = {
        ...data,
        id: (facturas.length + 1).toString(),
      };
      setFacturas([...facturas, nuevaFactura]);
      toast.success("Factura creada correctamente");
    }
    
    setIsDialogOpen(false);
    setFacturaActual(null);
    form.reset();
  };

  // Abrir el formulario para editar una factura
  const editarFactura = (factura: Factura) => {
    setFacturaActual(factura);
    form.reset({
      numero: factura.numero,
      fecha: factura.fecha,
      cliente: factura.cliente,
      monto: factura.monto,
      estado: factura.estado,
    });
    setIsDialogOpen(true);
  };

  // Eliminar una factura
  const eliminarFactura = (id: string) => {
    setFacturas(facturas.filter(f => f.id !== id));
    toast.success("Factura eliminada correctamente");
  };

  // Nueva factura (resetear formulario y abrir diálogo)
  const nuevaFactura = () => {
    setFacturaActual(null);
    form.reset({
      numero: `F-${new Date().getFullYear()}-${(facturas.length + 1).toString().padStart(3, '0')}`,
      fecha: new Date().toISOString().split('T')[0],
      cliente: "",
      monto: 0,
      estado: "Pendiente",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Facturación</h2>
          <p className="text-muted-foreground">
            Gestiona la facturación de tu negocio
          </p>
        </div>
        <Button className="bg-salon-400 hover:bg-salon-500" onClick={nuevaFactura}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Factura
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar facturas..."
            className="pl-10"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <Select
          value={estadoFiltro}
          onValueChange={setEstadoFiltro}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="Pagada">Pagada</SelectItem>
            <SelectItem value="Pendiente">Pendiente</SelectItem>
            <SelectItem value="Cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabla de facturas */}
      <div className="rounded-md border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facturasFiltradas.length > 0 ? (
              facturasFiltradas.map((factura) => (
                <TableRow key={factura.id}>
                  <TableCell>{factura.numero}</TableCell>
                  <TableCell>{factura.fecha}</TableCell>
                  <TableCell>{factura.cliente}</TableCell>
                  <TableCell className="text-right">${factura.monto.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      factura.estado === "Pagada" 
                        ? "bg-green-100 text-green-800" 
                        : factura.estado === "Pendiente" 
                          ? "bg-yellow-100 text-yellow-800" 
                          : "bg-red-100 text-red-800"
                    }`}>
                      {factura.estado}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => editarFactura(factura)}
                      >
                        <Edit className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => eliminarFactura(factura.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No se encontraron facturas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo para crear/editar facturas */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {facturaActual ? "Editar Factura" : "Nueva Factura"}
            </DialogTitle>
            <DialogDescription>
              Complete los detalles de la factura
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numero">Número de Factura</Label>
                <Input
                  id="numero"
                  {...form.register("numero")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  {...form.register("fecha")}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                {...form.register("cliente")}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monto">Monto ($)</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  {...form.register("monto", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={form.watch("estado")}
                  onValueChange={(value: "Pagada" | "Pendiente" | "Cancelada") => 
                    form.setValue("estado", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pagada">Pagada</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit" className="bg-salon-400 hover:bg-salon-500">
                {facturaActual ? "Actualizar" : "Crear"} Factura
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
