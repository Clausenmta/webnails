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
