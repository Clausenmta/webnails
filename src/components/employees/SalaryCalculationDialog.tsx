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
import { Employee } from "@/types/employees";
import { toast } from "@/hooks/use-toast";
import { Calculator, Download, Save, FileText, ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { exportReport, generatePdfPreview } from "@/utils/reportExport";

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

// Mock data for salary history
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
    },
    {
      id: 2,
      employeeId: 1,
      date: "abril 2025",
      totalBilling: 350000,
      commission: 105000,
      commissionRate: 30,
      advance: 25000,
      training: 7000,
      vacation: 5000,
      reception: 12000,
      sac: 8500,
      receipt: 45000,
      extras: [
        { amount: 4500, concept: "Capacitación especial" }
      ],
      cash: 71000,
      totalSalary: 116000,
    },
    {
      id: 3,
      employeeId: 1,
      date: "mayo 2025",
      totalBilling: 2654000,
      commission: 796200,
      commissionRate: 30,
      advance: 35000,
      training: 10000,
      vacation: 30000,
      reception: 15000,
      sac: 15000,
      receipt: 150000,
      extras: [
        { amount: 20000, concept: "Bono por rendimiento" },
        { amount: 12500, concept: "Presentismo" }
      ],
      cash: 897945.25,
      totalSalary: 1054874.53,
    }
  ],
};

