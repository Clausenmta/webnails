
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ArrowUp, ArrowDown, DollarSign, Users, TrendingUp, FileDown, PlusCircle, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, LineChart, Line } from "recharts";
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

const monthlyData = [
  { month: "Ene", ventas: 42000, gastos: 28000, utilidad: 14000, ventasPrevMes: 39000, gastosPrevMes: 27000 },
  { month: "Feb", ventas: 48000, gastos: 30000, utilidad: 18000, ventasPrevMes: 42000, gastosPrevMes: 28000 },
  { month: "Mar", ventas: 51000, gastos: 31500, utilidad: 19500, ventasPrevMes: 48000, gastosPrevMes: 30000 },
  { month: "Abr", ventas: 47000, gastos: 29000, utilidad: 18000, ventasPrevMes: 51000, gastosPrevMes: 31500 },
  { month: "May", ventas: 53000, gastos: 32000, utilidad: 21000, ventasPrevMes: 47000, gastosPrevMes: 29000 },
  { month: "Jun", ventas: 55000, gastos: 33000, utilidad: 22000, ventasPrevMes: 53000, gastosPrevMes: 32000 },
  { month: "Jul", ventas: 58000, gastos: 34500, utilidad: 23500, ventasPrevMes: 55000, gastosPrevMes: 33000 },
  { month: "Ago", ventas: 56000, gastos: 33800, utilidad: 22200, ventasPrevMes: 58000, gastosPrevMes: 34500 },
  { month: "Sep", ventas: 60000, gastos: 36000, utilidad: 24000, ventasPrevMes: 56000, gastosPrevMes: 33800 },
  { month: "Oct", ventas: 62000, gastos: 37500, utilidad: 24500, ventasPrevMes: 60000, gastosPrevMes: 36000 },
  { month: "Nov", ventas: 59000, gastos: 35400, utilidad: 23600, ventasPrevMes: 62000, gastosPrevMes: 37500 },
  { month: "Dic", ventas: 65000, gastos: 39000, utilidad: 26000, ventasPrevMes: 59000, gastosPrevMes: 35400 },
];

// Servicios de Peluquería vs Servicios de Spa
const serviceData = [
  { servicio: "Peluquería", cantidad: 560, ingresos: 168000, ingresosPrevMes: 152000 },
  { servicio: "Spa", cantidad: 310, ingresos: 148000, ingresosPrevMes: 140000 },
];

const expenseData = [
  { categoria: "Salarios", monto: 118000, montoPrevMes: 112000 },
  { categoria: "Productos", monto: 45000, montoPrevMes: 42000 },
  { categoria: "Servicios", monto: 28000, montoPrevMes: 26500 },
  { categoria: "Alquiler", monto: 35000, montoPrevMes: 35000 },
  { categoria: "Marketing", monto: 15000, montoPrevMes: 18000 },
  { categoria: "Otros", monto: 9000, montoPrevMes: 8800 },
];

// Pagos pendientes
const pendingPayments = [
  { id: 1, proveedor: "Distribuidora OPI", monto: 35000, vencimiento: "15/04/2025", medioPago: "Transferencia" },
  { id: 2, proveedor: "Inmobiliaria Norte", monto: 150000, vencimiento: "10/04/2025", medioPago: "Efectivo" },
  { id: 3, proveedor: "Servicio de Internet", monto: 12500, vencimiento: "20/04/2025", medioPago: "Débito" },
  { id: 4, proveedor: "Proveedor de Insumos", monto: 28000, vencimiento: "25/04/2025", medioPago: "Transferencia" },
];

const availableYears = ["2023", "2024", "2025", "2026"];

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

const sampleInitialExpenses: InitialExpense[] = [
  { 
    id: "1", 
    date: "2025-01-15", 
    description: "Remodelación del local", 
    category: "Remodelación", 
    amount: 120000 
  },
  { 
    id: "2", 
    date: "2025-01-20", 
    description: "Compra de sillones de peluquería", 
    category: "Mobiliario", 
    amount: 85000 
  },
  { 
    id: "3", 
    date: "2025-01-25", 
    description: "Secadores y planchas profesionales", 
    category: "Equipamiento", 
    amount: 45000 
  },
  { 
    id: "4", 
    date: "2025-02-01", 
    description: "Inventario inicial de productos", 
    category: "Inventario inicial", 
    amount: 65000 
  },
  { 
    id: "5", 
    date: "2025-02-05", 
    description: "Depósito y garantía del local", 
    category: "Depósitos y garantías", 
    amount: 90000 
  }
];

