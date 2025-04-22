
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ImportResult {
  success: boolean;
  message: string;
  data?: any[];
  errors?: string[];
}

interface ExcelImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
  templateData: any[];
  templateFilename: string;
  validationFunction: (row: any) => { isValid: boolean; error?: string };
  allowIncompleteData?: boolean; // Nueva propiedad para permitir datos incompletos
}

export default function ExcelImportDialog({
  isOpen,
  onClose,
  onImport,
  templateData,
  templateFilename,
  validationFunction,
  allowIncompleteData = false // Por defecto, no permitir datos incompletos
}: ExcelImportDialogProps) {
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, templateFilename);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validar cada fila
        const errors: string[] = [];
        const validData: any[] = [];

        jsonData.forEach((row: any, index: number) => {
          // Si permitimos datos incompletos, consideramos todos los registros
          if (allowIncompleteData) {
            validData.push(row);
            return;
          }
          
          // En caso contrario, aplicamos la validación normal
          const validation = validationFunction(row);
          if (!validation.isValid) {
            errors.push(`Fila ${index + 2}: ${validation.error}`);
          } else {
            validData.push(row);
          }
        });

        // Si hay errores y no permitimos datos incompletos, mostramos los errores
        if (errors.length > 0 && !allowIncompleteData) {
          setImportResult({
            success: false,
            message: 'Se encontraron errores en algunos registros',
            errors
          });
        } else {
          // Si permitimos datos incompletos o no hay errores, importamos todos los datos
          onImport(validData);
          setImportResult({
            success: true,
            message: `Se importaron ${validData.length} registros exitosamente`,
            data: validData
          });
        }
      } catch (error) {
        setImportResult({
          success: false,
          message: 'Error al procesar el archivo',
          errors: ['El archivo no tiene el formato esperado']
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar datos desde Excel</DialogTitle>
          <DialogDescription>
            Descargue la plantilla y complete los datos según el formato requerido.
            {allowIncompleteData && " Los campos vacíos pueden ser editados posteriormente."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleDownloadTemplate}
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar Plantilla
          </Button>

          <div className="grid w-full items-center gap-1.5">
            <label
              htmlFor="excel-file"
              className="cursor-pointer w-full flex h-32 items-center justify-center rounded-md border border-dashed border-gray-300 px-6 py-4 text-center hover:border-gray-400"
            >
              <div className="space-y-1 text-center">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <FileText className="h-12 w-12" />
                </div>
                <div className="text-sm text-gray-500">
                  <span>Arrastre un archivo o</span>{' '}
                  <span className="text-blue-600">búsquelo en su equipo</span>
                </div>
                <p className="text-xs text-gray-500">
                  Excel (.xlsx, .xls)
                </p>
              </div>
              <input
                id="excel-file"
                type="file"
                className="hidden"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {importResult && (
            <div className={`p-4 rounded-md ${
              importResult.success ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className="flex items-start">
                {importResult.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    importResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {importResult.message}
                  </h3>
                  {importResult.errors && (
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
