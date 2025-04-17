
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
}

export function ImportExcelDialog({
  open,
  onOpenChange,
  onImport,
  templateData,
  templateFilename,
  title,
  description
}: ImportExcelDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
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
  
  const handleImport = async () => {
    if (!file) {
      toast.error('Por favor seleccione un archivo');
      return;
    }
    
    try {
      setUploading(true);
      setProgress(10);
      
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
          
          // Process the data
          onImport(jsonData);
          
          setProgress(100);
          toast.success(`${jsonData.length} registros importados correctamente`);
          
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