export default function ResultadosPage() {
  const [selectedMonth, setSelectedMonth] = useState("Mar");
  const [year, setYear] = useState("2025");
  const [initialExpenses, setInitialExpenses] = useState<InitialExpense[]>(sampleInitialExpenses);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isEditExpenseOpen, setIsEditExpenseOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<InitialExpense | null>(null);
  
  const [newExpense, setNewExpense] = useState<Omit<InitialExpense, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: initialExpenseCategories[0],
    amount: 0
  });

  const currentMonthData = monthlyData.find(data => data.month === selectedMonth) || monthlyData[0];
  
  const revenueGrowth = currentMonthData.ventas > 0 && currentMonthData.ventasPrevMes > 0
    ? ((currentMonthData.ventas - currentMonthData.ventasPrevMes) / currentMonthData.ventasPrevMes * 100).toFixed(1)
    : "0.0";
    
  const profitGrowth = currentMonthData.utilidad > 0 && currentMonthData.ventasPrevMes > 0
    ? ((currentMonthData.utilidad - (currentMonthData.ventasPrevMes - currentMonthData.gastosPrevMes)) / (currentMonthData.ventasPrevMes - currentMonthData.gastosPrevMes) * 100).toFixed(1)
    : "0.0";

  const totalInitialInvestment = initialExpenses.reduce((total, expense) => total + expense.amount, 0);

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
      serviceData: serviceData,
      expenseData: expenseData
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
      serviceData: serviceData,
      expenseData: expenseData
    };
    
    exportReport(reportData, {
      filename: `Informe_Resultados_${selectedMonth}_${year}`,
      format: 'excel'
    });
  };

  const handleAddInitialExpense = () => {
    const expense: InitialExpense = {
      ...newExpense,
      id: Date.now().toString(),
    };
    setInitialExpenses([...initialExpenses, expense]);
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: initialExpenseCategories[0],
      amount: 0
    });
    setIsAddExpenseOpen(false);
    toast.success("Gasto inicial agregado correctamente");
  };

  const handleEditInitialExpense = () => {
    if (!currentExpense) return;
    
    const updatedExpenses = initialExpenses.map(expense => 
      expense.id === currentExpense.id ? currentExpense : expense
    );
    
    setInitialExpenses(updatedExpenses);
    setCurrentExpense(null);
    setIsEditExpenseOpen(false);
    toast.success("Gasto inicial actualizado correctamente");
  };

  const handleDeleteExpense = (id: string) => {
    setInitialExpenses(initialExpenses.filter(expense => expense.id !== id));
    toast.success("Gasto inicial eliminado correctamente");
  };

  const prepareEditExpense = (expense: InitialExpense) => {
    setCurrentExpense(expense);
    setIsEditExpenseOpen(true);
  };

  const initialExpensesByCategory = initialExpenseCategories.map(category => {
    const total = initialExpenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      category,
      amount: total
    };
  }).filter(item => item.amount > 0);

  // Cálculo de porcentajes para servicios
  const totalServices = serviceData.reduce((sum, item) => sum + item.ingresos, 0);
  
  // Cálculo de porcentajes para gastos
  const totalExpenses = expenseData.reduce((sum, item) => sum + item.monto, 0);

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
                {monthlyData.map((data) => (
                  <SelectItem key={data.month} value={data.month}>
                    {data.month}
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$ {currentMonthData.ventas.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {parseFloat(revenueGrowth) >= 0 ? (
                <>
                  <ArrowUp className="mr-1 h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500">{revenueGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="mr-1 h-4 w-4 text-rose-500" />
                  <span className="text-rose-500">{Math.abs(parseFloat(revenueGrowth))}%</span>
                </>
              )}
              <span className="ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos</CardTitle>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$ {currentMonthData.gastos.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {(currentMonthData.gastos / currentMonthData.ventas * 100).toFixed(1)}% del ingreso total
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$ {currentMonthData.utilidad.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {parseFloat(profitGrowth) >= 0 ? (
                <>
                  <ArrowUp className="mr-1 h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500">{profitGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="mr-1 h-4 w-4 text-rose-500" />
                  <span className="text-rose-500">{Math.abs(parseFloat(profitGrowth))}%</span>
                </>
              )}
              <span className="ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUp className="mr-1 h-4 w-4 text-emerald-500" />
              <span className="text-emerald-500">18%</span>
              <span className="ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Ingresos vs Gastos Mensuales</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar name="Ingresos" dataKey="ventas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar name="Gastos" dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tendencia de Utilidad</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    name="Utilidad" 
                    dataKey="utilidad" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Facturación por Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                  <TableHead className="text-right">% del Total</TableHead>
                  <TableHead className="text-right">% vs Mes Anterior</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceData.map((item) => {
                  const percentage = totalServices > 0 
                    ? ((item.ingresos / totalServices) * 100).toFixed(1) 
                    : "0.0";
                  
                  const percentageChange = item.ingresosPrevMes > 0 
                    ? ((item.ingresos - item.ingresosPrevMes) / item.ingresosPrevMes * 100).toFixed(1)
                    : "0.0";
                  
                  return (
                    <TableRow key={item.servicio}>
                      <TableCell>{item.servicio}</TableCell>
                      <TableCell className="text-center">{item.cantidad}</TableCell>
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
                })}
                <TableRow className="font-bold bg-muted/30">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-center">
                    {serviceData.reduce((sum, item) => sum + item.cantidad, 0)}
                  </TableCell>
                  <TableCell className="text-right">
                    $ {totalServices.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">100%</TableCell>
                  <TableCell className="text-right">-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">% del Total</TableHead>
                  <TableHead className="text-right">% vs Mes Anterior</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseData.map((item) => {
                  const percentage = totalExpenses > 0 
                    ? ((item.monto / totalExpenses) * 100).toFixed(1) 
                    : "0.0";
                  
                  const percentageChange = item.montoPrevMes > 0 
                    ? ((item.monto - item.montoPrevMes) / item.montoPrevMes * 100).toFixed(1)
                    : "0.0";
                  
                  return (
                    <TableRow key={item.categoria}>
                      <TableCell>{item.categoria}</TableCell>
                      <TableCell className="text-right">$ {item.monto.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{percentage}%</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          {parseFloat(percentageChange) >= 0 ? (
                            <>
                              <ArrowUp className="mr-1 h-4 w-4 text-rose-500" />
                              <span className="text-rose-500">{percentageChange}%</span>
                            </>
                          ) : (
                            <>
                              <ArrowDown className="mr-1 h-4 w-4 text-emerald-500" />
                              <span className="text-emerald-500">{Math.abs(parseFloat(percentageChange))}%</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="font-bold bg-muted/30">
                  <TableCell>TOTAL</TableCell>
                  <TableCell className="text-right">
                    $ {totalExpenses.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">100%</TableCell>
                  <TableCell className="text-right">-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Pagos Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
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
              {pendingPayments.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.proveedor}</TableCell>
                  <TableCell className="text-right">$ {item.monto.toLocaleString()}</TableCell>
                  <TableCell className="text-center">{item.vencimiento}</TableCell>
                  <TableCell className="text-right">{item.medioPago}</TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-muted/30">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-right">
                  $ {pendingPayments.reduce((sum, item) => sum + item.monto, 0).toLocaleString()}
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
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
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <Card className="shadow-sm border border-slate-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Detalle de Gastos Iniciales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[120px]">Fecha</TableHead>
                            <TableHead className="max-w-[250px]">Descripción</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead className="text-right">% del Total</TableHead>
                            <TableHead className="w-[100px] text-right">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {initialExpenses.map((expense) => {
                            const percentage = totalInitialInvestment > 0 
                              ? ((expense.amount / totalInitialInvestment) * 100).toFixed(1) 
                              : "0.0";
                              
                            return (
                              <TableRow key={expense.id}>
                                <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                <TableCell className="max-w-[250px] truncate">{expense.description}</TableCell>
                                <TableCell>{expense.category}</TableCell>
                                <TableCell className="text-right">$ {expense.amount.toLocaleString()}</TableCell>
                                <TableCell className="text-right">{percentage}%</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => prepareEditExpense(expense)}
                                      className="h-8 w-8"
                                    >
                                      <Pencil className="h-4 w-4 text-slate-600" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleDeleteExpense(expense.id)}
                                      className="h-8 w-8"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
