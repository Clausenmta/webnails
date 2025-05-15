
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface PdfExportOptions {
  title?: string;
  subject?: string;
  author?: string;
  fontSize?: {
    normal: number;
    large: number;
  };
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  orientation?: "portrait" | "landscape";
  scale?: number;
}

const defaultOptions: PdfExportOptions = {
  title: "Documento Exportado",
  subject: "Generado automáticamente",
  author: "Nails & Co",
  fontSize: {
    normal: 12,
    large: 16
  },
  margins: {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10
  },
  orientation: "portrait",
  scale: 2
};

export const exportElementToPDF = async (
  elementId: string,
  filename: string,
  options?: Partial<PdfExportOptions>
) => {
  try {
    const mergedOptions = { ...defaultOptions, ...options };
    const input = document.getElementById(elementId);
    
    if (!input) {
      console.error(`Element with ID "${elementId}" not found`);
      return;
    }

    // Store elements to hide during capture
    const elementsToHide = Array.from(input.querySelectorAll("button, .pdf-hide"));
    
    // Show elements that should only appear in PDF
    const pdfOnlyElements = Array.from(input.querySelectorAll(".pdf-only"));
    pdfOnlyElements.forEach(el => {
      el.classList.remove("hidden");
    });
    
    // Hide elements before capture
    elementsToHide.forEach(el => {
      el.setAttribute("data-previous-display", getComputedStyle(el).display);
      (el as HTMLElement).style.display = "none";
    });

    // Create canvas from element
    const canvas = await html2canvas(input, { 
      scale: mergedOptions.scale,
      logging: false,
      useCORS: true,
      allowTaint: true
    });
    
    // Get image data
    const imgData = canvas.toDataURL("image/png");

    // Create PDF document
    const pdf = new jsPDF({
      orientation: mergedOptions.orientation,
      unit: "mm",
      format: "a4",
    });

    // Add metadata
    pdf.setProperties({
      title: mergedOptions.title || "",
      subject: mergedOptions.subject || "",
      author: mergedOptions.author || "",
      creator: "Nails & Co"
    });

    // Set font to use a more readable one
    pdf.setFont("Helvetica");

    // Calculate dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth - (mergedOptions.margins?.left || 0) - (mergedOptions.margins?.right || 0);
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    
    // Add content to PDF
    pdf.addImage(
      imgData, 
      "PNG", 
      mergedOptions.margins?.left || 0,
      mergedOptions.margins?.top || 0, 
      imgWidth, 
      imgHeight
    );

    // Save the PDF
    pdf.save(filename);

    // Restore hidden elements
    elementsToHide.forEach(el => {
      const previousDisplay = el.getAttribute("data-previous-display") || "block";
      (el as HTMLElement).style.display = previousDisplay;
      el.removeAttribute("data-previous-display");
    });
    
    // Hide PDF-only elements again
    pdfOnlyElements.forEach(el => {
      el.classList.add("hidden");
    });

    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};

export const exportSalaryDetailToPDF = async (
  elementId: string,
  employeeName: string,
  month: string,
  year: string
) => {
  // Format month name with first letter capitalized
  const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
  
  // Format filename
  const filename = `Sueldo_${employeeName.replace(/\s+/g, '_')}_${formattedMonth}-${year}.pdf`;
  
  // Export with enhanced options
  return exportElementToPDF(elementId, filename, {
    title: `Liquidación de Sueldo - ${employeeName}`,
    subject: `Sueldo correspondiente a ${formattedMonth} de ${year}`,
    fontSize: {
      normal: 12,
      large: 16
    },
    margins: {
      top: 15,
      right: 15,
      bottom: 15,
      left: 15
    },
    scale: 2
  });
};
