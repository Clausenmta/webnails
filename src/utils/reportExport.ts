
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { ExportOptions } from '@/types/auth';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Añadir esta definición para TypeScript
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export const exportReport = (data: any, options: ExportOptions) => {
  const { filename, format } = options;
  
  try {
    if (format === 'txt') {
      // Convertir datos a texto
      let content = '';
      
      if (typeof data === 'string') {
        content = data;
      } else if (Array.isArray(data)) {
        content = data.map(item => JSON.stringify(item)).join('\n');
      } else {
        content = JSON.stringify(data, null, 2);
      }
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${filename}.txt`);
      toast.success(`Reporte exportado como TXT correctamente`);
      return true;
    } 
    else if (format === 'excel') {
      // Implementación real con XLSX
      let worksheet;
      
      if (Array.isArray(data)) {
        // Si es un array de objetos, convertirlo a worksheet
        worksheet = XLSX.utils.json_to_sheet(data);
      } else if (typeof data === 'object') {
        // Si es un objeto con propiedades anidadas, aplanarlo primero
        const flatData = [data];
        worksheet = XLSX.utils.json_to_sheet(flatData);
      } else {
        // Fallback para otros tipos de datos
        worksheet = XLSX.utils.aoa_to_sheet([[data]]);
      }
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
      
      // Convertir a blob y descargar
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `${filename}.xlsx`);
      toast.success(`Reporte exportado como EXCEL correctamente`);
      return true;
    } 
    else if (format === 'pdf') {
      // Implementación mejorada de exportación a PDF
      const doc = new jsPDF();
      
      // Configurar fuentes y colores para mejorar la estética
      doc.setFont("helvetica");
      
      // Título con estilo mejorado
      doc.setFontSize(22);
      doc.setTextColor(128, 0, 128); // Color púrpura para el título principal
      doc.text("Nails & Co", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
      
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40); // Color gris oscuro para subtítulos
      doc.text(filename, doc.internal.pageSize.getWidth() / 2, 30, { align: "center" });
      
      // Si es objeto específico de recibo de sueldo, usar formato especial
      if (data && data.employeeData && data.salaryData) {
        const { employeeData, salaryData } = data;
        
        // Información de cabecera
        doc.setFontSize(12);
        doc.text(`Empleado: ${employeeData.name}`, 20, 45);
        doc.text(`Posición: ${employeeData.position}`, 20, 52);
        doc.text(`Período: ${salaryData.date}`, 20, 59);
        
        // Sección de facturación
        doc.setFontSize(14);
        doc.setTextColor(80, 80, 80);
        doc.text("Detalles de facturación", 20, 70);
        
        const billingData = [
          ["Concepto", "Monto"],
          ["Facturación Total", `$${salaryData.totalBilling.toLocaleString('es-AR')}`],
          [`Comisión (${salaryData.commissionRate}%)`, `$${salaryData.commission.toLocaleString('es-AR')}`]
        ];
        
        doc.autoTable({
          startY: 75,
          head: [billingData[0]],
          body: billingData.slice(1),
          theme: 'striped',
          headStyles: { 
            fillColor: [128, 0, 128], 
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: { 
            fontSize: 10,
            cellPadding: 4
          }
        });
        
        // Componentes del sueldo
        const componentY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setTextColor(80, 80, 80);
        doc.text("Componentes del sueldo", 20, componentY);
        
        const componentsData = [
          ["Concepto", "Monto"],
          ["Adelanto", `$${salaryData.advance.toLocaleString('es-AR')}`],
          ["Capacitación", `$${salaryData.training.toLocaleString('es-AR')}`],
          ["Vacaciones", `$${salaryData.vacation.toLocaleString('es-AR')}`],
          ["Recepción", `$${salaryData.reception.toLocaleString('es-AR')}`],
          ["SAC", `$${salaryData.sac.toLocaleString('es-AR')}`],
          ["Recibo", `$${salaryData.receipt.toLocaleString('es-AR')}`]
        ];
        
        // Agregar extras si existen
        if (salaryData.extras && salaryData.extras.length > 0) {
          salaryData.extras.forEach(extra => {
            componentsData.push([`Extra: ${extra.concept}`, `$${extra.amount.toLocaleString('es-AR')}`]);
          });
        }
        
        doc.autoTable({
          startY: componentY + 5,
          head: [componentsData[0]],
          body: componentsData.slice(1),
          theme: 'striped',
          headStyles: { 
            fillColor: [128, 0, 128], 
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          styles: { 
            fontSize: 10,
            cellPadding: 4
          }
        });
        
        // Totales con estilo destacado
        const totalsY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setTextColor(80, 80, 80);
        doc.text("Totales", 20, totalsY);
        
        const totalsData = [
          ["Concepto", "Monto"],
          ["Efectivo", `$${salaryData.cash.toLocaleString('es-AR')}`],
          ["TOTAL SUELDO", `$${salaryData.totalSalary.toLocaleString('es-AR')}`]
        ];
        
        doc.autoTable({
          startY: totalsY + 5,
          head: [totalsData[0]],
          body: totalsData.slice(1),
          theme: 'striped',
          headStyles: { 
            fillColor: [128, 0, 128], 
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 10,
            cellPadding: 4
          },
          // Destacar la última fila (total sueldo)
          didParseCell: function(data) {
            if (data.row.index === 1 && data.column.index === 1) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fontSize = 12;
            }
          }
        });
        
        // Agregar líneas para firmas
        const signatureY = doc.lastAutoTable.finalY + 30;
        const pageWidth = doc.internal.pageSize.getWidth();
        
        doc.setDrawColor(200, 200, 200);
        doc.line(25, signatureY, 95, signatureY);
        doc.line(pageWidth - 95, signatureY, pageWidth - 25, signatureY);
        
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        doc.text("Firma del empleado", 60, signatureY + 10, { align: "center" });
        doc.text("Firma del empleador", pageWidth - 60, signatureY + 10, { align: "center" });
        
        // Pie de página con fecha de impresión
        const currentDate = new Date().toLocaleDateString('es-AR');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generado el ${currentDate}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
      } 
      else if (Array.isArray(data)) {
        // Para arrays generales, mantener el formato de tabla
        // Extraer headers del primer objeto
        const headers = Object.keys(data[0] || {});
        const rows = data.map(item => 
          headers.map(header => item[header]?.toString() || '')
        );
        
        doc.autoTable({
          head: [headers],
          body: rows,
          startY: 40,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [128, 0, 128], textColor: [255, 255, 255] }
        });
      } 
      else if (typeof data === 'object') {
        // Para un objeto con propiedades
        const rows = Object.entries(data).map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            return [key, JSON.stringify(value)];
          }
          return [key, value?.toString() || ''];
        });
        
        doc.autoTable({
          body: rows,
          startY: 40,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 3 }
        });
      } 
      else {
        // Fallback para otros tipos de datos
        doc.text(String(data), 14, 40);
      }
      
      // Guardar PDF
      doc.save(`${filename}.pdf`);
      toast.success(`Reporte exportado como PDF correctamente`);
      return true;
    }
    
    // Fix for the toUpperCase error - ensure format is a string before calling toUpperCase
    toast.success(`Reporte exportado como ${String(format).toUpperCase()} correctamente`);
    return true;
  } catch (error) {
    console.error('Error al exportar reporte:', error);
    toast.error('Error al exportar el reporte');
    return false;
  }
};
