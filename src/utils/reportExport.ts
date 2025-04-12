
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
      // Implementación real con jsPDF
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text(filename, 14, 22);
      
      // Si es un array, convertirlo a tabla
      if (Array.isArray(data)) {
        // Extraer headers del primer objeto
        const headers = Object.keys(data[0] || {});
        const rows = data.map(item => 
          headers.map(header => item[header]?.toString() || '')
        );
        
        doc.autoTable({
          head: [headers],
          body: rows,
          startY: 30,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [100, 100, 100] }
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
          startY: 30,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 2 }
        });
      } 
      else {
        // Fallback para otros tipos de datos
        doc.text(String(data), 14, 30);
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
