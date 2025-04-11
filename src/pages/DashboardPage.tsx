
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
  AlertTriangle,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import MonthSelector from "@/components/dashboard/MonthSelector";

export default function DashboardPage() {
  const { user, isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filtrar accesos rápidos según el rol del usuario
  const quickAccessLinks = [
    {
      title: "Gift Cards",
      path: "/gift-cards",
      icon: CreditCard,
      requiredRole: undefined,
    },
    {
      title: "Inventario",
      path: "/stock",
      icon: Package,
      requiredRole: undefined,
    },
    {
      title: "Registrar Gasto",
      path: "/gastos",
      icon: DollarSign,
      requiredRole: undefined,
    },
    {
      title: "Empleados",
      path: "/empleados",
      icon: Users,
      requiredRole: 'superadmin' as const,
    },
  ].filter(link => {
    if (!link.requiredRole) return true;
    if (isSuperAdmin) return true;
    return user?.role === link.requiredRole;
  });

  // Filtrar alertas según el rol del usuario
  const alertItems = [
    {
      icon: AlertTriangle,
      title: "Stock Bajo: Semi OPI Gel Base Coat",
      description: "Quedan 2 unidades en inventario",
      requiredRole: undefined,
    },
    {
      icon: Clock,
      title: "Vencimiento de Gift Card #G0082",
      description: "Vence el 15/04/2025 (5 días)",
      requiredRole: undefined,
    },
    {
      icon: DollarSign,
      title: "Pago de Alquiler Pendiente",
      description: "Vence el 10/04/2025 (mañana)",
      requiredRole: 'superadmin' as const,
    },
    {
      icon: Wrench,
      title: "Arreglo pendiente: Cliente Martínez, Laura",
      description: "Registrado hace 7 días",
      requiredRole: undefined,
    },
  ].filter(alert => {
    if (!alert.requiredRole) return true;
    if (isSuperAdmin) return true;
    return user?.role === alert.requiredRole;
  });

  // Función para cambiar el mes
  const handleMonthChange = (date: Date) => {
    setCurrentDate(date);
    // Aquí se cargarían los datos según el mes seleccionado
    console.log("Mes seleccionado:", date);
  };

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
          <MonthSelector onMonthChange={handleMonthChange} />
          {isSuperAdmin && (
            <Button className="bg-salon-400 hover:bg-salon-500">
              <TrendingUp className="mr-2 h-4 w-4" />
              Generar Reporte
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isSuperAdmin && (
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
        )}
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
            {quickAccessLinks.map((link, index) => (
              <Link to={link.path} key={index}>
                <Button variant="outline" className="w-full justify-between text-left">
                  <div className="flex items-center gap-2">
                    <link.icon className="h-4 w-4 text-salon-500" />
                    <span>{link.title}</span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="dashboard-card md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">
              Alertas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {alertItems.map((alert, index) => (
              <div className="rounded-lg border p-3" key={index}>
                <div className="flex items-center gap-3">
                  <alert.icon className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground">{alert.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
