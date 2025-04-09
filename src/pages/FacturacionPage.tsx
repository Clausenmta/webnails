import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, FileText, Trash2, Edit, Eye, FileCheck, Download, Printer, FileDown } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

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
  const [conectandoAFIP, setConectandoAFIP] = useState(false);

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
      toast({
        title: "Error",
        description: "Debe agregar al menos un producto o servicio a la factura",
        variant: "destructive",
      });
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
      toast({
        title: "Éxito",
        description: "Factura actualizada correctamente",
      });
    } else {
      // Crear nueva factura
      const nuevaFactura: Factura = {
        ...facturaCompleta,
        id: (facturas.length + 1).toString(),
      };
      setFacturas([...facturas, nuevaFactura]);
      toast({
        title: "Éxito",
        description: "Factura creada correctamente",
      });
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
    toast({
      title: "Éxito",
      description: "Factura eliminada correctamente",
    });
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
    // En un caso real, aquí se conectaría a AFIP/ARCA con certificados digitales
    setConectandoAFIP(true);
    
    // Simular tiempo de conexión
    setTimeout(() => {
      // Simular generación de CAE real
      const nuevoCAE = generarNumeroAleatorio(14);
      
      // Actualizar la factura con el nuevo CAE
      setFacturas(facturas.map(f => 
        f.id === factura.id ? { ...f, cae: nuevoCAE } : f
      ));
      
      setConectandoAFIP(false);
      toast({
        title: "Factura enviada a AFIP",
        description: `Factura ${factura.numero} enviada y CAE generado con éxito.`,
        variant: "default",
      });
    }, 2000);
  };

  // Función para generar y descargar factura como PDF
  const descargarFactura = (factura: Factura) => {
    const doc = new jsPDF();
    
    // Configurar información básica
    doc.setFontSize(22);
    doc.text("FACTURA", 105, 20, { align: 'center' });
    
    // Tipo de factura
    doc.setFillColor(220, 220, 220);
    doc.rect(160, 15, 30, 30, 'F');
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(factura.tipo, 175, 35, { align: 'center' });
    
    // Información del emisor
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Razón Social: ${factura.emisor.razonSocial}`, 20, 50);
    doc.text(`Domicilio: ${factura.emisor.domicilioComercial}`, 20, 60);
    doc.text(`CUIT: ${factura.emisor.cuit}`, 20, 70);
    doc.text(`Cond. IVA: ${factura.emisor.condicionIVA}`, 20, 80);
    
    // Información de la factura
    doc.text(`Factura Nro: ${factura.numero}`, 120, 50);
    doc.text(`Fecha: ${factura.fecha}`, 120, 60);
    doc.text(`Vencimiento: ${factura.fechaVencimiento}`, 120, 70);
    doc.text(`CAE: ${factura.cae}`, 120, 80);
    doc.text(`Vto. CAE: ${factura.fechaVtoCAE}`, 120, 90);
    
    // Línea separadora
    doc.line(20, 100, 190, 100);
    
    // Información del receptor
    doc.text(`Cliente: ${factura.receptor.razonSocial}`, 20, 110);
    doc.text(`CUIT: ${factura.receptor.cuit}`, 20, 120);
    doc.text(`Domicilio: ${factura.receptor.domicilioComercial}`, 20, 130);
    doc.text(`Cond. IVA: ${factura.receptor.condicionIVA}`, 20, 140);
    doc.text(`Cond. Venta: ${factura.receptor.condicionVenta}`, 120, 140);
    
    // Línea separadora
    doc.line(20, 150, 190, 150);
    
    // Tabla de productos usando jspdf-autotable
    const tableColumn = ["Código", "Descripción", "Cant.", "P.Unit", "% Bonif", "Subtotal", "IVA", "Total"];
    const tableRows = factura.productos.map(producto => [
      producto.codigo,
      producto.descripcion,
      producto.cantidad.toString(),
      `$${producto.precioUnitario.toFixed(2)}`,
      `${producto.porcentajeBonificacion}%`,
      `$${producto.subtotal.toFixed(2)}`,
      producto.alicuotaIVA,
      `$${producto.subtotalConIVA.toFixed(2)}`
    ]);
    
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 155,
      theme: 'striped',
      headStyles: { fillColor: [120, 144, 156] },
      margin: { left: 20, right: 20 },
    });
    
    // Calcular posición Y después de la tabla
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Totales de la factura
    doc.line(120, finalY, 190, finalY);
    doc.text("Importe Neto:", 120, finalY + 10);
    doc.text(`$${factura.importeNeto.toFixed(2)}`, 190, finalY + 10, { align: 'right' });
    
    doc.text("IVA 21%:", 120, finalY + 20);
    doc.text(`$${factura.importeIVA.iva21.toFixed(2)}`, 190, finalY + 20, { align: 'right' });
    
    doc.text("IVA 10.5%:", 120, finalY + 30);
    doc.text(`$${factura.importeIVA.iva105.toFixed(2)}`, 190, finalY + 30, { align: 'right' });
    
    doc.text("Otros Tributos:", 120, finalY + 40);
    doc.text(`$${factura.otrosTributos.toFixed(2)}`, 190, finalY + 40, { align: 'right' });
    
    doc.line(120, finalY + 45, 190, finalY + 45);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL:", 120, finalY + 55);
    doc.text(`$${factura.importeTotal.toFixed(2)}`, 190, finalY + 55, { align: 'right' });
    
    // Información de pie de página
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Documento generado electrónicamente", 105, 280, { align: 'center' });
    
    // Guardar el PDF
    doc.save(`Factura_${factura.numero}.pdf`);
    
    toast({
      title: "Factura descargada",
      description: `La factura ${factura.numero} ha sido descargada como PDF.`,
    });
  };

  // Función para imprimir factura
  const imprimirFactura = () => {
    if (facturaActual) {
      // Preparar impresión del iframe visible
      const printContent = document.getElementById('factura-para-imprimir');
      
      if (printContent) {
        // Configurar la impresión
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        
        // Imprimir
        window.print();
        
        // Restaurar el contenido original
        document.body.innerHTML = originalContents;
        
        toast({
          title: "Impresión iniciada",
          description: `La factura ${facturaActual.numero} se ha enviado a la impresora.`,
        });
      } else {
        toast({
          title: "Error de impresión",
          description: "No se pudo encontrar el contenido para imprimir.",
          variant: "destructive",
        });
      }
    }
  };

  // Función para exportar a Excel
  const exportarExcel = () => {
    // Crear workbook
    const wb = XLSX.utils.book_new();
    
    // Preparar datos para Excel
    const datos = facturas.map(factura => ({
      Numero: factura.numero,
      Tipo: factura.tipo,
      Fecha: factura.fecha,
      Cliente: factura.receptor.razonSocial,
      CUIT: factura.receptor.cuit,
      Estado: factura.estado,
      ImporteNeto: factura.importeNeto,
      IVA: factura.importeIVA.iva21 + factura.importeIVA.iva105 + factura.importeIVA.iva27,
      ImporteTotal: factura.importeTotal,
      CAE: factura.cae,
    }));
    
    // Crear worksheet con los datos
    const ws = XLSX.utils.json_to_sheet(datos);
    
    // Añadir worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, "Facturas");
    
    // Guardar el archivo
    XLSX.writeFile(wb, "Facturas.xlsx");
    
    toast({
      title: "Exportación completada",
      description: "Las facturas han sido exportadas a Excel correctamente.",
    });
  };

  // Función para exportar múltiples facturas como PDFs en un archivo ZIP
  const exportarZIP = async () => {
    // Crear una nueva instancia de JSZip
    const zip = new JSZip();
    
    // Notificar inicio del proceso
    toast({
      title: "Preparando archivos",
      description: "Generando PDFs para comprimir...",
    });
    
    // Generar un PDF para cada factura y añadirlo al ZIP
    for (const factura of facturas) {
      const doc = new jsPDF();
      
      // Configurar información básica (versión simplificada)
      doc.setFontSize(22);
      doc.text(`FACTURA ${factura.tipo}`, 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`${factura.numero} - ${factura.receptor.razonSocial}`, 105, 30, { align: 'center' });
      doc.text(`Importe total: $${factura.importeTotal.toFixed(2)}`, 105, 40, { align: 'center' });
      
      // Obtener el PDF como blob
      const pdfBlob = doc.output('blob');
      
      // Añadir el PDF al ZIP
      zip.file(`Factura_${factura.numero}.pdf`, pdfBlob);
    }
    
    // Generar el archivo ZIP y descargarlo
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "Facturas.zip");
    
    toast({
      title: "Exportación completada",
      description: `Se han exportado ${facturas.length} facturas en un archivo ZIP.`,
    });
  };

  // Renderizado del componente
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Facturación</h1>
        <div className="flex space-x-2">
          <Button onClick={exportarExcel}>
            <FileDown className="mr-2" />
            Exportar Excel
          </Button>
          <Button onClick={exportarZIP} variant="outline">
            <Download className="mr-2" />
            Exportar ZIP
          </Button>
          <Button onClick={nuevaFactura} variant="default">
            <Plus className="mr-2" />
            Nueva Factura
          </Button>
        </div>
      </div>
      
      {/* Alerta informativa sobre AFIP */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <FileCheck className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Modo simulación:</strong> La conexión con AFIP está en modo de simulación. Los CAE generados no son válidos para uso fiscal.
            </p>
          </div>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por número, cliente o razón social..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          value={estadoFiltro}
          onValueChange={(value) => setEstadoFiltro(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="Pendiente">Pendiente</SelectItem>
            <SelectItem value="Pagada">Pagada</SelectItem>
            <SelectItem value="Cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Tabla de facturas */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>CAE</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facturasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  No se encontraron facturas con los criterios de búsqueda
                </TableCell>
              </TableRow>
            ) : (
              facturasFiltradas.map((factura) => (
                <TableRow key={factura.id}>
                  <TableCell>{factura.numero}</TableCell>
                  <TableCell>
                    <span className="font-bold">Factura {factura.tipo}</span>
                  </TableCell>
                  <TableCell>{factura.fecha}</TableCell>
                  <TableCell>{factura.cliente}</TableCell>
                  <TableCell>${factura.monto.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${factura.estado === 'Pagada' ? 'bg-green-100 text-green-800' : 
                          factura.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'}`}
                    >
                      {factura.estado}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono">{factura.cae}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Ver factura"
                        onClick={() => verFactura(factura)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar factura"
                        onClick={() => editarFactura(factura)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Descargar PDF"
                        onClick={() => descargarFactura(factura)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Eliminar factura"
                        onClick={() => eliminarFactura(factura.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Diálogo para crear/editar factura */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{facturaActual ? "Editar Factura" : "Nueva Factura"}</DialogTitle>
            <DialogDescription>
              Complete los datos para {facturaActual ? "modificar la" : "crear una nueva"} factura.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* Información básica de la factura */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Datos de la factura</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormItem className="flex flex-col">
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input 
                        {...form.register("numero")} 
                        readOnly={!!facturaActual} 
                      />
                    </FormControl>
                  </FormItem>
                  
                  <FormItem className="flex flex-col">
                    <FormLabel>Tipo</FormLabel>
                    <Select 
                      value={form.watch("tipo")} 
                      onValueChange={(value) => form.setValue("tipo", value as "A" | "B" | "C" | "E")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Factura A</SelectItem>
                        <SelectItem value="B">Factura B</SelectItem>
                        <SelectItem value="C">Factura C</SelectItem>
                        <SelectItem value="E">Factura E</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...form.register("fecha")} 
                      />
                    </FormControl>
                  </FormItem>
                  
                  <FormItem className="flex flex-col">
                    <FormLabel>Vencimiento</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...form.register("fechaVencimiento")} 
                      />
                    </FormControl>
                  </FormItem>
                </div>
                
                <FormItem className="flex flex-col">
                  <FormLabel>Estado</FormLabel>
                  <Select 
                    value={form.watch("estado")} 
                    onValueChange={(value) => form.setValue("estado", value as "Pagada" | "Pendiente" | "Cancelada")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Pagada">Pagada</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
                
                <FormItem className="flex flex-col">
                  <FormLabel>Cliente</FormLabel>
                  <FormControl>
                    <Input {...form.register("cliente")} />
                  </FormControl>
                </FormItem>
              </div>
              
              {/* Datos del receptor */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Datos del receptor</h3>
                
                <FormItem className="flex flex-col">
                  <FormLabel>Razón Social</FormLabel>
                  <FormControl>
                    <Input 
                      value={form.watch("receptor.razonSocial") || ""}
                      onChange={(e) => form.setValue("receptor.razonSocial", e.target.value)} 
                    />
                  </FormControl>
                </FormItem>
                
                <FormItem className="flex flex-col">
                  <FormLabel>CUIT</FormLabel>
                  <FormControl>
                    <Input 
                      value={form.watch("receptor.cuit") || ""}
                      onChange={(e) => form.setValue("receptor.cuit", e.target.value)} 
                    />
                  </FormControl>
                </FormItem>
                
                <FormItem className="flex flex-col">
                  <FormLabel>Domicilio Comercial</FormLabel>
                  <FormControl>
                    <Input 
                      value={form.watch("receptor.domicilioComercial") || ""}
                      onChange={(e) => form.setValue("receptor.domicilioComercial", e.target.value)} 
                    />
                  </FormControl>
                </FormItem>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormItem className="flex flex-col">
                    <FormLabel>Condición IVA</FormLabel>
                    <Select 
                      value={form.watch("receptor.condicionIVA") || ""}
                      onValueChange={(value) => form.setValue("receptor.condicionIVA", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Condición IVA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IVA Responsable Inscripto">Resp. Inscripto</SelectItem>
                        <SelectItem value="IVA Sujeto Exento">Sujeto Exento</SelectItem>
                        <SelectItem value="Consumidor Final">Consumidor Final</SelectItem>
                        <SelectItem value="Responsable Monotributo">Monotributo</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                  
                  <FormItem className="flex flex-col">
                    <FormLabel>Condición Venta</FormLabel>
                    <Select 
                      value={form.watch("receptor.condicionVenta") || "Contado"}
                      onValueChange={(value) => form.setValue("receptor.condicionVenta", value as "Contado" | "Cuenta Corriente" | "Cheque" | "Tarjeta de Crédito")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Condición Venta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contado">Contado</SelectItem>
                        <SelectItem value="Cuenta Corriente">Cuenta Corriente</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                        <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                </div>
              </div>
            </div>
            
            {/* Productos y servicios */}
            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-lg">Productos y servicios</h3>
                <Button type="button" variant="outline" size="sm" onClick={nuevoProducto}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar producto
                </Button>
              </div>
              
              {productosFactura.length === 0 ? (
                <div className="text-center py-4 border rounded-md bg-muted/20">
                  <p className="text-sm text-muted-foreground">No se han agregado productos o servicios</p>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Cant.</TableHead>
                        <TableHead>Precio Unit.</TableHead>
                        <TableHead>Bonif.</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>IVA</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productosFactura.map((producto) => (
                        <TableRow key={producto.id}>
                          <TableCell>{producto.codigo}</TableCell>
                          <TableCell>{producto.descripcion}</TableCell>
                          <TableCell>{producto.cantidad}</TableCell>
                          <TableCell>${producto.precioUnitario.toFixed(2)}</TableCell>
                          <TableCell>{producto.porcentajeBonificacion}%</TableCell>
                          <TableCell>${producto.subtotal.toFixed(2)}</TableCell>
                          <TableCell>{producto.alicuotaIVA}</TableCell>
                          <TableCell>${producto.subtotalConIVA.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title="Editar producto"
                                onClick={() => editarProducto(producto)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                title="Eliminar producto"
                                onClick={() => eliminarProducto(producto.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            
            {/* Totales */}
            <div className="mt-6 space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span>Importe Neto:</span>
                <span className="font-medium">${form.watch("importeNeto")?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA 21%:</span>
                <span>${form.watch("importeIVA.iva21")?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA 10.5%:</span>
                <span>${form.watch("importeIVA.iva105")?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">TOTAL:</span>
                <span className="font-bold">${form.watch("importeTotal")?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {facturaActual ? "Actualizar Factura" : "Crear Factura"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para agregar/editar producto */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editandoProducto ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
            <DialogDescription>
              Complete los datos del producto o servicio.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={productoForm.handleSubmit(handleProductSubmit)}>
            <div className="space-y-4 py-4">
              <FormItem className="flex flex-col">
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input {...productoForm.register("codigo")} />
                </FormControl>
              </FormItem>
              
              <FormItem className="flex flex-col">
                <FormLabel>Descripción</FormLabel>
                <FormControl>
                  <Textarea {...productoForm.register("descripcion")} />
                </FormControl>
              </FormItem>
              
              <div className="grid grid-cols-2 gap-4">
                <FormItem className="flex flex-col">
                  <FormLabel>Cantidad</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...productoForm.register("cantidad", { valueAsNumber: true })} 
                    />
                  </FormControl>
                </FormItem>
                
                <FormItem className="flex flex-col">
                  <FormLabel>Unidad de medida</FormLabel>
                  <FormControl>
                    <Input {...productoForm.register("unidadMedida")} />
                  </FormControl>
                </FormItem>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormItem className="flex flex-col">
                  <FormLabel>Precio unitario</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...productoForm.register("precioUnitario", { valueAsNumber: true })} 
                    />
                  </FormControl>
                </FormItem>
                
                <FormItem className="flex flex-col">
                  <FormLabel>Bonificación (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...productoForm.register("porcentajeBonificacion", { valueAsNumber: true })} 
                    />
                  </FormControl>
                </FormItem>
              </div>
              
              <FormItem className="flex flex-col">
                <FormLabel>Alícuota IVA</FormLabel>
                <Select 
                  value={productoForm.watch("alicuotaIVA")} 
                  onValueChange={(value) => productoForm.setValue("alicuotaIVA", value as "21%" | "10.5%" | "27%" | "5%" | "2.5%" | "0%")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Alícuota IVA" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="21%">21%</SelectItem>
                    <SelectItem value="10.5%">10.5%</SelectItem>
                    <SelectItem value="27%">27%</SelectItem>
                    <SelectItem value="5%">5%</SelectItem>
                    <SelectItem value="2.5%">2.5%</SelectItem>
                    <SelectItem value="0%">0% (Exento)</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editandoProducto ? "Actualizar Producto" : "Agregar Producto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Vista previa de factura */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa de Factura</DialogTitle>
          </DialogHeader>
          
          {facturaActual && (
            <div id="factura-para-imprimir" className="p-4 border rounded-md bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">{facturaActual.emisor.razonSocial}</h2>
                  <p className="text-sm text-gray-600">{facturaActual.emisor.domicilioComercial}</p>
                  <p className="text-sm text-gray-600">CUIT: {facturaActual.emisor.cuit}</p>
                  <p className="text-sm text-gray-600">{facturaActual.emisor.condicionIVA}</p>
                </div>
                <div className="text-center border-2 border-black p-4 rounded">
                  <h2 className="text-2xl font-bold">FACTURA {facturaActual.tipo}</h2>
                  <p className="text-sm">N°: {facturaActual.numero}</p>
                  <p className="text-sm">Fecha: {facturaActual.fecha}</p>
                </div>
              </div>
              
              <div className="mt-8 border p-4 rounded">
                <h3 className="font-medium">Cliente</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
                  <div>
                    <span className="text-sm font-medium">Razón Social:</span> {facturaActual.receptor.razonSocial}
                  </div>
                  <div>
                    <span className="text-sm font-medium">CUIT:</span> {facturaActual.receptor.cuit}
                  </div>
                  <div>
                    <span className="text-sm font-medium">Domicilio:</span> {facturaActual.receptor.domicilioComercial}
                  </div>
                  <div>
                    <span className="text-sm font-medium">Condición IVA:</span> {facturaActual.receptor.condicionIVA}
                  </div>
                  <div>
                    <span className="text-sm font-medium">Condición Venta:</span> {facturaActual.receptor.condicionVenta}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2">Detalle</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Código</th>
                      <th className="border p-2 text-left">Descripción</th>
                      <th className="border p-2 text-right">Cant.</th>
                      <th className="border p-2 text-right">Precio Unit.</th>
                      <th className="border p-2 text-right">Bonif.</th>
                      <th className="border p-2 text-right">Subtotal</th>
                      <th className="border p-2 text-right">IVA</th>
                      <th className="border p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturaActual.productos.map((producto) => (
                      <tr key={producto.id}>
                        <td className="border p-2">{producto.codigo}</td>
                        <td className="border p-2">{producto.descripcion}</td>
                        <td className="border p-2 text-right">{producto.cantidad}</td>
                        <td className="border p-2 text-right">${producto.precioUnitario.toFixed(2)}</td>
                        <td className="border p-2 text-right">{producto.porcentajeBonificacion}%</td>
                        <td className="border p-2 text-right">${producto.subtotal.toFixed(2)}</td>
                        <td className="border p-2 text-right">{producto.alicuotaIVA}</td>
                        <td className="border p-2 text-right">${producto.subtotalConIVA.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-end">
                <div className="w-1/3">
                  <div className="flex justify-between py-1">
                    <span>Importe Neto:</span>
                    <span>${facturaActual.importeNeto.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>IVA 21%:</span>
                    <span>${facturaActual.importeIVA.iva21.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>IVA 10.5%:</span>
                    <span>${facturaActual.importeIVA.iva105.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Otros Tributos:</span>
                    <span>${facturaActual.otrosTributos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-t font-bold mt-2 pt-2">
                    <span>TOTAL:</span>
                    <span>${facturaActual.importeTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm"><span className="font-medium">CAE:</span> {facturaActual.cae}</p>
                    <p className="text-sm"><span className="font-medium">Fecha Vto. CAE:</span> {facturaActual.fechaVtoCAE}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4 space-x-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Cerrar
            </Button>
            <Button variant="outline" onClick={imprimirFactura}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            {facturaActual && (
              <>
                <Button variant="outline" onClick={() => descargarFactura(facturaActual)}>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar PDF
                </Button>
                <Button variant="default" onClick={() => generarFacturaAFIP(facturaActual)} disabled={conectandoAFIP}>
                  {conectandoAFIP ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Conectando con AFIP...
                    </span>
                  ) : (
                    <>
                      <FileCheck className="mr-2 h-4 w-4" />
                      Enviar a AFIP
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
