import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Download, 
  ArrowUp, 
  ArrowDown, 
  FileDown, 
  PlusCircle, 
  Pencil, 
  Trash2,
  Loader2
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { exportReport } from "@/utils/reportExport";
import { format } from "date-fns";
import { initialExpensesService } from "@/services/initialExpensesService";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRevenueData } from "@/hooks/useRevenueData";
import { expenseService } from "@/services/expenseService";
import { stockService } from "@/services/stockService";
import { ExpensesByCategory } from "@/components/revenue/ExpensesByCategory";
import { MonthlyResult } from "@/components/revenue/MonthlyResult";

const initialExpenseCategories = [
  "Remodelación",
  "Mobiliario",
  "Equipamiento",
  "Licencias",
  "Inventario inicial",
  "Marketing inicial",
  "Depósitos y garantías",
  "Otros"
];

interface InitialExpense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

interface ExpensePayload {
  date: string;
  description: string;
  category: string;
  amount: number;
}

interface UpdateExpensePayload {
  id: string;
  expense: ExpensePayload;
}

export default function ResultadosPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentMonth = new Date().getMonth();
    const monthAbbreviations = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return monthAbbreviations[currentMonth];
  });
  
  const [year, setYear] = useState(() => new Date().getFullYear().toString());
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<InitialExpense | null>(null);
  
  const {
    serviceData,
    totalServices,
    pendingPayments,
    isLoading
  } = useRevenueData(selectedMonth, year);

  const [newExpense, setNewExpense] = useState<Omit<InitialExpense, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: initialExpenseCategories[0],
    amount: 0
  });

  const queryClient = useQueryClient();

  const addExpenseMutation = useMutation<any, Error, ExpensePayload>({
    mutationFn: (expense) => initialExpensesService.addInitialExpense(expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initial_expenses'] });
      toast.success("Gasto inicial agregado correctamente");
      setIsAddExpenseOpen(false);
      setNewExpense({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: initialExpenseCategories[0],
        amount: 0
      });
    },
    onError: (error) => toast.error("Error al agregar gasto inicial: " + error.message)
  });

  const updateExpenseMutation = useMutation<any, Error, UpdateExpensePayload>({
    mutationFn: ({ id, expense }) => initialExpensesService.updateInitialExpense(id, expense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initial_expenses'] });
      setIsEditExpenseOpen(false);
      setCurrentExpense(null);
      toast.success("Gasto inicial actualizado correctamente");
    },
    onError: (error) => toast.error("Error al actualizar gasto: " + error.message)
  });

  const deleteExpenseMutation = useMutation<any, Error, string>({
    mutationFn: (id) => initialExpensesService.deleteInitialExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['initial_expenses'] });
      toast.success("Gasto inicial eliminado correctamente");
    },
    onError: (error) => toast.error("Error al eliminar gasto: " + error.message)
  });

  const handleAddInitialExpense = () => {
    addExpenseMutation.mutate({
      date: newExpense.date,
      description: newExpense.description,
      category: newExpense.category,
      amount: newExpense.amount,
    });
  };

  const handleEditInitialExpense = () => {
    if (!currentExpense || !currentExpense.id) return;
    updateExpenseMutation.mutate({ 
      id: currentExpense.id, 
      expense: {
        date: currentExpense.date,
        description: currentExpense.description,
        category: currentExpense.category,
        amount: currentExpense.amount,
      }
    });
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpenseMutation.mutate(id);
  };

  const prepareEditExpense = (expense: InitialExpense) => {
    setCurrentExpense(expense);
    setIsEditExpenseOpen(true);
  };

  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [serviceDataState, setServiceData] = useState<any[]>([]);
  const [expenseDataByCategory, setExpenseDataByCategory] = useState<any[]>([]);
  const [pendingPaymentsState, setPendingPayments] = useState<any[]>([]);
  
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: expenseService.fetchExpenses
  });
  
  const { data: stockItems = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: stockService.fetchStock
  });

  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);

  const { data: initialExpenses = [], isLoading: isFetchingInitialExpenses } = useQuery({
    queryKey: ['initial_expenses'],
    queryFn: initialExpensesService.fetchInitialExpenses
  });

  useEffect(() => {
    if (expenses.length > 0) {
      processExpensesData();
    }
  }, [expenses, selectedMonth, year]);

  const processExpensesData = () => {
    const monthAbbreviations = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    
    const tempMonthlyData = monthAbbreviations.map((month, index) => {
      return {
        month,
        ventas: 0,
        gastos: 0,
        utilidad: 0,
        ventasPrevMes: 0,
        gastosPrevMes: 0
      };
    });

    const expensesByMonth: Record<string, number> = {};
    const currentYear = parseInt(year);
    
    expenses.forEach(expense => {
      try {
        const dateParts = expense.date.split('/');
        if (dateParts.length === 3) {
          const month = parseInt(dateParts[1]) - 1;
          const expenseYear = parseInt(dateParts[2]);
          
          if (expenseYear === currentYear && month >= 0 && month < 12) {
            expensesByMonth[month] = (expensesByMonth[month] || 0) + expense.amount;
          }
        }
      } catch (error) {
        console.error('Error parsing date:', expense.date);
      }
    });

    const simulatedSalesByMonth: Record<string, number> = {};
    for (let i = 0; i < 12; i++) {
      simulatedSalesByMonth[i] = (expensesByMonth[i] || 0) * 1.5 + Math.random() * 10000;
    }

    for (let i = 0; i < 12; i++) {
      const ventas = simulatedSalesByMonth[i] || 0;
      const gastos = expensesByMonth[i] || 0;
      const utilidad = ventas - gastos;
      
      const ventasPrevMes = i > 0 ? (simulatedSalesByMonth[i - 1] || 0) : 0;
      const gastosPrevMes = i > 0 ? (expensesByMonth[i - 1] || 0) : 0;
      
      tempMonthlyData[i] = {
        month: monthAbbreviations[i],
        ventas: Math.round(ventas),
        gastos: Math.round(gastos),
        utilidad: Math.round(utilidad),
        ventasPrevMes: Math.round(ventasPrevMes),
        gastosPrevMes: Math.round(gastosPrevMes)
      };
    }
    
    setMonthlyData(tempMonthlyData);

    const categoryTotals: Record<string, { monto: number, montoPrevMes: number }> = {};
    
    const currentMonthIndex = monthAbbreviations.indexOf(selectedMonth);
    const prevMonthIndex = currentMonthIndex > 0 ? currentMonthIndex - 1 : 11;
    
    expenses.forEach(expense => {
      try {
        const dateParts = expense.date.split('/');
        if (dateParts.length === 3) {
          const month = parseInt(dateParts[1]) - 1;
          const expenseYear = parseInt(dateParts[2]);
          
          if (expenseYear === currentYear) {
            if (!categoryTotals[expense.category]) {
              categoryTotals[expense.category] = { monto: 0, montoPrevMes: 0 };
            }
            
            if (month === currentMonthIndex) {
              categoryTotals[expense.category].monto += expense.amount;
            } else if (month === prevMonthIndex) {
              categoryTotals[expense.category].montoPrevMes += expense.amount;
            }
          }
        }
      } catch (error) {
        console.error('Error processing expense category data:', error);
      }
    });
    
    const expenseCategoryData = Object.entries(categoryTotals).map(([categoria, values]) => ({
      categoria,
      monto: values.monto,
      montoPrevMes: values.montoPrevMes
    }));
    
    setExpenseDataByCategory(expenseCategoryData);

    const today = new Date();
    const pendingExpenses = expenses.filter(expense => {
      if (expense.status === 'pending' && expense.due_date) {
        try {
          const dateParts = expense.due_date.split('/');
          if (dateParts.length === 3) {
            const dueDate = new Date(
              parseInt(dateParts[2]),
              parseInt(dateParts[1]) - 1,
              parseInt(dateParts[0])
            );
            return dueDate > today;
          }
        } catch (error) {
          console.error('Error parsing due date:', expense.due_date);
        }
      }
      return false;
    })
    .map((expense, index) => ({
      id: expense.id,
      proveedor: expense.provider || 'Desconocido',
      monto: expense.amount,
      vencimiento: expense.due_date || '',
      medioPago: expense.payment_method || 'Desconocido'
    }))
    .slice(0, 5);

    setPendingPayments(pendingExpenses);

    const tempServiceData = [
      { 
        servicio: "Peluquería", 
        cantidad: Math.round(Math.random() * 300 + 300), 
        ingresos: Math.round(simulatedSalesByMonth[currentMonthIndex] * 0.6), 
        ingresosPrevMes: Math.round(simulatedSalesByMonth[prevMonthIndex] * 0.6)
      },
      { 
        servicio: "Spa", 
        cantidad: Math.round(Math.random() * 200 + 100), 
        ingresos: Math.round(simulatedSalesByMonth[currentMonthIndex] * 0.4), 
        ingresosPrevMes: Math.round(simulatedSalesByMonth[prevMonthIndex] * 0.4)
      },
    ];
    
    setServiceData(tempServiceData);
  };

  const totalServicesState = serviceDataState.reduce((sum, item) => sum + item.ingresos, 0);
  const totalExpenses = expenseDataByCategory.reduce((sum, item) => sum + item.monto, 0);

  const currentMonthData = monthlyData.find(data => data.month === selectedMonth) || {
    month: selectedMonth,
    ventas: 0,
    gastos: 0,
    utilidad: 0,
    ventasPrevMes: 0,
    gastosPrevMes: 0
  };
  
  const revenueGrowth = currentMonthData.ventas > 0 && currentMonthData.ventasPrevMes > 0
    ? ((currentMonthData.ventas - currentMonthData.ventasPrevMes) / currentMonthData.ventasPrevMes * 100).toFixed(1)
    : "0.0";
    
  const profitGrowth = currentMonthData.utilidad > 0 && currentMonthData.ventasPrevMes > 0
    ? ((currentMonthData.utilidad - (currentMonthData.ventasPrevMes - currentMonthData.gastosPrevMes)) / (currentMonthData.ventasPrevMes - currentMonthData.gastosPrevMes) * 100).toFixed(1)
    : "0.0";

  const totalInitialInvestment = initialExpenses.reduce((total, expense) => total + Number(expense.amount), 0);

  const initialExpensesByCategory = initialExpenseCategories.map(category => {
    const total = initialExpenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    return {
      category,
      amount: total
    };
  }).filter(item => item.amount > 0);

  const calculateROI = () => {
    const annualProfit = monthlyData.reduce((total, data) => total + data.utilidad, 0);
    if (totalInitialInvestment === 0) return 0;
    return (annualProfit / totalInitialInvestment) * 100;
  };

  const handleExportPDF = () => {
    const reportData = {
      title: `Informe de Resultados - ${selectedMonth} ${year}`,
      totalVentas: currentMonthData.ventas,
      totalGastos: currentMonthData.gastos,
      utilidad: currentMonthData.utilidad,
      revenueGrowth: revenueGrowth,
      profitGrowth: profitGrowth,
      serviceData: serviceDataState,
      expenseData: expenseDataByCategory
    };
    
    exportReport(reportData, {
      filename: `Informe_Resultados_${selectedMonth}_${year}`,
      format: 'pdf'
    });
  };

  const handleExportExcel = () => {
    const reportData = {
      title: `Informe de Resultados - ${selectedMonth} ${year}`,
      totalVentas: currentMonthData.ventas,
      totalGastos: currentMonthData.gastos,
      utilidad: currentMonthData.utilidad,
      revenueGrowth: revenueGrowth,
      profitGrowth: profitGrowth,
      serviceData: serviceDataState,
      expenseData: expenseDataByCategory
    };
    
    exportReport(reportData, {
      filename: `Informe_Resultados_${selectedMonth}_${year}`,
      format: 'excel'
    });
  };

  const availableYears = [
    (new Date().getFullYear() - 2).toString(),
    (new Date().getFullYear() - 1).toString(), 
    new Date().getFullYear().toString(),
    (new Date().getFullYear() + 1).toString()
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resultados Mensuales</h2>
          <p className="text-muted-foreground">
            Visualiza los resultados financieros del negocio
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="month">Mes</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                {["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"].map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="year">Año</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Seleccionar año" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((yr) => (
                  <SelectItem key={yr} value={yr}>
                    {yr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="mt-auto bg-salon-400 hover:bg-salon-500">
                <Download className="mr-2 h-4 w-4" />
                Exportar Informe
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar a PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar a Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Facturación por Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Servicio</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
                    <TableHead className="text-right">% del Total</TableHead>
                    <TableHead className="text-right">% vs Mes Anterior</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceData.length > 0 ? (
                    serviceData.map((item) => {
                      const percentage = totalServices > 0 
                        ? ((item.ingresos / totalServices) * 100).toFixed(1) 
                        : "0.0";
                      
                      const percentageChange = item.ingresosPrevMes > 0 
                        ? ((item.ingresos - item.ingresosPrevMes) / item.ingresosPrevMes * 100).toFixed(1)
                        : "0.0";
                      
                      return (
                        <TableRow key={item.servicio}>
                          <TableCell>{item.servicio}</TableCell>
                          <TableCell className="text-right">$ {item.ingresos.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{percentage}%</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end">
                              {parseFloat(percentageChange) >= 0 ? (
                                <>
                                  <ArrowUp className="mr-1 h-4 w-4 text-emerald-500" />
                                  <span className="text-emerald-500">{percentageChange}%</span>
                                </>
                              ) : (
                                <>
                                  <ArrowDown className="mr-1 h-4 w-4 text-rose-500" />
                                  <span className="text-rose-500">{Math.abs(parseFloat(percentageChange))}%</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No hay datos de ingresos para el periodo seleccionado
                      </TableCell>
                    </TableRow>
                  )}
                  {serviceData.length > 0 && (
                    <TableRow className="font-bold bg-muted/30">
                      <TableCell>TOTAL</TableCell>
                      <TableCell className="text-right">
                        $ {totalServices.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">100%</TableCell>
                      <TableCell className="text-right">-</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <ExpensesByCategory expenseDataByCategory={expenseDataByCategory} isLoading={isLoadingExpenses} />

        {/* New Monthly Result Panel */}
        <MonthlyResult
          totalRevenue={totalServices}
          totalExpenses={totalExpenses}
          prevMonthRevenue={serviceData.reduce((sum, item) => sum + item.ingresosPrevMes, 0)}
          prevMonthExpenses={expenseDataByCategory.reduce((sum, item) => sum + item.montoPrevMes, 0)}
          isLoading={isLoading || isLoadingExpenses}
        />

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Pagos Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proveedor</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-center">Vencimiento</TableHead>
                    <TableHead className="text-right">Medio de Pago</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.length > 0 ? (
                    pendingPayments.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.proveedor}</TableCell>
                        <TableCell className="text-right">$ {item.monto.toLocaleString()}</TableCell>
                        <TableCell className="text-center">{item.vencimiento}</TableCell>
                        <TableCell className="text-right">{item.medioPago}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No hay pagos pendientes registrados
                      </TableCell>
                    </TableRow>
                  )}
                  {pendingPayments.length > 0 && (
                    <TableRow className="font-bold bg-muted/30">
                      <TableCell>TOTAL</TableCell>
                      <TableCell className="text-right">
                        $ {pendingPayments.reduce((sum, item) => sum + item.monto, 0).toLocaleString()}
                      </TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-xl font-bold">
                Inversión Inicial y ROI
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">
                        Inversión inicial total: ${totalInitialInvestment.toLocaleString()}
                      </h3>
                      <p className="text-muted-foreground">
                        Desglose de los gastos para la puesta en marcha del negocio
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-end">
                      <Card className="w-full sm:w-60 shadow-sm border border-slate-200">
                        <CardHeader className="pb-2 pt-4">
                          <CardTitle className="text-base font-medium">ROI Estimado</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-[#9b87f5]">{calculateROI().toFixed(2)}%</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Retorno sobre la inversión inicial
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                        <DialogTrigger asChild>
                          <Button className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white h-10 px-4 py-2 rounded-md flex items-center gap-2 ml-auto mt-1 md:mt-4">
                            <PlusCircle className="h-4 w-4" />
                            Agregar Gasto Inicial
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Agregar Gasto Inicial</DialogTitle>
                            <DialogDescription>
                              Ingrese los detalles del gasto inicial para el montaje del negocio.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="expense-date">Fecha</Label>
                              <Input
                                id="expense-date"
                                type="date"
                                value={newExpense.date}
                                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="expense-description">Descripción</Label>
                              <Input
                                id="expense-description"
                                placeholder="Ej: Remodelación del local"
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="expense-category">Categoría</Label>
                              <Select 
                                value={newExpense.category} 
                                onValueChange={(value) => setNewExpense({...newExpense, category: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                  {initialExpenseCategories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="expense-amount">Monto ($)</Label>
                              <Input
                                id="expense-amount"
                                type="number"
                                min="0"
                                step="100"
                                value={newExpense.amount.toString()}
                                onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
                              Cancelar
                            </Button>
                            <Button 
                              onClick={handleAddInitialExpense}
                              disabled={!newExpense.description || newExpense.amount <= 0}
                              className="bg-[#9b87f5] hover:bg-[#7E69AB]"
                            >
                              Guardar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isEditExpenseOpen} onOpenChange={setIsEditExpenseOpen}>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Gasto Inicial</DialogTitle>
                            <DialogDescription>
                              Modifique los detalles del gasto inicial.
                            </DialogDescription>
                          </DialogHeader>
                          {currentExpense && (
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-expense-date">Fecha</Label>
                                <Input
                                  id="edit-expense-date"
                                  type="date"
                                  value={currentExpense.date}
                                  onChange={(e) => setCurrentExpense({...currentExpense, date: e.target.value})}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-expense-description">Descripción</Label>
                                <Input
                                  id="edit-expense-description"
                                  placeholder="Ej: Remodelación del local"
                                  value={currentExpense.description}
                                  onChange={(e) => setCurrentExpense({...currentExpense, description: e.target.value})}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-expense-category">Categoría</Label>
                                <Select 
                                  value={currentExpense.category} 
                                  onValueChange={(value) => setCurrentExpense({...currentExpense, category: value})}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar categoría" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {initialExpenseCategories.map((category) => (
                                      <SelectItem key={category} value={category}>
                                        {category}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-expense-amount">Monto ($)</Label>
                                <Input
                                  id="edit-expense-amount"
                                  type="number"
                                  min="0"
                                  step="100"
                                  value={currentExpense.amount.toString()}
                                  onChange={(e) => setCurrentExpense({...currentExpense, amount: Number(e.target.value)})}
                                />
                              </div>
                            </div>
                          )}
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditExpenseOpen(false)}>
                              Cancelar
                            </Button>
                            <Button 
                              onClick={handleEditInitialExpense}
                              disabled={!currentExpense?.description || (currentExpense?.amount || 0) <= 0}
                              className="bg-[#9b87f5] hover:bg-[#7E69AB]"
                            >
                              Actualizar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      <Card className="w-full sm:w-60 shadow-sm border border-slate-200">
                        <CardHeader className="pb-2">
                          <CardTitle>Desglose de Gastos Iniciales</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Categoría</TableHead>
                                <TableHead className="text-right">Monto</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {initialExpensesByCategory.map((item) => (
                                <TableRow key={item.category}>
                                  <TableCell>{item.category}</TableCell>
                                  <TableCell className="text-right">
                                    $ {item.amount.toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
