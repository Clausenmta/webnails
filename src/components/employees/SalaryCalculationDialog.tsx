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
import { Textarea } from "@/components/ui/textarea";
import { Employee } from "@/pages/EmpleadosPage";
import { toast } from "sonner";
import { Calculator, Download, Save, List } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Card, CardContent } from "@/components/ui/card";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: {
      finalY: number;
    };
  }
}

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
  extras: {
    amount: number;
    concept: string;
  }[];
  cash: number; // calculated
  totalSalary: number; // calculated
};

const mockSalaryHistory: Record<number, SalaryDetails[]> = {
  1: [
    {
      id: 1,
      employeeId: 1,
      date: "marzo 2025",
      totalBilling: 320000,
      commission: 96000,
      commissionRate: 30,
      advance: 20000,
      training: 5000,
      vacation: 0,
      reception: 10000,
      sac: 8000,
      receipt: 40000,
      extras: [
        { amount: 3000, concept: "Curso de uñas" }
      ],
      cash: 46000,
      totalSalary: 54000,
    }
  ],
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
    extras: [],
    cash: 0,
    totalSalary: 0,
  });
  
  const [newExtra, setNewExtra] = useState({ amount: 0, concept: "" });
  const [showHistory, setShowHistory] = useState(true); // Iniciar mostrando el historial
  const [isCalculating, setIsCalculating] = useState(false);
  const [salaryHistory, setSalaryHistory] = useState<SalaryDetails[]>([]);

  useEffect(() => {
    if (employee) {
      setSalaryData(prev => ({
        ...prev,
        employeeId: employee.id,
        commissionRate: employee.position === "Manicurista" ? 32 : 30,
      }));
      
      setSalaryHistory(mockSalaryHistory[employee.id] || []);
    }
  }, [employee]);

  useEffect(() => {
    const commission = (salaryData.totalBilling * salaryData.commissionRate) / 100;
    const extrasTotal = salaryData.extras.reduce((sum, extra) => sum + extra.amount, 0);
    
    const totalSalary = commission + salaryData.reception + salaryData.sac + 
                        salaryData.training + salaryData.vacation + extrasTotal;
    
    const cash = commission + salaryData.reception + salaryData.sac + 
                 salaryData.training + salaryData.vacation + extrasTotal - 
                 salaryData.receipt;
    
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
    salaryData.sac,
    salaryData.extras
  ]);

  const handleSave = () => {
    const newSalaryRecord = {
      ...salaryData,
      id: Date.now(),
    };
    
    const updatedHistory = [newSalaryRecord, ...salaryHistory];
    setSalaryHistory(updatedHistory);
    
    mockSalaryHistory[employee?.id || 0] = updatedHistory;
    
    toast.success(`Cálculo de sueldo para ${employee?.name} guardado exitosamente`);
    
    setShowHistory(true);
  };

  const handleExport = () => {
    if (!employee) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.setTextColor(128, 0, 128);
    doc.text("Nails & Co", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Recibo de Sueldo", pageWidth / 2, 30, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Empleado: ${employee.name}`, 20, 45);
    doc.text(`Posición: ${employee.position}`, 20, 52);
    doc.text(`Período: ${salaryData.date}`, 20, 59);
    
    doc.setFontSize(14);
    doc.text("Detalle de sueldo", 20, 70);
    
    const tableData = [
      ["Concepto", "Monto"],
      ["Facturación Total", `$${salaryData.totalBilling.toFixed(2)}`],
      [`Comisión (${salaryData.commissionRate}%)`, `$${salaryData.commission.toFixed(2)}`],
      ["Adelanto", `$${salaryData.advance.toFixed(2)}`],
      ["Capacitación", `$${salaryData.training.toFixed(2)}`],
      ["Vacaciones", `$${salaryData.vacation.toFixed(2)}`],
      ["Recepción", `$${salaryData.reception.toFixed(2)}`],
      ["SAC", `$${salaryData.sac.toFixed(2)}`],
      ["Recibo", `$${salaryData.receipt.toFixed(2)}`],
    ];
    
    salaryData.extras.forEach(extra => {
      tableData.push([`Extra: ${extra.concept}`, `$${extra.amount.toFixed(2)}`]);
    });
    
    tableData.push(
      ["Efectivo", `$${salaryData.cash.toFixed(2)}`],
      ["TOTAL SUELDO", `$${salaryData.totalSalary.toFixed(2)}`]
    );
    
    doc.autoTable({
      startY: 75,
      head: [tableData[0]],
      body: tableData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [128, 0, 128], textColor: [255, 255, 255] },
      foot: [["TOTAL SUELDO", `$${salaryData.totalSalary.toFixed(2)}`]],
      footStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: 'bold' },
    });
    
    const signatureY = doc.lastAutoTable.finalY + 20;
    doc.text("_________________________", 40, signatureY);
    doc.text("_________________________", pageWidth - 40, signatureY, { align: "right" });
    doc.text("Firma del empleado", 40, signatureY + 10);
    doc.text("Firma del empleador", pageWidth - 40, signatureY + 10, { align: "right" });
    
    doc.save(`Recibo_Sueldo_${employee.name.replace(/\s+/g, '_')}_${salaryData.date.replace(/\s+/g, '_')}.pdf`);
    
    toast.success(`Recibo de sueldo exportado para ${employee?.name}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSalaryData({
      ...salaryData,
      [name]: parseFloat(value) || 0,
    });
  };
  
  const handleExtraChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewExtra({
      ...newExtra,
      [name]: name === "amount" ? (parseFloat(value) || 0) : value,
    });
  };
  
  const addExtra = () => {
    if (newExtra.amount > 0 && newExtra.concept.trim()) {
      setSalaryData({
        ...salaryData,
        extras: [...salaryData.extras, { ...newExtra }],
      });
      setNewExtra({ amount: 0, concept: "" });
    }
  };
  
  const removeExtra = (index: number) => {
    const updatedExtras = [...salaryData.extras];
    updatedExtras.splice(index, 1);
    setSalaryData({
      ...salaryData,
      extras: updatedExtras,
    });
  };

  const startCalculation = () => {
    setShowHistory(false);
    setIsCalculating(true);
  };

  if (!employee) return null;

  const totalCashPayment = salaryHistory.reduce((total, salary) => total + salary.cash, 0);
  const totalSalary = salaryHistory.reduce((total, salary) => total + salary.totalSalary, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Cálculo de Sueldo</span>
            {isCalculating && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowHistory(true);
                  setIsCalculating(false);
                }}
                className="flex items-center gap-2"
              >
                <List className="h-4 w-4" />
                Volver al historial
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            Empleado: <strong>{employee.name}</strong> - {employee.position}
          </DialogDescription>
        </DialogHeader>

        {showHistory ? (
          <div className="py-4">
            <h3 className="text-lg font-semibold mb-4">Historial de Sueldos</h3>
            
            {salaryHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Card className="border shadow-sm">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total en Efectivo</p>
                      <p className="text-2xl font-bold">${totalCashPayment.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="border shadow-sm">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Sueldos</p>
                      <p className="text-2xl font-bold">${totalSalary.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </div>
                
                {salaryHistory.map((salary, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">{salary.date}</h4>
                      <span className="font-bold">${salary.totalSalary.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Facturación: ${salary.totalBilling.toFixed(2)}</div>
                      <div>Comisión ({salary.commissionRate}%): ${salary.commission.toFixed(2)}</div>
                      <div>Efectivo: ${salary.cash.toFixed(2)}</div>
                      {salary.extras.length > 0 && (
                        <div className="col-span-2 mt-2">
                          <p className="font-medium">Extras:</p>
                          <ul className="list-disc list-inside pl-2">
                            {salary.extras.map((extra, i) => (
                              <li key={i}>
                                {extra.concept}: ${extra.amount.toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-center mt-6">
                  <Button 
                    onClick={startCalculation}
                    className="bg-salon-400 hover:bg-salon-500"
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Calcular Nuevo Sueldo
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No hay registros de sueldos anteriores</p>
                <Button 
                  onClick={startCalculation}
                  className="bg-salon-400 hover:bg-salon-500"
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular Sueldo
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
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
            
            <div className="space-y-4 border-t pt-4">
              <Label className="font-semibold">Extras</Label>
              
              {salaryData.extras.length > 0 && (
                <div className="space-y-2">
                  {salaryData.extras.map((extra, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{extra.concept}</div>
                        <div className="text-sm text-muted-foreground">${extra.amount.toFixed(2)}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeExtra(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Label htmlFor="extraConcept">Concepto</Label>
                  <Textarea
                    id="extraConcept"
                    name="concept"
                    value={newExtra.concept}
                    onChange={handleExtraChange}
                    placeholder="Descripción del extra"
                    className="h-10"
                  />
                </div>
                <div>
                  <Label htmlFor="extraAmount">Monto</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="extraAmount"
                      name="amount"
                      type="number"
                      value={newExtra.amount || ""}
                      onChange={handleExtraChange}
                      placeholder="0.00"
                    />
                    <Button onClick={addExtra} disabled={!newExtra.concept || newExtra.amount <= 0}>
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-md p-3 mt-2">
              <p className="text-sm"><strong>Fórmula Efectivo:</strong> Comisión + Recepción + SAC + Capacitación + Vacaciones + Extras - Recibo</p>
            </div>
          </>
        )}

        <DialogFooter className="mt-6 flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          {!showHistory && (
            <>
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
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