// Default empty salary data for new calculations
const getDefaultSalaryData = (employee: Employee | null): SalaryDetails => ({
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

export default function SalaryCalculationDialog({
  open,
  onOpenChange,
  employee,
}: SalaryCalculationDialogProps) {
  const [salaryData, setSalaryData] = useState<SalaryDetails>(getDefaultSalaryData(employee));
  
  const [newExtra, setNewExtra] = useState({ amount: 0, concept: "" });
  const [showHistory, setShowHistory] = useState(true); // Iniciar mostrando el historial
  const [isCalculating, setIsCalculating] = useState(false);
  const [salaryHistory, setSalaryHistory] = useState<SalaryDetails[]>([]);
  const [selectedSalary, setSelectedSalary] = useState<SalaryDetails | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (employee) {
      // Only update employee-related fields, not calculation values
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
    
    // Fórmula actualizada para incluir recepción
    const cash = commission + salaryData.sac - 
                 salaryData.advance - salaryData.receipt + 
                 salaryData.training + salaryData.vacation + extrasTotal +
                 salaryData.reception;
    
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
    setIsLoading(true);
    
    setTimeout(() => {
      let newSalaryRecord: SalaryDetails;
      
      if (isEditing && selectedSalary?.id) {
        newSalaryRecord = {
          ...salaryData,
          id: selectedSalary.id
        };
        
        const updatedHistory = salaryHistory.map(salary => 
          salary.id === selectedSalary.id ? newSalaryRecord : salary
        );
        
        setSalaryHistory(updatedHistory);
        toast.success(`Sueldo de ${employee?.name} actualizado exitosamente`);
        mockSalaryHistory[employee?.id || 0] = updatedHistory;
      } else {
        newSalaryRecord = {
          ...salaryData,
          id: Date.now(),
        };
        
        const updatedHistory = [newSalaryRecord, ...salaryHistory];
        setSalaryHistory(updatedHistory);
        mockSalaryHistory[employee?.id || 0] = updatedHistory;
        toast.success(`Cálculo de sueldo para ${employee?.name} guardado exitosamente`);
      }
      
      setIsLoading(false);
      setIsEditing(false);
      setIsViewingDetails(false);
      setShowHistory(true);
      setSelectedSalary(null);
    }, 600);
  };

  const handleViewDetails = (salary: SalaryDetails) => {
    setSelectedSalary(salary);
    setIsViewingDetails(true);
    setShowHistory(false);
  };

  const handleEditSalary = () => {
    if (selectedSalary) {
      setSalaryData(selectedSalary);
      setIsViewingDetails(false);
      setIsEditing(true);
      setIsCalculating(true);
    }
  };

  const handleDeleteSalary = () => {
    if (selectedSalary) {
      setIsLoading(true);
      
      setTimeout(() => {
        const updatedHistory = salaryHistory.filter(
          salary => salary.id !== selectedSalary.id
        );
        
        setSalaryHistory(updatedHistory);
        mockSalaryHistory[employee?.id || 0] = updatedHistory;
        
        toast.success(`Registro de sueldo eliminado exitosamente`);
        setIsLoading(false);
        setIsViewingDetails(false);
        setShowHistory(true);
        setSelectedSalary(null);
      }, 600);
    }
  };

  // Método actualizado para exportar
  const handleExport = () => {
    if (!employee || !selectedSalary) {
      toast.error("No hay datos para exportar");
      return;
    }
    
    setIsGeneratingPdf(true);
    
    try {
      // Preparamos los datos con formato específico para la exportación
      const exportData = {
        employeeData: {
          name: employee.name,
          position: employee.position,
          id: employee.id
        },
        salaryData: selectedSalary
      };
      
      // Usamos la función mejorada de exportación
      const success = exportReport(exportData, {
        filename: `Recibo_Sueldo_${employee.name.replace(/\s+/g, '_')}_${selectedSalary.date.replace(/\s+/g, '_')}`,
        format: 'pdf'
      });
      
      if (!success) {
        toast.error("Error al exportar el PDF. Verifique los datos.");
      }
    } catch (error) {
      console.error("Error en exportación:", error);
      toast.error(`Error al exportar: ${error instanceof Error ? error.message : 'Verifique los datos'}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Método actualizado para la vista previa del PDF
  const handlePreviewPdf = () => {
    if (!employee || !selectedSalary) {
      toast.error("No hay datos para previsualizar");
      return;
    }
    
    setIsGeneratingPdf(true);
    
    try {
      // Preparamos los datos para la vista previa
      const exportData = {
        employeeData: {
          name: employee.name,
          position: employee.position,
          id: employee.id
        },
        salaryData: selectedSalary
      };
      
      // Usar la función dedicada para generar la vista previa
      const pdfUrl = generatePdfPreview(exportData);
      
      if (pdfUrl) {
        setPdfPreview(pdfUrl);
      } else {
        toast.error("Error al generar la vista previa. Verifique los datos.");
      }
    } catch (error) {
      console.error("Error en vista previa:", error);
      toast.error(`Error al generar vista previa: ${error instanceof Error ? error.message : 'Verifique los datos'}`);
    } finally {
      setIsGeneratingPdf(false);
    }
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
    // Reset all fields to zero for a new calculation
    setSalaryData({
      ...getDefaultSalaryData(employee),
      employeeId: employee?.id || 0,
      commissionRate: employee?.position === "Manicurista" ? 32 : 30,
      date: new Date().toLocaleDateString("es-AR", { month: "long", year: "numeric" })
    });
    
    setPdfPreview(null);
    setSelectedSalary(null);
    setIsViewingDetails(false);
    setShowHistory(false);
    setIsCalculating(true);
    setNewExtra({ amount: 0, concept: "" });
  };

  if (!employee) return null;

  const totalCashPayment = salaryHistory.reduce((total, salary) => total + salary.cash, 0);
  const totalSalary = salaryHistory.reduce((total, salary) => total + salary.totalSalary, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            {isViewingDetails ? (
              <span>Detalle de Sueldo</span>
            ) : isCalculating ? (
              <span>Cálculo de Sueldo</span>
            ) : (
              <span>Historial de Sueldos</span>
            )}
            {(isCalculating || isViewingDetails) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setPdfPreview(null);
                  setShowHistory(true);
                  setIsCalculating(false);
                  setIsViewingDetails(false);
                  setSelectedSalary(null);
                }}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al historial
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            Empleado: <strong>{employee.name}</strong> - {employee.position}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-4 py-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {showHistory && !isLoading && (
          <div className="py-4">
            <h3 className="text-lg font-semibold mb-4">Historial de Sueldos</h3>
            
            {salaryHistory.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Card className="border shadow-sm">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total en Efectivo</p>
                      <p className="text-2xl font-bold">${totalCashPayment.toLocaleString('es-AR')}</p>
                    </CardContent>
                  </Card>
                  <Card className="border shadow-sm">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Sueldos</p>
                      <p className="text-2xl font-bold">${totalSalary.toLocaleString('es-AR')}</p>
                    </CardContent>
                  </Card>
                </div>
                
                {salaryHistory.map((salary, index) => (
                  <div key={index} className="border rounded-md p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => handleViewDetails(salary)}>
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">{salary.date}</h4>
                      <span className="font-bold">${salary.totalSalary.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Facturación: ${salary.totalBilling.toLocaleString('es-AR')}</div>
                      <div>Comisión ({salary.commissionRate}%): ${salary.commission.toLocaleString('es-AR')}</div>
                      <div>Efectivo: ${salary.cash.toLocaleString('es-AR')}</div>
                      {salary.extras.length > 0 && (
                        <div className="col-span-2 mt-2">
                          <p className="font-medium">Extras:</p>
                          <ul className="list-disc list-inside pl-2">
                            {salary.extras.map((extra, i) => (
                              <li key={i}>
                                {extra.concept}: ${extra.amount.toLocaleString('es-AR')}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end mt-2 space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(salary);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Ver detalle
                      </Button>
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
        )}

        {isViewingDetails && selectedSalary && !isLoading && (
          <div className="py-4">
            {pdfPreview ? (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Vista previa del PDF</h3>
                <AspectRatio ratio={1/1.4} className="bg-white">
                  <iframe 
                    src={pdfPreview} 
                    className="w-full h-full rounded-md border"
                    title="PDF Preview"
                  />
                </AspectRatio>
                <div className="flex justify-end mt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setPdfPreview(null)}
                  >
                    Cerrar vista previa
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-semibold mb-2">{selectedSalary.date}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Card className="border shadow-sm">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total en Efectivo</p>
                      <p className="text-2xl font-bold">${selectedSalary.cash.toLocaleString('es-AR')}</p>
                    </CardContent>
                  </Card>
                  <Card className="border shadow-sm">
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">Total Sueldo</p>
                      <p className="text-2xl font-bold">${selectedSalary.totalSalary.toLocaleString('es-AR')}</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-slate-50 rounded-md p-4 mb-4">
                  <h4 className="font-medium mb-2">Detalles de facturación</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Facturación Total:</span>
                      <span className="font-medium">${selectedSalary.totalBilling.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Comisión ({selectedSalary.commissionRate}%):</span>
                      <span className="font-medium">${selectedSalary.commission.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-md p-4 mb-4">
                  <h4 className="font-medium mb-2">Componentes del sueldo</h4>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Adelanto:</span>
                      <span>${selectedSalary.advance.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Capacitación:</span>
                      <span>${selectedSalary.training.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Vacaciones:</span>
                      <span>${selectedSalary.vacation.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Recepción:</span>
                      <span>${selectedSalary.reception.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">SAC:</span>
                      <span>${selectedSalary.sac.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Recibo:</span>
                      <span>${selectedSalary.receipt.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </div>
                
                {selectedSalary.extras.length > 0 && (
                  <div className="bg-slate-50 rounded-md p-4 mb-4">
                    <h4 className="font-medium mb-2">Extras</h4>
                    <div className="space-y-2">
                      {selectedSalary.extras.map((extra, index) => (
                        <div key={index} className="flex justify-between border-b pb-1">
                          <span className="text-muted-foreground">{extra.concept}:</span>
                          <span>${extra.amount.toLocaleString('es-AR')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="bg-slate-50 rounded-md p-4 mb-4">
                  <h4 className="font-medium mb-2">Totales</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-muted-foreground">Efectivo:</span>
                      <span className="font-semibold">${selectedSalary.cash.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">TOTAL SUELDO:</span>
                      <span className="font-bold text-lg">${selectedSalary.totalSalary.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={handlePreviewPdf}
                    disabled={isGeneratingPdf}
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <FileText className="mr-2 h-4 w-4" />
                    )}
                    Vista previa
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    disabled={isGeneratingPdf}
                  >
                    {isGeneratingPdf ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Exportar PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleEditSalary}
                    className="text-blue-600 hover:text-blue-800 border-blue-600 hover:border-blue-800 hover:bg-blue-50"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeleteSalary}
                    className="text-red-600 hover:text-red-800 border-red-600 hover:border-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {isCalculating && !isLoading && !isViewingDetails && (
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
        )}
        
        {isCalculating && !isLoading && !isViewingDetails && (
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
        )}

        {isCalculating && !isLoading && !isViewingDetails && (
          <div className="bg-muted rounded-md p-3 mt-2">
            <p className="text-sm"><strong>Fórmula Efectivo:</strong> Comisión + SAC - Adelanto - Recibo + Capacitación + Vacaciones + Extras + Recepción</p>
          </div>
        )}

        <DialogFooter className="mt-6 flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          {isCalculating && !isViewingDetails && (
            <>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Guardar Cambios" : "Guardar Cálculo"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
