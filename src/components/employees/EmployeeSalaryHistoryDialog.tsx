
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText } from "lucide-react";
import { Employee } from "@/types/employees";
import { salaryService } from "@/services/salaryService";

interface EmployeeSalaryHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
}

export const EmployeeSalaryHistoryDialog = ({ 
  open, 
  onOpenChange, 
  employee 
}: EmployeeSalaryHistoryDialogProps) => {
  const { data: salaryHistory = [], isLoading } = useQuery({
    queryKey: ['employee-salary-history', employee?.id],
    queryFn: () => employee ? salaryService.fetchEmployeeSalaryHistory(employee.id) : Promise.resolve([]),
    enabled: !!employee && open,
  });

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  };

  const generatePDF = (salary: any) => {
    // Aquí implementaremos la generación de PDF más adelante
    console.log("Generando PDF para:", salary);
    alert("Funcionalidad de PDF en desarrollo");
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historial de Sueldos - {employee.name}</DialogTitle>
          <DialogDescription>
            Registro completo de sueldos del empleado
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p>Cargando historial...</p>
          </div>
        ) : salaryHistory.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">No hay registros de sueldos para este empleado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Facturación</TableHead>
                  <TableHead>Comisión</TableHead>
                  <TableHead>Adelanto</TableHead>
                  <TableHead>Vacaciones</TableHead>
                  <TableHead>Recepción</TableHead>
                  <TableHead>Otros</TableHead>
                  <TableHead>Recibo</TableHead>
                  <TableHead className="bg-violet-50">Total Efectivo</TableHead>
                  <TableHead className="bg-violet-50">Total Completo</TableHead>
                  <TableHead className="bg-violet-50">Asegurado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryHistory.map((salary) => (
                  <TableRow key={salary.id}>
                    <TableCell className="font-medium">
                      {monthNames[salary.mes - 1]} {salary.anio}
                    </TableCell>
                    <TableCell>{formatCurrency(salary.facturacion)}</TableCell>
                    <TableCell>{formatCurrency(salary.comision)}</TableCell>
                    <TableCell>{formatCurrency(salary.adelanto)}</TableCell>
                    <TableCell>{formatCurrency(salary.vacaciones)}</TableCell>
                    <TableCell>{formatCurrency(salary.recepcion)}</TableCell>
                    <TableCell>{formatCurrency(salary.otros)}</TableCell>
                    <TableCell>{formatCurrency(salary.recibo)}</TableCell>
                    <TableCell className="bg-violet-50 font-medium">
                      {formatCurrency(salary.total_efectivo)}
                    </TableCell>
                    <TableCell className="bg-violet-50 font-medium">
                      {formatCurrency(salary.total_completo)}
                    </TableCell>
                    <TableCell className="bg-violet-50 font-medium">
                      {formatCurrency(salary.asegurado)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generatePDF(salary)}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
