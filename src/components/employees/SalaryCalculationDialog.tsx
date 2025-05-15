
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { FileDown, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Employee } from "@/types/employees";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { exportSalaryDetailToPDF } from "@/utils/pdfExport";
import { Card } from "@/components/ui/card";

interface SalaryCalculationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
}

interface ExtraItem {
  id: string;
  concept: string;
  amount: number;
}

export default function SalaryCalculationDialog({
  open,
  onOpenChange,
  employee
}: SalaryCalculationDialogProps) {
  const [salaryComponents, setSalaryComponents] = useState({
    baseAmount: employee.salary || 0,
    commission: 0,
    bonus: 0,
    deductions: 0,
    advances: 0,
  });
  
  const [extras, setExtras] = useState<ExtraItem[]>([]);
  const [newExtraConcept, setNewExtraConcept] = useState("");
  const [newExtraAmount, setNewExtraAmount] = useState<number>(0);
  
  const [calculatedSalary, setCalculatedSalary] = useState({
    grossTotal: 0,
    netTotal: 0,
    percentageChange: 0,
    cashAmount: 0,
    receiptAmount: 0,
    vacationAmount: 0
  });
  
  const [exportLoading, setExportLoading] = useState(false);
  
  // Current month and year for the PDF and display
  const currentDate = new Date();
  const currentMonth = format(currentDate, 'MMMM', { locale: es });
  const currentYear = format(currentDate, 'yyyy');

  // Calculate salary totals whenever components change
  useEffect(() => {
    const { commission, bonus, deductions, advances } = salaryComponents;
    
    // Sum all extras
    const extrasTotal = extras.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate according to formula
    const grossTotal = commission + bonus + extrasTotal;
    const vacationAmount = grossTotal * 0.081;
    const receiptAmount = grossTotal * 0.14;
    const netTotal = grossTotal - deductions - advances;
    const cashAmount = netTotal * 0.85;
    
    // Calculate percentage difference from base salary
    const baseAmount = salaryComponents.baseAmount || 0;
    const percentageChange = baseAmount !== 0 
      ? ((netTotal - baseAmount) / baseAmount) * 100 
      : 0;
      
    setCalculatedSalary({
      grossTotal,
      netTotal,
      percentageChange,
      cashAmount,
      receiptAmount,
      vacationAmount
    });
  }, [salaryComponents, extras]);
  
  // Set initial values based on employee data
  useEffect(() => {
    if (employee) {
      setSalaryComponents(prev => ({
        ...prev,
        baseAmount: employee.salary || 0,
        // Establecemos la comisión como el 30% del salario base como ejemplo
        commission: employee.salary ? employee.salary * 0.3 : 0,
      }));
    }
  }, [employee]);
  
  const handleInputChange = (field: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setSalaryComponents(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };
  
  const handleAddExtra = () => {
    if (newExtraConcept.trim() && newExtraAmount > 0) {
      setExtras([
        ...extras,
        {
          id: Date.now().toString(),
          concept: newExtraConcept,
          amount: newExtraAmount
        }
      ]);
      setNewExtraConcept("");
      setNewExtraAmount(0);
    }
  };
  
  const handleRemoveExtra = (id: string) => {
    setExtras(extras.filter(item => item.id !== id));
  };
  
  const handleExportToPDF = async () => {
    setExportLoading(true);
    
    try {
      await exportSalaryDetailToPDF(
        "pdf-content",
        employee.name,
        currentMonth,
        currentYear
      );
    } finally {
      setExportLoading(false);
    }
  };

  const totalExtras = extras.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Cálculo de Sueldo</DialogTitle>
          <DialogDescription>
            {employee.name} - {employee.position}
          </DialogDescription>
        </DialogHeader>
        
        <div id="pdf-content" className="space-y-6 pt-4">
          {/* Additional header for PDF */}
          <div className="pdf-only hidden">
            <h2 className="text-2xl font-bold text-center">Liquidación de Sueldo</h2>
            <p className="text-center text-muted-foreground">
              Sueldo correspondiente a {currentMonth} de {currentYear}
            </p>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{employee.name}</h3>
              <p className="text-sm text-muted-foreground">{employee.position}</p>
            </div>
            
            <Badge variant={employee.status === "active" ? "outline" : "secondary"} className="ml-auto">
              {employee.status === "active" ? "Activo" : "Inactivo"}
            </Badge>
          </div>
          
          {/* Grid layout para los componentes de sueldo, como en la imagen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="commission">Porcentaje de Comisión (30%)</Label>
              <Input
                id="commission"
                type="number"
                value={salaryComponents.commission}
                onChange={(e) => handleInputChange("commission", e.target.value)}
                className="bg-slate-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sac">SAC</Label>
              <Input
                id="sac"
                type="number"
                value={0}
                readOnly
                className="bg-slate-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="advances">Adelanto</Label>
              <Input
                id="advances"
                type="number"
                value={salaryComponents.advances}
                onChange={(e) => handleInputChange("advances", e.target.value)}
                className="bg-slate-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receipt">Recibo</Label>
              <Input
                id="receipt"
                type="number"
                value={calculatedSalary.receiptAmount}
                readOnly
                className="bg-slate-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bonus">Capacitación</Label>
              <Input
                id="bonus"
                type="number"
                value={salaryComponents.bonus}
                onChange={(e) => handleInputChange("bonus", e.target.value)}
                className="bg-slate-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cashAmount">Efectivo (calculado)</Label>
              <Input
                id="cashAmount"
                type="number"
                value={calculatedSalary.cashAmount}
                readOnly
                className="bg-slate-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vacations">Vacaciones</Label>
              <Input
                id="vacations"
                type="number"
                value={calculatedSalary.vacationAmount}
                readOnly
                className="bg-slate-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalSalary">TOTAL SUELDO</Label>
              <Input
                id="totalSalary"
                type="number"
                value={calculatedSalary.netTotal}
                readOnly
                className="bg-slate-50 font-bold"
              />
            </div>
          </div>
          
          {/* Sección de extras, similar a la de la imagen */}
          <div className="mt-8">
            <h3 className="font-medium text-lg mb-4">Extras</h3>
            
            <div className="space-y-4">
              {extras.map(extra => (
                <div key={extra.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded-md">
                  <div className="flex-1">
                    <p>{extra.concept}</p>
                    <p className="text-muted-foreground">${extra.amount.toLocaleString()}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveExtra(extra.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Eliminar
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
              <div className="md:col-span-7">
                <Label htmlFor="extraConcept">Concepto</Label>
                <Input
                  id="extraConcept"
                  value={newExtraConcept}
                  onChange={(e) => setNewExtraConcept(e.target.value)}
                  placeholder="Descripción del extra"
                />
              </div>
              
              <div className="md:col-span-3">
                <Label htmlFor="extraAmount">Monto</Label>
                <Input
                  id="extraAmount"
                  type="number"
                  value={newExtraAmount}
                  onChange={(e) => setNewExtraAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="md:col-span-2 flex items-end">
                <Button
                  onClick={handleAddExtra}
                  className="w-full"
                  disabled={!newExtraConcept || newExtraAmount <= 0}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Fórmula como en la imagen */}
          <Card className="p-4 bg-slate-50 mt-6">
            <p className="font-medium">Fórmula Efectivo:</p>
            <p className="text-muted-foreground">
              Comisión + SAC - Adelanto - Recibo + Capacitación + Vacaciones + Extras + Recepción
            </p>
          </Card>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            variant="default" 
            onClick={handleExportToPDF} 
            disabled={exportLoading}
            className="bg-salon-400 hover:bg-salon-500"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            Guardar Cálculo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
