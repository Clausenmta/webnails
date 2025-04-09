
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, FileText, Trash2, Edit, Eye, FileCheck, Download, Printer } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

// Tipo para los productos/servicios en la factura
interface ProductoServicio {
  id: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  unidadMedida: string;
  precioUnitario: number;
  porcentajeBonificacion: number;
  subtotal: number;
  alicuotaIVA: "21%" | "10.5%" | "27%" | "5%" | "2.5%" | "0%";
  subtotalConIVA: number;
}

// Datos del emisor de la factura
interface DatosEmisor {
  razonSocial: string;
  domicilioComercial: string;
  condicionIVA: string;
  cuit: string;
  puntoVenta: string;
  fechaInicioActividades: string;
  ingresosBrutos: string;
}

// Datos del receptor de la factura
interface DatosReceptor {
  razonSocial: string;
  domicilioComercial: string;
  condicionIVA: string;
  condicionVenta: "Contado" | "Cuenta Corriente" | "Cheque" | "Tarjeta de Crédito";
  cuit: string;
}

// Tipo de datos para las facturas completo
interface Factura {
  id: string;
  numero: string;
  tipo: "A" | "B" | "C" | "E";
  fecha: string;
  fechaVencimiento: string;
  cliente: string;
  monto: number;
  estado: "Pagada" | "Pendiente" | "Cancelada";
  
  // Nuevos campos según modelo AFIP
  emisor: DatosEmisor;
  receptor: DatosReceptor;
  productos: ProductoServicio[];
  
  // Totales e impuestos
  importeNeto: number;
  importeIVA: {
    iva21: number;
    iva105: number;
    iva27: number;
    iva5: number;
    iva25: number;
    iva0: number;
  };
  otrosTributos: number;
  importeTotal: number;
  
  // Datos AFIP
  cae: string;
  fechaVtoCAE: string;
}

// Datos de ejemplo del emisor
const emisorDefault: DatosEmisor = {
  razonSocial: "LUCIANO PAULA VICTORIA",
  domicilioComercial: "A.J.Paz Bis 1065 - Rosario Norte, Santa Fe",
  condicionIVA: "IVA Responsable Inscripto",
  cuit: "27309200298",
  puntoVenta: "00003",
  fechaInicioActividades: "01/09/2023",
  ingresosBrutos: "021-521829-8",
};

