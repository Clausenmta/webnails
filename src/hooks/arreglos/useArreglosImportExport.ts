
import { format } from "date-fns";
import { exportReport } from "@/utils/reportExport";

export const serviceTypes = [
  "Corte de pelo",
  "Coloración",
  "Peinado",
  "Manicura",
  "Pedicura",
  "Tratamiento facial",
  "Otro"
];

export function useArreglosImportExport() {
  const mapStatus = (status: string) => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En proceso';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const handleExportReport = (sortedArreglos: any[]) => {
    const exportData = sortedArreglos.map(arreglo => ({
      Cliente: arreglo.client_name,
      Descripción: arreglo.description,
      Estado: mapStatus(arreglo.status),
      'Comanda Original': arreglo.created_by,
      'Arreglado Por': arreglo.assigned_to || 'N/A',
      Fecha: arreglo.date,
      Precio: arreglo.price,
      'Estado de Pago': arreglo.payment_status === 'pagado' ? 'Pagado' : 'Pendiente',
      Notas: arreglo.notes || ''
    }));

    exportReport(exportData, {
      filename: `Arreglos_${format(new Date(), 'yyyy-MM-dd')}`,
      format: 'excel'
    });
  };

  const templateData = [
    {
      client_name: "Cliente Ejemplo",
      service_type: serviceTypes[0],
      description: "Descripción del arreglo",
      status: "pendiente",
      assigned_to: "",
      price: 1000,
      payment_status: "pendiente",
      notes: "Notas adicionales"
    }
  ];

  const validateArregloImport = (row: any) => {
    if (!row.client_name) {
      return { isValid: false, error: "El nombre del cliente es requerido" };
    }
    if (!row.service_type || !serviceTypes.includes(row.service_type)) {
      return { isValid: false, error: "El tipo de servicio no es válido" };
    }
    if (!row.description) {
      return { isValid: false, error: "La descripción es requerida" };
    }
    if (typeof row.price !== 'number' && isNaN(Number(row.price))) {
      return { isValid: false, error: "El precio debe ser un número" };
    }
    return { isValid: true };
  };

  return {
    handleExportReport,
    templateData,
    validateArregloImport,
    serviceTypes
  };
}
