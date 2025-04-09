
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Employee } from "@/pages/EmpleadosPage";
import { toast } from "sonner";
import { Calculator, Download, Save } from "lucide-react";

type SalaryCalculationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
};

type SalaryDetails = {
  id?: number;
  employeeId: number;
  date: string; // month/year
  totalBilling: number;
  commission: number;
  commissionRate: number; // 30% for "Estilista", 32% for "Manicurista"
  advance: number;
  training: number;
  vacation: number;
  reception: number;
  sac: number;
  receipt: number;
  cash: number; // calculated
  totalSalary: number; // calculated
};

export default function SalaryCalculationDialog({
  open,
  onOpenChange,
  employee,
}: SalaryCalculationDialogProps) {
  const [salaryData, setSalaryData] = useState<SalaryDetails>({
    employeeId: employee?.id || 0,
    date: new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" }),
    totalBilling: 0,
    commission: 0,
    commissionRate: employee?.position === "Manicurista" ? 32 : 30,
    advance: 0,
    training: 0,
    vacation: 0,
    reception: 0,
    sac: 0,
    receipt: 0,
    cash: 0,
    totalSalary: 0,
  });

  useEffect(() => {
    if (employee) {
      setSalaryData(prev => ({
        ...prev,
        employeeId: employee.id,
        commissionRate: employee.position === "Manicurista" ? 32 : 30,
      }));
    }
  }, [employee]);

  // Calculate total salary and commission
  useEffect(() => {
    // Calculate commission based on total billing and rate
    const commission = (salaryData.totalBilling * salaryData.commissionRate) / 100;
    
    // Calculate total salary using the formula:
    // Commission - Advance + Training + Vacation + Reception - Receipt
    const totalSalary = commission - salaryData.advance + salaryData.training + 
                         salaryData.vacation + salaryData.reception - salaryData.receipt;
    
    // Cash amount (calculated based on total salary)
    const cash = totalSalary - salaryData.sac;
    
    setSalaryData(prev => ({
      ...prev,
      commission,
      cash,
      totalSalary,
    }));
  }, [
    salaryData.totalBilling, 
    salaryData.commissionRate, 
    salaryData.advance, 
    salaryData.training, 
    salaryData.vacation, 
    salaryData.reception, 
    salaryData.receipt,
    salaryData.sac
  ]);

  const handleSave = () => {
    // Here we would typically save the salary calculation to a database
    // For now, we'll just show a success toast
    toast.success(`Cálculo de sueldo para ${employee?.name} guardado exitosamente`);
    onOpenChange(false);
  };

  const handleExport = () => {
    toast.success(`Exportando recibo de sueldo para ${employee?.name}`);
    // In a real implementation, this would generate and download a PDF receipt
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSalaryData({
      ...salaryData,
      [name]: parseFloat(value) || 0,
    });
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Cálculo de Sueldo</DialogTitle>
          <DialogDescription>
            Empleado: <strong>{employee.name}</strong> - {employee.position}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalBilling">Facturación Total</Label>
              <Input
                id="totalBilling"
                name="totalBilling"
                type="number"
                value={salaryData.totalBilling || ""}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commissionRate">
                Porcentaje de Comisión ({salaryData.commissionRate}%)
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="commission"
                  readOnly
                  value={salaryData.commission.toFixed(2)}
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="advance">Adelanto</Label>
              <Input
                id="advance"
                name="advance"
                type="number"
                value={salaryData.advance || ""}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="training">Capacitación</Label>
              <Input
                id="training"
                name="training"
                type="number"
                value={salaryData.training || ""}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vacation">Vacaciones</Label>
              <Input
                id="vacation"
                name="vacation"
                type="number"
                value={salaryData.vacation || ""}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reception">Recepción</Label>
              <Input
                id="reception"
                name="reception"
                type="number"
                value={salaryData.reception || ""}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sac">SAC</Label>
              <Input
                id="sac"
                name="sac"
                type="number"
                value={salaryData.sac || ""}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">Recibo</Label>
              <Input
                id="receipt"
                name="receipt"
                type="number"
                value={salaryData.receipt || ""}
                onChange={handleInputChange}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cash">Efectivo (calculado)</Label>
              <Input
                id="cash"
                readOnly
                value={salaryData.cash.toFixed(2)}
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalSalary" className="font-semibold">TOTAL SUELDO</Label>
              <Input
                id="totalSalary"
                readOnly
                value={salaryData.totalSalary.toFixed(2)}
                className="bg-muted font-bold text-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-muted rounded-md p-3 mt-2">
          <p className="text-sm"><strong>Fórmula:</strong> Comisión - Adelanto + Capacitación + Vacaciones + Recepción - Recibo</p>
        </div>

        <DialogFooter className="mt-6 flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleExport}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Recibo
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Guardar Cálculo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