// Datos de ejemplo
const facturasIniciales: Factura[] = [
  {
    id: "1",
    numero: "F-2023-001",
    tipo: "A",
    fecha: "2023-10-15",
    fechaVencimiento: "2023-10-25",
    cliente: "María González",
    monto: 1500,
    estado: "Pagada",
    emisor: emisorDefault,
    receptor: {
      razonSocial: "GONZALEZ MARIA",
      domicilioComercial: "San Martín 123 - Rosario, Santa Fe",
      condicionIVA: "IVA Responsable Inscripto",
      condicionVenta: "Contado",
      cuit: "27123456789",
    },
    productos: [
      {
        id: "1",
        codigo: "S001",
        descripcion: "Sesión de peluquería",
        cantidad: 1,
        unidadMedida: "unidades",
        precioUnitario: 1500,
        porcentajeBonificacion: 0,
        subtotal: 1500,
        alicuotaIVA: "21%",
        subtotalConIVA: 1815,
      }
    ],
    importeNeto: 1500,
    importeIVA: {
      iva21: 315,
      iva105: 0,
      iva27: 0,
      iva5: 0,
      iva25: 0,
      iva0: 0,
    },
    otrosTributos: 0,
    importeTotal: 1815,
    cae: "75028238337040",
    fechaVtoCAE: "2023-10-25",
  },
  {
    id: "2",
    numero: "F-2023-002",
    tipo: "A",
    fecha: "2023-10-20",
    fechaVencimiento: "2023-10-30",
    cliente: "Juan Pérez",
    monto: 2300,
    estado: "Pendiente",
    emisor: emisorDefault,
    receptor: {
      razonSocial: "PEREZ JUAN",
      domicilioComercial: "Corrientes 456 - Rosario, Santa Fe",
      condicionIVA: "IVA Responsable Inscripto",
      condicionVenta: "Contado",
      cuit: "20345678901",
    },
    productos: [
      {
        id: "1",
        codigo: "S002",
        descripcion: "Tratamiento capilar",
        cantidad: 1,
        unidadMedida: "unidades",
        precioUnitario: 2300,
        porcentajeBonificacion: 0,
        subtotal: 2300,
        alicuotaIVA: "21%",
        subtotalConIVA: 2783,
      }
    ],
    importeNeto: 2300,
    importeIVA: {
      iva21: 483,
      iva105: 0,
      iva27: 0,
      iva5: 0,
      iva25: 0,
      iva0: 0,
    },
    otrosTributos: 0,
    importeTotal: 2783,
    cae: "75028238337041",
    fechaVtoCAE: "2023-10-30",
  },
  {
    id: "3",
    numero: "F-2023-003",
    tipo: "A",
    fecha: "2023-11-05",
    fechaVencimiento: "2023-11-15",
    cliente: "Laura Rodríguez",
    monto: 1800,
    estado: "Pagada",
    emisor: emisorDefault,
    receptor: {
      razonSocial: "RODRIGUEZ LAURA",
      domicilioComercial: "Sarmiento 789 - Rosario, Santa Fe",
      condicionIVA: "IVA Responsable Inscripto",
      condicionVenta: "Contado",
      cuit: "27234567890",
    },
    productos: [
      {
        id: "1",
        codigo: "S003",
        descripcion: "Manicura",
        cantidad: 1,
        unidadMedida: "unidades",
        precioUnitario: 1800,
        porcentajeBonificacion: 0,
        subtotal: 1800,
        alicuotaIVA: "21%",
        subtotalConIVA: 2178,
      }
    ],
    importeNeto: 1800,
    importeIVA: {
      iva21: 378,
      iva105: 0,
      iva27: 0,
      iva5: 0,
      iva25: 0,
      iva0: 0,
    },
    otrosTributos: 0,
    importeTotal: 2178,
    cae: "75028238337042",
    fechaVtoCAE: "2023-11-15",
  },
  {
    id: "4",
    numero: "F-2023-004",
    tipo: "A",
    fecha: "2023-11-15",
    fechaVencimiento: "2023-11-25",
    cliente: "Carlos Fernández",
    monto: 3200,
    estado: "Cancelada",
    emisor: emisorDefault,
    receptor: {
      razonSocial: "FERNANDEZ CARLOS",
      domicilioComercial: "Moreno 321 - Rosario, Santa Fe",
      condicionIVA: "IVA Responsable Inscripto",
      condicionVenta: "Contado",
      cuit: "20123456780",
    },
    productos: [
      {
        id: "1",
        codigo: "S004",
        descripcion: "Corte y peinado",
        cantidad: 1,
        unidadMedida: "unidades",
        precioUnitario: 3200,
        porcentajeBonificacion: 0,
        subtotal: 3200,
        alicuotaIVA: "21%",
        subtotalConIVA: 3872,
      }
    ],
    importeNeto: 3200,
    importeIVA: {
      iva21: 672,
      iva105: 0,
      iva27: 0,
      iva5: 0,
      iva25: 0,
      iva0: 0,
    },
    otrosTributos: 0,
    importeTotal: 3872,
    cae: "75028238337043",
    fechaVtoCAE: "2023-11-25",
  },
  {
    id: "5",
    numero: "F-2023-005",
    tipo: "A",
    fecha: "2023-12-01",
    fechaVencimiento: "2023-12-11",
    cliente: "Ana Martínez",
    monto: 1950,
    estado: "Pendiente",
    emisor: emisorDefault,
    receptor: {
      razonSocial: "MARTINEZ ANA",
      domicilioComercial: "Pellegrini 654 - Rosario, Santa Fe",
      condicionIVA: "IVA Responsable Inscripto",
      condicionVenta: "Contado",
      cuit: "27345678909",
    },
    productos: [
      {
        id: "1",
        codigo: "S005",
        descripcion: "Tratamiento facial",
        cantidad: 1,
        unidadMedida: "unidades",
        precioUnitario: 1950,
        porcentajeBonificacion: 0,
        subtotal: 1950,
        alicuotaIVA: "21%",
        subtotalConIVA: 2359.5,
      }
    ],
    importeNeto: 1950,
    importeIVA: {
      iva21: 409.5,
      iva105: 0,
      iva27: 0,
      iva5: 0,
      iva25: 0,
      iva0: 0,
    },
    otrosTributos: 0,
    importeTotal: 2359.5,
    cae: "75028238337044",
    fechaVtoCAE: "2023-12-11",
  },
];

