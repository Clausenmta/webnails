
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, ArrowUp, ArrowDown, DollarSign, Users, TrendingUp } from "lucide-react";
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

// Sample monthly data for the charts
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

// Sample service data
const serviceData = [
  { servicio: "Corte de cabello", cantidad: 320, ingresos: 96000 },
  { servicio: "Tinte", cantidad: 180, ingresos: 108000 },
  { servicio: "Peinado", cantidad: 210, ingresos: 84000 },
  { servicio: "Manicura", cantidad: 150, ingresos: 60000 },
  { servicio: "Tratamiento facial", cantidad: 90, ingresos: 72000 },
  { servicio: "Masajes", cantidad: 70, ingresos: 56000 },
];

// Sample expense categories
const expenseData = [
  { categoria: "Salarios", monto: 118000 },
  { categoria: "Productos", monto: 45000 },
  { categoria: "Servicios", monto: 28000 },
  { categoria: "Alquiler", monto: 35000 },
  { categoria: "Marketing", monto: 15000 },
  { categoria: "Otros", monto: 9000 },
];

export default function ResultadosPage() {
  const [selectedMonth, setSelectedMonth] = useState("Sep");
  const [year, setYear] = useState("2023");

  // Find the selected month data
  const currentMonthData = monthlyData.find(data => data.month === selectedMonth) || monthlyData[0];
  
  // Calculate percentages for current month
  const revenueGrowth = 8.2; // Sample growth percentage
  const profitGrowth = 12.5; // Sample growth percentage

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resultados Mensuales</h2>
          <p className="text-muted-foreground">
            Visualiza los resultados financieros del negocio
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="month">Mes</Label>
            <select 
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {monthlyData.map((data) => (
                <option key={data.month} value={data.month}>{data.month}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="year">Año</Label>
            <Input 
              id="year" 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
              className="w-24"
            />
          </div>
          <Button className="mt-auto bg-salon-400 hover:bg-salon-500">
            <Download className="mr-2 h-4 w-4" />
            Exportar Informe
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
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

      {/* Charts */}
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

      {/* Tables */}
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
    </div>
  );
}
