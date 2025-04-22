
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ImportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: any[]) => void;
  templateData: any[];
  templateFilename: string;
  title: string;
  description: string;
  allowIncompleteData?: boolean; // Property to allow incomplete data
}

export function ImportExcelDialog({
  open,
  onOpenChange,
  onImport,
  templateData,
  templateFilename,
  title,
  description,
  allowIncompleteData = false // Default to false
}: ImportExcelDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrors([]);
      setShowErrors(false);
    }
  };
  
  const handleDownloadTemplate = () => {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    // Generate Excel file and save
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `${templateFilename}.xlsx`);
    
    toast.success('Plantilla descargada correctamente');
  };
  
  const validateRow = (row: any, rowIndex: number): { isValid: boolean; error?: string } => {
    // If we allow incomplete data, mark all records as valid
    if (allowIncompleteData) {
      return { isValid: true };
    }
    
    // If we don't allow incomplete data, validate that required fields exist
    const errors = [];
    
    if (!row.Código) {
      errors.push(`Falta el código en la fila ${rowIndex + 2}`);
    }
    
    if (!row.Monto || isNaN(Number(row.Monto))) {
      errors.push(`Falta el monto en la fila ${rowIndex + 2}`);
    }
    
    if (!row.Fecha_Compra) {
      errors.push(`Falta la fecha de compra en la fila ${rowIndex + 2}`);
    }
    
    return { 
      isValid: errors.length === 0,
      error: errors.join(", ")
    };
  };
  
  const handleImport = async () => {
    if (!file) {
      toast.error('Por favor seleccione un archivo');
      return;
    }
    
    try {
      setUploading(true);
      setProgress(10);
      setErrors([]);
      
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          setProgress(30);
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          setProgress(60);
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          setProgress(80);
          
          if (jsonData.length === 0) {
            toast.error('El archivo no contiene datos');
            setUploading(false);
            return;
          }
          
          console.log("Imported data:", jsonData);
          console.log("Allow incomplete data:", allowIncompleteData);
          
          // Validate each row
          const foundErrors: string[] = [];
          const validData: any[] = [];
          
          jsonData.forEach((row: any, index: number) => {
            const validation = validateRow(row, index);
            if (!validation.isValid && validation.error) {
              foundErrors.push(validation.error);
            }
            
            // If we allow incomplete data or the row is valid, add it to valid data
            if (allowIncompleteData || validation.isValid) {
              validData.push(row);
            }
          });
          
          if (foundErrors.length > 0 && !allowIncompleteData) {
            setErrors(foundErrors);
            setShowErrors(true);
            setUploading(false);
            return;
          }
          
          // Process the data
          onImport(validData);
          
          setProgress(100);
          toast.success(`${validData.length} registros importados correctamente`);
          
          // Reset state
          setFile(null);
          
          // Close dialog after a short delay
          setTimeout(() => {
            setUploading(false);
            onOpenChange(false);
          }, 1000);
          
        } catch (error) {
          console.error('Error processing Excel file:', error);
          toast.error('Error al procesar el archivo Excel');
          setUploading(false);
        }
      };
      
      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      console.error('Error importing data:', error);
      toast.error('Error al importar datos');
      setUploading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={handleDownloadTemplate}
              className="flex gap-2 items-center"
            >
              <Download size={16} />
              Descargar Plantilla
            </Button>
          </div>
          
          <div className="space-y-2">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={uploading}
            />
            
            {uploading && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-center text-muted-foreground">
                  Procesando... {progress}%
                </p>
              </div>
            )}
            
            {showErrors && errors.length > 0 && (
              <div className="mt-4 p-4 border border-red-200 rounded bg-red-50">
                <h4 className="text-red-700 font-medium mb-2">Errores encontrados</h4>
                <div className="max-h-40 overflow-y-auto">
                  {errors.map((error, index) => (
                    <p key={index} className="text-red-600 text-sm mb-1">{error}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!file || uploading}
            className="flex gap-2 items-center"
          >
            <Upload size={16} />
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
