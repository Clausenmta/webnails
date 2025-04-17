
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
  Clock,
  Download
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import MonthSelector from "@/components/dashboard/MonthSelector";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { giftCardService } from "@/services/giftCardService";
import { arreglosService } from "@/services/arreglosService";
import { stockService } from "@/services/stock";

export default function DashboardPage() {
  const { user, isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Consultas para obtener datos reales
  const { data: giftCards = [] } = useQuery({
    queryKey: ['giftCards'],
    queryFn: giftCardService.fetchGiftCards,
  });
  
  const { data: arreglos = [] } = useQuery({
    queryKey: ['arreglos'],
    queryFn: arreglosService.fetchArreglos,
  });
  
  const { data: stockItems = [] } = useQuery({
    queryKey: ['stock'],
    queryFn: stockService.fetchStock,
  });

  // Calcular estadísticas basadas en datos reales
  const activeGiftCards = giftCards.filter(card => card.status === 'active');
  const expiringGiftCards = activeGiftCards.filter(card => {
    const expiryDate = new Date(card.expiry_date);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0; // Próximas a vencer en 30 días
  });
  
  const pendingArreglos = arreglos.filter(arreglo => arreglo.status === 'pendiente');
  const oldPendingArreglos = pendingArreglos.filter(arreglo => {
    const arregloDate = new Date(arreglo.date);
    const today = new Date();
    const diffTime = today.getTime() - arregloDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 5;
  });
  
  const lowStockItems = stockItems.filter(item => 
    item.quantity < (item.min_stock_level || 10)
  );
  const criticalStockItems = lowStockItems.filter(item => 
    item.quantity <= (item.min_stock_level || 10) / 2
  );

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
    if (!link.requiredRole) return true; // Si no hay rol requerido, mostrar a todos
    if (isSuperAdmin) return true; // Superadmin puede ver todo
    return user?.role === link.requiredRole; // Verificar si el rol del usuario coincide con el requerido
  });

  // Generar alertas dinámicas basadas en los datos reales
  const generateAlerts = () => {
    const alerts = [];
    
    // Alerta de stock bajo
    if (lowStockItems.length > 0) {
      const criticalItem = lowStockItems[0];
      alerts.push({
        icon: AlertTriangle,
        title: `Stock Bajo: ${criticalItem.product_name}`,
        description: `Quedan ${criticalItem.quantity} unidades en inventario`,
        requiredRole: undefined,
      });
    }
    
    // Alerta de vencimiento de gift card
    if (expiringGiftCards.length > 0) {
      const nextExpiringCard = expiringGiftCards[0];
      const expiryDate = new Date(nextExpiringCard.expiry_date);
      const today = new Date();
      const diffTime = expiryDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      alerts.push({
        icon: Clock,
        title: `Vencimiento de Gift Card #${nextExpiringCard.code}`,
        description: `Vence el ${nextExpiringCard.expiry_date} (${diffDays} días)`,
        requiredRole: undefined,
      });
    }
    
    // Alerta de pago pendiente (simulada para superadmin)
    if (isSuperAdmin) {
      alerts.push({
        icon: DollarSign,
        title: "Pago de Alquiler Pendiente",
        description: "Vence el 10/05/2025 (en 3 días)",
        requiredRole: 'superadmin' as const,
      });
    }
    
    // Alerta de arreglo pendiente
    if (pendingArreglos.length > 0) {
      const oldestArreglo = pendingArreglos[0];
      alerts.push({
        icon: Wrench,
        title: `Arreglo pendiente: Cliente ${oldestArreglo.client_name}`,
        description: `Registrado hace 7 días`,
        requiredRole: undefined,
      });
    }
    
    return alerts.filter(alert => {
      if (!alert.requiredRole) return true;
      if (isSuperAdmin) return true;
      return user?.role === alert.requiredRole;
    });
  };
  
  const alertItems = generateAlerts();

  // Función para cambiar el mes
  const handleMonthChange = (date: Date) => {
    setCurrentDate(date);
    // Aquí se cargarían los datos según el mes seleccionado
    console.log("Mes seleccionado:", date);
  };

  // Función para generar reporte
  const handleGenerateReport = () => {
    toast.success("Reporte generado correctamente");
    
    // Simulación de descarga de archivo
    const dummyContent = "Reporte del Dashboard - " + currentDate.toLocaleDateString();
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Dashboard_${currentDate.toLocaleDateString().replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
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
            <Button className="bg-salon-400 hover:bg-salon-500" onClick={handleGenerateReport}>
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
            <div className="text-2xl font-bold">{activeGiftCards.length}</div>
            <p className="text-xs text-muted-foreground">
              {expiringGiftCards.length} próximas a vencer
            </p>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Productos Bajo Stock</CardTitle>
            <Package className="h-4 w-4 text-salon-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {criticalStockItems.length} críticos para reponer
            </p>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Arreglos Pendientes</CardTitle>
            <Wrench className="h-4 w-4 text-salon-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingArreglos.length}</div>
            <p className="text-xs text-muted-foreground">
              {oldPendingArreglos.length} con más de 5 días
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
