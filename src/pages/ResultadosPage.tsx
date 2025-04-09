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

const monthlyData = [
  { month: "Ene", ventas: 42000, gastos: 28000, utilidad: 14000 },
  { month: "Feb", ventas: 48000, gastos: 30000, utilidad: 18000 },
  { month: "Mar", ventas: 51000, gastos: 31500, utilidad: 19500 },
  { month: "Abr", ventas: 47000, gastos: 29000, utilidad: 18000 },
  { month: "May", ventas: 53000, gastos: 32000, utilidad: 21000 },
  { month: "Jun", ventas: 55000, gastos: 33000, utilidad: 22000 },
  { month: "Jul", ventas: 58000, gastos: 34500, utilidad: 23500 },
  { month: "Ago", ventas: 56000, gastos: 33800, utilidad: 22200 },
  { month: "Sep", ventas: 60000, gastos: 36000, utilidad: 24000 },
  { month: "Oct", ventas: 62000, gastos: 37500, utilidad: 24500 },
  { month: "Nov", ventas: 59000, gastos: 35400, utilidad: 23600 },
  { month: "Dic", ventas: 65000, gastos: 39000, utilidad: 26000 },
];

const serviceData = [
  { servicio: "Corte de cabello", cantidad: 320, ingresos: 96000 },
  { servicio: "Tinte", cantidad: 180, ingresos: 108000 },
  { servicio: "Peinado", cantidad: 210, ingresos: 84000 },
  { servicio: "Manicura", cantidad: 150, ingresos: 60000 },
  { servicio: "Tratamiento facial", cantidad: 90, ingresos: 72000 },
  { servicio: "Masajes", cantidad: 70, ingresos: 56000 },
];

const expenseData = [
  { categoria: "Salarios", monto: 118000 },
  { categoria: "Productos", monto: 45000 },
  { categoria: "Servicios", monto: 28000 },
  { categoria: "Alquiler", monto: 35000 },
  { categoria: "Marketing", monto: 15000 },
  { categoria: "Otros", monto: 9000 },
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
  
  const revenueGrowth = 8.2;
  const profitGrowth = 12.5;

  const totalInitialInvestment = initialExpenses.reduce((total, expense) => total + expense.amount, 0);

  const calculateROI = () => {
    const annualProfit = monthlyData.reduce((total, data) => total + data.utilidad, 0);
    if (totalInitialInvestment === 0) return 0;
    return (annualProfit / totalInitialInvestment) * 100;
  };

  const handleExportPDF = () => {
    toast.success("Informe exportado a PDF correctamente");
    console.log("Exportando a PDF para mes:", selectedMonth, "año:", year);
  };

  const handleExportExcel = () => {
    toast.success("Informe exportado a Excel correctamente");
    console.log("Exportando a Excel para mes:", selectedMonth, "año:", year);
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
              {revenueGrowth >= 0 ? (
                <>
                  <ArrowUp className="mr-1 h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500">{revenueGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="mr-1 h-4 w-4 text-rose-500" />
                  <span className="text-rose-500">{Math.abs(revenueGrowth)}%</span>
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
              {profitGrowth >= 0 ? (
                <>
                  <ArrowUp className="mr-1 h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500">{profitGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDown className="mr-1 h-4 w-4 text-rose-500" />
                  <span className="text-rose-500">{Math.abs(profitGrowth)}%</span>
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
            <CardTitle>Ingresos por Servicio</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servicio</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceData.map((item) => (
                  <TableRow key={item.servicio}>
                    <TableCell>{item.servicio}</TableCell>
                    <TableCell className="text-center">{item.cantidad}</TableCell>
                    <TableCell className="text-right">$ {item.ingresos.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
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
                  <TableHead className="text-right">Porcentaje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseData.map((item) => {
                  const totalExpenses = expenseData.reduce((total, exp) => total + exp.monto, 0);
                  const percentage = (item.monto / totalExpenses * 100).toFixed(1);
                  
                  return (
                    <TableRow key={item.categoria}>
                      <TableCell>{item.categoria}</TableCell>
                      <TableCell className="text-right">$ {item.monto.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{percentage}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

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

                <Card className="shadow-sm border border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-xl">Distribución de la Inversión Inicial</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    <ChartContainer config={{}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={initialExpensesByCategory} 
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                        >
                          <XAxis type="number" />
                          <YAxis 
                            dataKey="category" 
                            type="category" 
                            tick={{ fill: '#666' }}
                            width={80}
                          />
                          <Tooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar 
                            name="Monto" 
                            dataKey="amount" 
                            fill="#9b87f5" 
                            radius={[0, 4, 4, 0]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

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
                          <TableHead className="w-[100px] text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {initialExpenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                            <TableCell className="max-w-[250px] truncate">{expense.description}</TableCell>
                            <TableCell>{expense.category}</TableCell>
                            <TableCell className="text-right">$ {expense.amount.toLocaleString()}</TableCell>
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
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