// Componente principal de la página de facturación
export default function FacturacionPage() {
  const [facturas, setFacturas] = useState<Factura[]>(facturasIniciales);
  const [filtro, setFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<string | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [facturaActual, setFacturaActual] = useState<Factura | null>(null);
  const [productosFactura, setProductosFactura] = useState<ProductoServicio[]>([]);
  const [editandoProducto, setEditandoProducto] = useState<ProductoServicio | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  // Formulario para el producto
  const productoForm = useForm<ProductoServicio>({
    defaultValues: {
      id: "",
      codigo: "",
      descripcion: "",
      cantidad: 1,
      unidadMedida: "unidades",
      precioUnitario: 0,
      porcentajeBonificacion: 0,
      subtotal: 0,
      alicuotaIVA: "21%",
      subtotalConIVA: 0,
    }
  });

  // Formulario para crear/editar facturas
  const form = useForm<Partial<Factura>>({
    defaultValues: {
      numero: "",
      tipo: "A",
      fecha: new Date().toISOString().split('T')[0],
      fechaVencimiento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      cliente: "",
      monto: 0,
      estado: "Pendiente",
      emisor: emisorDefault,
      receptor: {
        razonSocial: "",
        domicilioComercial: "",
        condicionIVA: "IVA Responsable Inscripto",
        condicionVenta: "Contado",
        cuit: "",
      },
      importeNeto: 0,
      importeIVA: {
        iva21: 0,
        iva105: 0,
        iva27: 0,
        iva5: 0,
        iva25: 0,
        iva0: 0,
      },
      otrosTributos: 0,
      importeTotal: 0,
      cae: generarNumeroAleatorio(14),
      fechaVtoCAE: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  });

  // Filtrar facturas según los criterios de búsqueda
  const facturasFiltradas = facturas.filter(factura => {
    const coincideFiltro = 
      factura.numero.toLowerCase().includes(filtro.toLowerCase()) ||
      factura.cliente.toLowerCase().includes(filtro.toLowerCase()) ||
      factura.receptor.razonSocial.toLowerCase().includes(filtro.toLowerCase());
    
    const coincideEstado = 
      !estadoFiltro || estadoFiltro === "all" || factura.estado === estadoFiltro;
    
    return coincideFiltro && coincideEstado;
  });

  // Generar un número aleatorio (simulando un CAE o número de factura)
  function generarNumeroAleatorio(longitud: number) {
    return Array.from({ length: longitud }, () => Math.floor(Math.random() * 10)).join('');
  }

  // Calcular subtotal de un producto
  const calcularSubtotal = (cantidad: number, precioUnitario: number, porcentajeBonificacion: number) => {
    const subtotal = cantidad * precioUnitario * (1 - porcentajeBonificacion / 100);
    return parseFloat(subtotal.toFixed(2));
  };

  // Calcular subtotal con IVA de un producto
  const calcularSubtotalConIVA = (subtotal: number, alicuotaIVA: string) => {
    const porcentajeIVA = parseFloat(alicuotaIVA.replace('%', '')) / 100;
    return parseFloat((subtotal * (1 + porcentajeIVA)).toFixed(2));
  };

  // Iniciar la edición de un producto
  const editarProducto = (producto: ProductoServicio) => {
    setEditandoProducto(producto);
    productoForm.reset(producto);
    setIsProductDialogOpen(true);
  };

  // Eliminar un producto
  const eliminarProducto = (id: string) => {
    setProductosFactura(productosFactura.filter(p => p.id !== id));
    actualizarTotales(productosFactura.filter(p => p.id !== id));
  };

  // Calcular los totales de la factura
  const actualizarTotales = (productos: ProductoServicio[]) => {
    const importeNeto = productos.reduce((sum, p) => sum + p.subtotal, 0);
    
    const iva21 = productos
      .filter(p => p.alicuotaIVA === "21%")
      .reduce((sum, p) => sum + (p.subtotal * 0.21), 0);
    
    const iva105 = productos
      .filter(p => p.alicuotaIVA === "10.5%")
      .reduce((sum, p) => sum + (p.subtotal * 0.105), 0);
    
    const iva27 = productos
      .filter(p => p.alicuotaIVA === "27%")
      .reduce((sum, p) => sum + (p.subtotal * 0.27), 0);
    
    const iva5 = productos
      .filter(p => p.alicuotaIVA === "5%")
      .reduce((sum, p) => sum + (p.subtotal * 0.05), 0);
    
    const iva25 = productos
      .filter(p => p.alicuotaIVA === "2.5%")
      .reduce((sum, p) => sum + (p.subtotal * 0.025), 0);
    
    const importeTotal = importeNeto + iva21 + iva105 + iva27 + iva5 + iva25;
    
    form.setValue("importeNeto", parseFloat(importeNeto.toFixed(2)));
    form.setValue("importeIVA", {
      iva21: parseFloat(iva21.toFixed(2)),
      iva105: parseFloat(iva105.toFixed(2)),
      iva27: parseFloat(iva27.toFixed(2)),
      iva5: parseFloat(iva5.toFixed(2)),
      iva25: parseFloat(iva25.toFixed(2)),
      iva0: 0,
    });
    form.setValue("importeTotal", parseFloat(importeTotal.toFixed(2)));
    form.setValue("monto", parseFloat(importeNeto.toFixed(2)));
  };

  // Manejar la creación o edición de un producto
  const handleProductSubmit = (data: ProductoServicio) => {
    // Calcular el subtotal
    const subtotal = calcularSubtotal(data.cantidad, data.precioUnitario, data.porcentajeBonificacion);
    const subtotalConIVA = calcularSubtotalConIVA(subtotal, data.alicuotaIVA);
    
    const productoCompleto = {
      ...data,
      subtotal,
      subtotalConIVA,
    };
    
    let nuevosProductos;
    if (editandoProducto) {
      // Editar producto existente
      nuevosProductos = productosFactura.map(p => 
        p.id === editandoProducto.id ? productoCompleto : p
      );
    } else {
      // Crear nuevo producto
      nuevosProductos = [...productosFactura, {
        ...productoCompleto,
        id: generarNumeroAleatorio(5),
      }];
    }
    
    setProductosFactura(nuevosProductos);
    actualizarTotales(nuevosProductos);
    setIsProductDialogOpen(false);
    setEditandoProducto(null);
    productoForm.reset();
  };

  // Manejar la creación o edición de una factura
  const handleSubmit = (data: Partial<Factura>) => {
    if (!productosFactura.length) {
      toast.error("Debe agregar al menos un producto o servicio a la factura");
      return;
    }
    
    const facturaCompleta = {
      ...data,
      productos: productosFactura,
    } as Factura;
    
    if (facturaActual) {
      // Editar factura existente
      setFacturas(facturas.map(f => 
        f.id === facturaActual.id ? { ...facturaCompleta, id: facturaActual.id } : f
      ));
      toast.success("Factura actualizada correctamente");
    } else {
      // Crear nueva factura
      const nuevaFactura: Factura = {
        ...facturaCompleta,
        id: (facturas.length + 1).toString(),
      };
      setFacturas([...facturas, nuevaFactura]);
      toast.success("Factura creada correctamente");
    }
    
    setIsDialogOpen(false);
    setFacturaActual(null);
    setProductosFactura([]);
    form.reset();
  };

  // Abrir el formulario para editar una factura
  const editarFactura = (factura: Factura) => {
    setFacturaActual(factura);
    setProductosFactura(factura.productos);
    form.reset({
      numero: factura.numero,
      tipo: factura.tipo,
      fecha: factura.fecha,
      fechaVencimiento: factura.fechaVencimiento,
      cliente: factura.cliente,
      monto: factura.monto,
      estado: factura.estado,
      emisor: factura.emisor,
      receptor: factura.receptor,
      importeNeto: factura.importeNeto,
      importeIVA: factura.importeIVA,
      otrosTributos: factura.otrosTributos,
      importeTotal: factura.importeTotal,
      cae: factura.cae,
      fechaVtoCAE: factura.fechaVtoCAE,
    });
    setIsDialogOpen(true);
  };

  // Abrir vista previa de factura
  const verFactura = (factura: Factura) => {
    setFacturaActual(factura);
    setIsPreviewOpen(true);
  };

  // Eliminar una factura
  const eliminarFactura = (id: string) => {
    setFacturas(facturas.filter(f => f.id !== id));
    toast.success("Factura eliminada correctamente");
  };

  // Nueva factura (resetear formulario y abrir diálogo)
  const nuevaFactura = () => {
    setFacturaActual(null);
    setProductosFactura([]);
    form.reset({
      numero: `F-${new Date().getFullYear()}-${(facturas.length + 1).toString().padStart(3, '0')}`,
      tipo: "A",
      fecha: new Date().toISOString().split('T')[0],
      fechaVencimiento: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      cliente: "",
      monto: 0,
      estado: "Pendiente",
      emisor: emisorDefault,
      receptor: {
        razonSocial: "",
        domicilioComercial: "",
        condicionIVA: "IVA Responsable Inscripto",
        condicionVenta: "Contado",
        cuit: "",
      },
      importeNeto: 0,
      importeIVA: {
        iva21: 0,
        iva105: 0,
        iva27: 0,
        iva5: 0,
        iva25: 0,
        iva0: 0,
      },
      otrosTributos: 0,
      importeTotal: 0,
      cae: generarNumeroAleatorio(14),
      fechaVtoCAE: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setIsDialogOpen(true);
  };

  // Añadir nuevo producto (resetear formulario y abrir diálogo)
  const nuevoProducto = () => {
    setEditandoProducto(null);
    productoForm.reset({
      id: "",
      codigo: "P-" + generarNumeroAleatorio(3),
      descripcion: "",
      cantidad: 1,
      unidadMedida: "unidades",
      precioUnitario: 0,
      porcentajeBonificacion: 0,
      subtotal: 0,
      alicuotaIVA: "21%",
      subtotalConIVA: 0,
    });
    setIsProductDialogOpen(true);
  };

  // Gestionar status de conexión AFIP
  const generarFacturaAFIP = (factura: Factura) => {
    // Esta función simularía la conexión con AFIP/ARCA
    // En un caso real, aquí se haría una llamada a una API
    toast.success("Factura enviada a AFIP correctamente");
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
            <SelectItem value="all">Todos</SelectItem>
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
              <TableHead>Tipo</TableHead>
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
                  <TableCell>
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                      {factura.tipo}
                    </span>
                  </TableCell>
                  <TableCell>{factura.fecha}</TableCell>
                  <TableCell>{factura.receptor.razonSocial}</TableCell>
                  <TableCell className="text-right">${factura.importeTotal.toFixed(2)}</TableCell>
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
                        onClick={() => verFactura(factura)}
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
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
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => generarFacturaAFIP(factura)}
                      >
                        <FileCheck className="h-4 w-4 text-green-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No se encontraron facturas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo para crear/editar facturas */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {facturaActual ? "Editar Factura" : "Nueva Factura"}
            </DialogTitle>
            <DialogDescription>
              Complete los detalles de la factura
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Detalles de la factura */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información general</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número de Factura</Label>
                  <Input
                    id="numero"
                    {...form.register("numero")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={form.watch("tipo")}
                    onValueChange={(value: "A" | "B" | "C" | "E") => 
                      form.setValue("tipo", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="E">E</SelectItem>
                    </SelectContent>
                  </Select>
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
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha de emisión</Label>
                  <Input
                    id="fecha"
                    type="date"
                    {...form.register("fecha")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaVencimiento">Fecha de vencimiento</Label>
                  <Input
                    id="fechaVencimiento"
                    type="date"
                    {...form.register("fechaVencimiento")}
                  />
                </div>
              </div>
            </div>
            
            {/* Datos del cliente/receptor */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Datos del cliente</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="receptor.razonSocial">Razón Social / Nombre</Label>
                  <Input
                    id="receptor.razonSocial"
                    {...form.register("receptor.razonSocial")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receptor.cuit">CUIT</Label>
                  <Input
                    id="receptor.cuit"
                    {...form.register("receptor.cuit")}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receptor.domicilioComercial">Domicilio</Label>
                <Input
                  id="receptor.domicilioComercial"
                  {...form.register("receptor.domicilioComercial")}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="receptor.condicionIVA">Condición frente al IVA</Label>
                  <Select
                    value={form.watch("receptor.condicionIVA")}
                    onValueChange={(value) => 
                      form.setValue("receptor.condicionIVA", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar condición" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IVA Responsable Inscripto">IVA Responsable Inscripto</SelectItem>
                      <SelectItem value="IVA Sujeto Exento">IVA Sujeto Exento</SelectItem>
                      <SelectItem value="Consumidor Final">Consumidor Final</SelectItem>
                      <SelectItem value="Monotributista">Monotributista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receptor.condicionVenta">Condición de venta</Label>
                  <Select
                    value={form.watch("receptor.condicionVenta")}
                    onValueChange={(value: "Contado" | "Cuenta Corriente" | "Cheque" | "Tarjeta de Crédito") => 
                      form.setValue("receptor.condicionVenta", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar condición" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contado">Contado</SelectItem>
                      <SelectItem value="Cuenta Corriente">Cuenta Corriente</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Productos y servicios */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Productos y servicios</h3>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={nuevoProducto}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Cant.</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>% Bonif.</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead>IVA</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productosFactura.length > 0 ? (
                      productosFactura.map((producto) => (
                        <TableRow key={producto.id}>
                          <TableCell>{producto.codigo}</TableCell>
                          <TableCell>{producto.descripcion}</TableCell>
                          <TableCell>{producto.cantidad} {producto.unidadMedida}</TableCell>
                          <TableCell>${producto.precioUnitario.toFixed(2)}</TableCell>
                          <TableCell>{producto.porcentajeBonificacion}%</TableCell>
                          <TableCell>${producto.subtotal.toFixed(2)}</TableCell>
                          <TableCell>{producto.alicuotaIVA}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => editarProducto(producto)}
                              >
                                <Edit className="h-4 w-4 text-slate-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => eliminarProducto(producto.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No hay productos o servicios
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Totales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Totales</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Importe Neto</Label>
                  <div className="border rounded-md px-3 py-2 bg-gray-50">
                    ${form.watch("importeNeto")?.toFixed(2) || "0.00"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>IVA 21%</Label>
                  <div className="border rounded-md px-3 py-2 bg-gray-50">
                    ${form.watch("importeIVA.iva21")?.toFixed(2) || "0.00"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>IVA 10.5%</Label>
                  <div className="border rounded-md px-3 py-2 bg-gray-50">
                    ${form.watch("importeIVA.iva105")?.toFixed(2) || "0.00"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Otros tributos</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...form.register("otrosTributos", { valueAsNumber: true })}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      form.setValue("otrosTributos", value);
                      // Recalcular total final
                      const ivaTotal = (form.watch("importeIVA.iva21") || 0) + 
                                       (form.watch("importeIVA.iva105") || 0) + 
                                       (form.watch("importeIVA.iva27") || 0) + 
                                       (form.watch("importeIVA.iva5") || 0) + 
                                       (form.watch("importeIVA.iva25") || 0);
                      const total = (form.watch("importeNeto") || 0) + ivaTotal + value;
                      form.setValue("importeTotal", parseFloat(total.toFixed(2)));
                    }}
                  />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
                  <Label>Importe Total</Label>
                  <div className="border rounded-md px-3 py-2 bg-gray-100 font-bold text-lg">
                    ${form.watch("importeTotal")?.toFixed(2) || "0.00"}
                  </div>
                </div>
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

      {/* Diálogo para productos */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editandoProducto ? "Editar Producto/Servicio" : "Nuevo Producto/Servicio"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={productoForm.handleSubmit(handleProductSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  {...productoForm.register("codigo")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unidadMedida">Unidad de medida</Label>
                <Select
                  value={productoForm.watch("unidadMedida")}
                  onValueChange={(value) => 
                    productoForm.setValue("unidadMedida", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidades">Unidades</SelectItem>
                    <SelectItem value="horas">Horas</SelectItem>
                    <SelectItem value="kg">Kilogramos</SelectItem>
                    <SelectItem value="metros">Metros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                {...productoForm.register("descripcion")}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  step="1"
                  {...productoForm.register("cantidad", { valueAsNumber: true })}
                  onChange={(e) => {
                    const cantidad = parseFloat(e.target.value) || 0;
                    productoForm.setValue("cantidad", cantidad);
                    // Recalcular subtotal
                    const precio = productoForm.watch("precioUnitario") || 0;
                    const bonif = productoForm.watch("porcentajeBonificacion") || 0;
                    const subtotal = calcularSubtotal(cantidad, precio, bonif);
                    productoForm.setValue("subtotal", subtotal);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precioUnitario">Precio unitario</Label>
                <Input
                  id="precioUnitario"
                  type="number"
                  step="0.01"
                  {...productoForm.register("precioUnitario", { valueAsNumber: true })}
                  onChange={(e) => {
                    const precio = parseFloat(e.target.value) || 0;
                    productoForm.setValue("precioUnitario", precio);
                    // Recalcular subtotal
                    const cantidad = productoForm.watch("cantidad") || 0;
                    const bonif = productoForm.watch("porcentajeBonificacion") || 0;
                    const subtotal = calcularSubtotal(cantidad, precio, bonif);
                    productoForm.setValue("subtotal", subtotal);
                  }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="porcentajeBonificacion">Porcentaje de bonificación</Label>
                <Input
                  id="porcentajeBonificacion"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  {...productoForm.register("porcentajeBonificacion", { valueAsNumber: true })}
                  onChange={(e) => {
                    const bonif = parseFloat(e.target.value) || 0;
                    productoForm.setValue("porcentajeBonificacion", bonif);
                    // Recalcular subtotal
                    const cantidad = productoForm.watch("cantidad") || 0;
                    const precio = productoForm.watch("precioUnitario") || 0;
                    const subtotal = calcularSubtotal(cantidad, precio, bonif);
                    productoForm.setValue("subtotal", subtotal);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alicuotaIVA">Alícuota IVA</Label>
                <Select
                  value={productoForm.watch("alicuotaIVA")}
                  onValueChange={(value: "21%" | "10.5%" | "27%" | "5%" | "2.5%" | "0%") => 
                    productoForm.setValue("alicuotaIVA", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar alícuota" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="21%">21%</SelectItem>
                    <SelectItem value="10.5%">10.5%</SelectItem>
                    <SelectItem value="27%">27%</SelectItem>
                    <SelectItem value="5%">5%</SelectItem>
                    <SelectItem value="2.5%">2.5%</SelectItem>
                    <SelectItem value="0%">0%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subtotal</Label>
                <div className="border rounded-md px-3 py-2 bg-gray-50">
                  ${(productoForm.watch("subtotal") || 0).toFixed(2)}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subtotal con IVA</Label>
                <div className="border rounded-md px-3 py-2 bg-gray-50">
                  ${calcularSubtotalConIVA(
                      productoForm.watch("subtotal") || 0, 
                      productoForm.watch("alicuotaIVA") || "21%"
                    ).toFixed(2)}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit" className="bg-salon-400 hover:bg-salon-500">
                {editandoProducto ? "Actualizar" : "Agregar"} Producto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para vista previa de factura */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Vista previa de Factura
            </DialogTitle>
          </DialogHeader>
          
          {facturaActual && (
            <div className="space-y-6 p-4 border rounded-md">
              {/* Encabezado de factura */}
              <div className="grid grid-cols-12 gap-4 border-b pb-4">
                <div className="col-span-6">
                  <h2 className="text-xl font-bold">{facturaActual.emisor.razonSocial}</h2>
                  <p>Razón Social: {facturaActual.emisor.razonSocial}</p>
                  <p>Domicilio Comercial: {facturaActual.emisor.domicilioComercial}</p>
                  <p>Condición frente al IVA: {facturaActual.emisor.condicionIVA}</p>
                </div>
                <div className="col-span-6 flex flex-col items-end">
                  <div className="text-center mb-2">
                    <span className="text-4xl font-bold border-2 border-black px-4 py-2 rounded-md">
                      {facturaActual.tipo}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold">FACTURA</h2>
                  <p>Punto de Venta: {facturaActual.emisor.puntoVenta}</p>
                  <p>Comp. Nro: {facturaActual.numero}</p>
                  <p>Fecha de Emisión: {facturaActual.fecha}</p>
                  <p>CUIT: {facturaActual.emisor.cuit}</p>
                  <p>Ingresos Brutos: {facturaActual.emisor.ingresosBrutos}</p>
                  <p>Fecha de Inicio de Actividades: {facturaActual.emisor.fechaInicioActividades}</p>
                </div>
              </div>
              
              {/* Período facturado y datos del receptor */}
              <div className="grid grid-cols-12 gap-4 border-b pb-4">
                <div className="col-span-12">
                  <div className="flex justify-between mb-4">
                    <div>
                      <p><strong>Período Facturado Desde:</strong> {facturaActual.fecha}</p>
                    </div>
                    <div>
                      <p><strong>Hasta:</strong> {facturaActual.fecha}</p>
                    </div>
                    <div>
                      <p><strong>Fecha de Vto. para el pago:</strong> {facturaActual.fechaVencimiento}</p>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <p><strong>CUIT:</strong> {facturaActual.receptor.cuit}</p>
                    <p><strong>Apellido y Nombre / Razón Social:</strong> {facturaActual.receptor.razonSocial}</p>
                  </div>
                  
                  <div className="flex justify-between">
                    <div>
                      <p><strong>Condición frente al IVA:</strong> {facturaActual.receptor.condicionIVA}</p>
                    </div>
                    <div>
                      <p><strong>Domicilio Comercial:</strong> {facturaActual.receptor.domicilioComercial}</p>
                    </div>
                    <div>
                      <p><strong>Condición de venta:</strong> {facturaActual.receptor.condicionVenta}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Detalle de productos */}
              <div className="border-b pb-4">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Producto / Servicio</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>U. medida</TableHead>
                      <TableHead>Precio Unit.</TableHead>
                      <TableHead>% Bonif</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead>Alícuota IVA</TableHead>
                      <TableHead>Subtotal c/IVA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facturaActual.productos.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell>{producto.codigo}</TableCell>
                        <TableCell>{producto.descripcion}</TableCell>
                        <TableCell>{producto.cantidad}</TableCell>
                        <TableCell>{producto.unidadMedida}</TableCell>
                        <TableCell>${producto.precioUnitario.toFixed(2)}</TableCell>
                        <TableCell>{producto.porcentajeBonificacion}%</TableCell>
                        <TableCell>${producto.subtotal.toFixed(2)}</TableCell>
                        <TableCell>{producto.alicuotaIVA}</TableCell>
                        <TableCell>${producto.subtotalConIVA.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Totales e impuestos */}
              <div className="flex justify-end">
                <div className="w-1/2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-right"><strong>Importe Otros Tributos: $</strong></div>
                    <div className="text-right">{facturaActual.otrosTributos.toFixed(2)}</div>
                    
                    <div className="text-right"><strong>Importe Neto Gravado: $</strong></div>
                    <div className="text-right">{facturaActual.importeNeto.toFixed(2)}</div>
                    
                    <div className="text-right"><strong>IVA 27%: $</strong></div>
                    <div className="text-right">{facturaActual.importeIVA.iva27.toFixed(2)}</div>
                    
                    <div className="text-right"><strong>IVA 21%: $</strong></div>
                    <div className="text-right">{facturaActual.importeIVA.iva21.toFixed(2)}</div>
                    
                    <div className="text-right"><strong>IVA 10.5%: $</strong></div>
                    <div className="text-right">{facturaActual.importeIVA.iva105.toFixed(2)}</div>
                    
                    <div className="text-right"><strong>IVA 5%: $</strong></div>
                    <div className="text-right">{facturaActual.importeIVA.iva5.toFixed(2)}</div>
                    
                    <div className="text-right"><strong>IVA 2.5%: $</strong></div>
                    <div className="text-right">{facturaActual.importeIVA.iva25.toFixed(2)}</div>
                    
                    <div className="text-right"><strong>Importe Otros Tributos: $</strong></div>
                    <div className="text-right">{facturaActual.otrosTributos.toFixed(2)}</div>
                    
                    <div className="text-right border-t-2 border-black"><strong>Importe Total: $</strong></div>
                    <div className="text-right border-t-2 border-black font-bold">{facturaActual.importeTotal.toFixed(2)}</div>
                  </div>
                </div>
              </div>
              
              {/* Datos AFIP y Pie de factura */}
              <div className="mt-6 pt-4 border-t flex justify-between">
                <div className="flex items-center">
                  <div className="w-28 h-28 bg-gray-200 flex items-center justify-center text-center">
                    <p>Código QR AFIP</p>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold">ARCA</h3>
                    <p>Comprobante Autorizado</p>
                  </div>
                </div>
                <div className="text-right">
                  <p>Pág. 1/1</p>
                  <p><strong>CAE N°:</strong> {facturaActual.cae}</p>
                  <p><strong>Fecha de Vto. de CAE:</strong> {facturaActual.fechaVtoCAE}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <div className="flex gap-2">
              <Button variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
              <Button 
                onClick={() => setIsPreviewOpen(false)}
              >
                Cerrar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
