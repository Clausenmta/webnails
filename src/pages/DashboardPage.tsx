
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  CreditCard, 
  DollarSign, 
  Package, 
  Users, 
  Wrench,
  TrendingUp,
  ArrowRight,
  Calendar,
  Clock,
  AlertTriangle
} from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visualiza los indicadores clave de tu negocio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Abril 2025
          </Button>
          <Button className="bg-salon-400 hover:bg-salon-500">
            <TrendingUp className="mr-2 h-4 w-4" />
            Generar Reporte
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Facturación Mensual</CardTitle>
            <DollarSign className="h-4 w-4 text-salon-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$487,650</div>
            <p className="text-xs text-muted-foreground">
              +12.5% respecto al mes pasado
            </p>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Gift Cards Activas</CardTitle>
            <CreditCard className="h-4 w-4 text-salon-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
            <p className="text-xs text-muted-foreground">
              8 próximas a vencer
            </p>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Productos Bajo Stock</CardTitle>
            <Package className="h-4 w-4 text-salon-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              5 críticos para reponer
            </p>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Arreglos Pendientes</CardTitle>
            <Wrench className="h-4 w-4 text-salon-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 con más de 5 días
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="dashboard-card md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Accesos Rápidos
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Link to="/gift-cards">
              <Button variant="outline" className="w-full justify-between text-left">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-salon-500" />
                  <span>Gift Cards</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/stock">
              <Button variant="outline" className="w-full justify-between text-left">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-salon-500" />
                  <span>Inventario</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/gastos">
              <Button variant="outline" className="w-full justify-between text-left">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-salon-500" />
                  <span>Registrar Gasto</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/empleados">
              <Button variant="outline" className="w-full justify-between text-left">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-salon-500" />
                  <span>Empleados</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="dashboard-card md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Alertas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Stock Bajo: Semi OPI Gel Base Coat</p>
                  <p className="text-xs text-muted-foreground">Quedan 2 unidades en inventario</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Vencimiento de Gift Card #G0082</p>
                  <p className="text-xs text-muted-foreground">Vence el 15/04/2025 (5 días)</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Pago de Alquiler Pendiente</p>
                  <p className="text-xs text-muted-foreground">Vence el 10/04/2025 (mañana)</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Wrench className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Arreglo pendiente: Cliente Martínez, Laura</p>
                  <p className="text-xs text-muted-foreground">Registrado hace 7 días</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
