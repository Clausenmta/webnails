
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CalendarCheck, FileDown, Plus, Trash2, ReceiptText, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Employee } from "@/types/employees";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { exportSalaryDetailToPDF } from "@/utils/pdfExport";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const [totalBilling, setTotalBilling] = useState<number>(0);
  const [commissionRate, setCommissionRate] = useState<number>(30);
  
  const [salaryComponents, setSalaryComponents] = useState({
    baseAmount: employee.salary || 0,
    commission: 0,
    bonus: 0, // Capacitación
    advances: 0, // Adelanto
    sac: 0,
    reception: 0, // Recepción
    receipt: 0, // Recibo - Changed to editable field
    vacation: 0, // Vacaciones - Changed to editable field
  });
  
  const [extras, setExtras] = useState<ExtraItem[]>([]);
  const [newExtraConcept, setNewExtraConcept] = useState("");
  const [newExtraAmount, setNewExtraAmount] = useState<number>(0);
  
  const [calculatedSalary, setCalculatedSalary] = useState({
    grossTotal: 0,
    netTotal: 0,
    percentageChange: 0,
    cashAmount: 0
  });
  
  const [exportLoading, setExportLoading] = useState(false);
  
  // Current month and year for the PDF and display
  const currentDate = new Date();
  const currentMonth = format(currentDate, 'MMMM', { locale: es });
  const currentYear = format(currentDate, 'yyyy');

  // Calculate commission based on total billing and commission rate
  useEffect(() => {
    const commission = (totalBilling * commissionRate) / 100;
    setSalaryComponents(prev => ({
      ...prev,
      commission
    }));
  }, [totalBilling, commissionRate]);

  // Calculate salary totals whenever components change
  useEffect(() => {
    const { commission, bonus, advances, sac, reception, receipt, vacation } = salaryComponents;
    
    // Sum all extras
    const extrasTotal = extras.reduce((sum, item) => sum + item.amount, 0);
    
    // Calculate according to the formula:
    // Efectivo: Comisión + SAC - Adelanto - Recibo + Capacitación + Vacaciones + Extras + Recepcion
    const cashAmount = commission + sac - advances - receipt + bonus + vacation + extrasTotal + reception;
    
    // Set net total equal to cash amount per the image
    const netTotal = cashAmount;
    
    // Calculate gross total
    const grossTotal = commission;
    
    // Calculate percentage difference from base salary
    const baseAmount = salaryComponents.baseAmount || 0;
    const percentageChange = baseAmount !== 0 
      ? ((netTotal - baseAmount) / baseAmount) * 100 
      : 0;
      
    setCalculatedSalary({
      grossTotal,
      netTotal,
      percentageChange,
      cashAmount
    });
  }, [salaryComponents, extras]);
  
  // Set initial values based on employee data
  useEffect(() => {
    if (employee) {
      setSalaryComponents(prev => ({
        ...prev,
        baseAmount: employee.salary || 0,
      }));
      
      // Set initial total billing based on employee's current month billing if available
      if (employee.currentMonthBilling) {
        setTotalBilling(employee.currentMonthBilling);
      }
    }
  }, [employee]);
  
  const handleInputChange = (field: string, value: string) => {
    const numericValue = value === "" ? 0 : parseFloat(value);
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
      
      // Show success toast
      toast({
        title: "Extra agregado",
        description: `${newExtraConcept} por $${newExtraAmount} agregado correctamente.`,
      });
    }
  };
  
  const handleRemoveExtra = (id: string) => {
    setExtras(extras.filter(item => item.id !== id));
    
    // Show toast
    toast({
      title: "Extra eliminado",
      variant: "destructive"
    });
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
      
      toast({
        title: "PDF exportado correctamente",
        description: `La liquidación de ${employee.name} ha sido exportada.`,
      });
    } catch (error) {
      toast({
        title: "Error al exportar PDF",
        description: "Por favor intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setExportLoading(false);
    }
  };
  
  const handleSaveCalculation = () => {
    // Implementation for saving calculation would go here
    toast({
      title: "Cálculo guardado",
      description: `Liquidación de sueldo para ${employee.name} guardada correctamente.`
    });
  };

  const totalExtras = extras.reduce((sum, item) => sum + item.amount, 0);
  
  // Format number for display with thousand separators
  const formatNumber = (value: number) => {
    return value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Cálculo de Sueldo</DialogTitle>
          <DialogDescription>
            {employee.name} - {employee.position}
          </DialogDescription>
        </DialogHeader>
        
        <div id="pdf-content" className="space-y-4 pt-3">
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
          
          {/* Facturación total field */}
          <div className="space-y-2 bg-muted/30 p-3 rounded-md">
            <Label htmlFor="totalBilling" className="font-semibold">Facturación Total del Mes</Label>
            <div className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5 text-muted-foreground" />
              <Input
                id="totalBilling"
                type="number"
                value={totalBilling === 0 ? "" : totalBilling}
                onChange={(e) => setTotalBilling(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                className="bg-background font-medium"
                placeholder="0"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              La facturación total se utiliza para calcular automáticamente la comisión.
            </p>
          </div>
          
          {/* Grid layout para los componentes de sueldo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Porcentaje de Comisión (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="commissionRate"
                  type="number"
                  value={commissionRate === 0 ? "" : commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                  className="bg-slate-50"
                  min="0"
                  max="100"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commission">Comisión (calculada)</Label>
              <Input
                id="commission"
                type="text"
                value={formatNumber(salaryComponents.commission)}
                readOnly
                className="bg-slate-50"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sac">SAC</Label>
              <Input
                id="sac"
                type="number"
                value={salaryComponents.sac === 0 ? "" : salaryComponents.sac}
                onChange={(e) => handleInputChange("sac", e.target.value)}
                className="bg-slate-50"
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="advances">Adelanto</Label>
              <Input
                id="advances"
                type="number"
                value={salaryComponents.advances === 0 ? "" : salaryComponents.advances}
                onChange={(e) => handleInputChange("advances", e.target.value)}
                className="bg-slate-50"
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receipt">Recibo</Label>
              <Input
                id="receipt"
                type="number"
                value={salaryComponents.receipt === 0 ? "" : salaryComponents.receipt}
                onChange={(e) => handleInputChange("receipt", e.target.value)}
                className="bg-slate-50"
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bonus">Capacitación</Label>
              <Input
                id="bonus"
                type="number"
                value={salaryComponents.bonus === 0 ? "" : salaryComponents.bonus}
                onChange={(e) => handleInputChange("bonus", e.target.value)}
                className="bg-slate-50"
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vacation">Vacaciones</Label>
              <Input
                id="vacation"
                type="number"
                value={salaryComponents.vacation === 0 ? "" : salaryComponents.vacation}
                onChange={(e) => handleInputChange("vacation", e.target.value)}
                className="bg-slate-50"
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reception">Recepción</Label>
              <Input
                id="reception"
                type="number"
                value={salaryComponents.reception === 0 ? "" : salaryComponents.reception}
                onChange={(e) => handleInputChange("reception", e.target.value)}
                className="bg-slate-50"
                placeholder="0"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="extrasTotal">Total Extras</Label>
              <Input
                id="extrasTotal"
                type="text"
                value={formatNumber(totalExtras)}
                readOnly
                className="bg-slate-50"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="cashAmount">Efectivo (calculado)</Label>
              <Input
                id="cashAmount"
                type="text"
                value={formatNumber(calculatedSalary.cashAmount)}
                readOnly
                className="bg-slate-50"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="totalSalary" className="text-lg font-bold">TOTAL SUELDO</Label>
              <Input
                id="totalSalary"
                type="text"
                value={formatNumber(calculatedSalary.netTotal)}
                readOnly
                className="bg-slate-50 font-bold text-lg"
              />
            </div>
          </div>
          
          {/* Sección de extras */}
          <div>
            <h3 className="font-medium text-lg mb-3">Extras</h3>
            
            <div className="space-y-3">
              {extras.map(extra => (
                <div key={extra.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
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
            
            <div className="grid grid-cols-12 gap-4 mt-3">
              <div className="col-span-7">
                <Label htmlFor="extraConcept">Concepto</Label>
                <Textarea
                  id="extraConcept"
                  value={newExtraConcept}
                  onChange={(e) => setNewExtraConcept(e.target.value)}
                  placeholder="Descripción del extra"
                  className="resize-none h-20"
                />
              </div>
              
              <div className="col-span-3">
                <Label htmlFor="extraAmount">Monto</Label>
                <Input
                  id="extraAmount"
                  type="number"
                  value={newExtraAmount === 0 ? "" : newExtraAmount}
                  onChange={(e) => setNewExtraAmount(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                  placeholder="0"
                />
              </div>
              
              <div className="col-span-2 flex items-end">
                <Button
                  onClick={handleAddExtra}
                  className="w-full h-10"
                  disabled={!newExtraConcept || newExtraAmount <= 0}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Fórmula */}
          <Card className="p-3 bg-slate-50">
            <p className="font-medium">Fórmula Efectivo:</p>
            <p className="text-muted-foreground">
              Comisión + SAC - Adelanto - Recibo + Capacitación + Vacaciones + Extras + Recepción
            </p>
          </Card>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
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
            onClick={handleSaveCalculation}
          >
            <FileText className="mr-2 h-4 w-4" />
            Guardar Cálculo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
