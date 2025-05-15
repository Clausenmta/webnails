
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowDown, ArrowUp, FileDown, Percent, CreditCard, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { Employee } from "@/types/employees";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { exportSalaryDetailToPDF } from "@/utils/pdfExport";

interface SalaryCalculationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee;
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
    advances: 0
  });
  
  const [calculatedSalary, setCalculatedSalary] = useState({
    grossTotal: 0,
    netTotal: 0,
    percentageChange: 0
  });
  
  const [exportLoading, setExportLoading] = useState(false);
  
  // Current month and year for the PDF and display
  const currentDate = new Date();
  const currentMonth = format(currentDate, 'MMMM', { locale: es });
  const currentYear = format(currentDate, 'yyyy');

  // Calculate salary totals whenever components change
  useEffect(() => {
    const { baseAmount, commission, bonus, deductions, advances } = salaryComponents;
    
    const grossTotal = baseAmount + commission + bonus;
    const netTotal = grossTotal - deductions - advances;
    
    // Calculate percentage difference from base salary
    const percentageChange = baseAmount !== 0 
      ? ((netTotal - baseAmount) / baseAmount) * 100 
      : 0;
      
    setCalculatedSalary({
      grossTotal,
      netTotal,
      percentageChange
    });
  }, [salaryComponents]);
  
  // Set initial values based on employee data
  useEffect(() => {
    if (employee) {
      setSalaryComponents(prev => ({
        ...prev,
        baseAmount: employee.salary || 0,
      }));
    }
  }, [employee]);
  
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

  const handleInputChange = (field: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setSalaryComponents(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Fecha de ingreso:</span>
              </div>
              <p>{employee.joinDate || "No disponible"}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Salario base:</span>
              </div>
              <p>${employee.salary?.toLocaleString() || "No definido"}</p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Componentes del sueldo</h3>
            
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="baseAmount">Sueldo Base</Label>
                      <Input
                        id="baseAmount"
                        type="number"
                        value={salaryComponents.baseAmount}
                        onChange={(e) => handleInputChange("baseAmount", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="commission">Comisiones</Label>
                      <Input
                        id="commission"
                        type="number"
                        value={salaryComponents.commission}
                        onChange={(e) => handleInputChange("commission", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bonus">Bonos y Otros Ingresos</Label>
                      <Input
                        id="bonus"
                        type="number"
                        value={salaryComponents.bonus}
                        onChange={(e) => handleInputChange("bonus", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="deductions">Deducciones</Label>
                      <Input
                        id="deductions"
                        type="number"
                        value={salaryComponents.deductions}
                        onChange={(e) => handleInputChange("deductions", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="advances">Adelantos</Label>
                      <Input
                        id="advances"
                        type="number"
                        value={salaryComponents.advances}
                        onChange={(e) => handleInputChange("advances", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Resumen</h3>
            
            <Card className="border-salon-200">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ingresos Brutos:</span>
                  <span className="font-medium">${calculatedSalary.grossTotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Deducciones:</span>
                  <span className="font-medium text-red-500">-${(salaryComponents.deductions + salaryComponents.advances).toLocaleString()}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="font-medium">TOTAL NETO:</span>
                  <span className="font-bold text-lg">
                    ${calculatedSalary.netTotal.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Variación respecto al base:</span>
                  <div className="flex items-center gap-1">
                    {calculatedSalary.percentageChange > 0 ? (
                      <ArrowUp className="h-4 w-4 text-emerald-500" />
                    ) : calculatedSalary.percentageChange < 0 ? (
                      <ArrowDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    )}
                    
                    <span className={
                      calculatedSalary.percentageChange > 0
                        ? "text-emerald-500"
                        : calculatedSalary.percentageChange < 0
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }>
                      {Math.abs(calculatedSalary.percentageChange).toFixed(2)}%
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground text-center pt-2">
                  Sueldo correspondiente a {currentMonth} de {currentYear}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
