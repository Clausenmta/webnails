
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
import { useArreglosRevenue } from "@/hooks/useArreglosRevenue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DashboardPage() {
  const { user, isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Use our new hook to get revenue data
  const { 
    monthlyRevenue, 
    previousMonthRevenue, 
    percentageChange,
    pendingArreglos,
    oldPendingArreglos
  } = useArreglosRevenue();
  
  // Consultas para obtener datos reales
  const { data: giftCards = [], isLoading: isLoadingGiftCards } = useQuery({
    queryKey: ['giftCards'],
    queryFn: giftCardService.fetchGiftCards,
  });
  
  const { data: stockItems = [], isLoading: isLoadingStock } = useQuery({
    queryKey: ['stock'],
    queryFn: stockService.fetchStock,
  });
  
  const { data: arreglos = [], isLoading: isLoadingArreglos } = useQuery({
    queryKey: ['arreglos'],
    queryFn: arreglosService.fetchArreglos,
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
  
  const lowStockItems = stockItems.filter(item => 
    item.quantity <= (item.min_stock_level || 5)
  );
  
  const criticalStockItems = lowStockItems.filter(item => 
    item.quantity <= (item.min_stock_level || 5) / 2
  );
  
  const pendingPayments = [
    {
      title: "Pago de Alquiler",
      dueDate: "10/05/2025",
      amount: 150000,
      days: 3
    }
  ]; // Esto podría venir de una tabla de pagos recurrentes en el futuro

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
    
    // Alertas de stock bajo
    if (lowStockItems.length > 0) {
      // Mostrar hasta 3 productos con stock bajo
      const criticalStockToShow = lowStockItems.slice(0, 3);
      
      criticalStockToShow.forEach(item => {
        alerts.push({
          icon: AlertTriangle,
          title: `Stock Bajo: ${item.product_name}`,
          description: `Quedan ${item.quantity} unidades en inventario`,
          variant: "warning",
          requiredRole: undefined,
        });
      });
      
      // Si hay más productos con stock bajo, mostrar un resumen
      if (lowStockItems.length > 3) {
        alerts.push({
          icon: Package,
          title: `${lowStockItems.length - 3} productos más con stock bajo`,
          description: `Revisar en la sección de inventario`,
          variant: "default",
          requiredRole: undefined,
        });
      }
    }
    
    // Alerta de vencimiento de gift card
    if (expiringGiftCards.length > 0) {
      const sortedExpiringCards = [...expiringGiftCards].sort((a, b) => {
        const dateA = new Date(a.expiry_date);
        const dateB = new Date(b.expiry_date);
        return dateA.getTime() - dateB.getTime();
      });
      
      // Mostrar hasta 2 gift cards próximas a vencer
      const cardsToShow = sortedExpiringCards.slice(0, 2);
      
      cardsToShow.forEach(card => {
        const expiryDate = new Date(card.expiry_date);
        const today = new Date();
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        alerts.push({
          icon: Clock,
          title: `Gift Card próxima a vencer: ${card.code}`,
          description: `Vence el ${card.expiry_date} (en ${diffDays} días)`,
          variant: "warning",
          requiredRole: undefined,
        });
      });
      
      // Si hay más gift cards por vencer, mostrar un resumen
      if (expiringGiftCards.length > 2) {
        alerts.push({
          icon: CreditCard,
          title: `${expiringGiftCards.length - 2} gift cards más por vencer`,
          description: `Revisar en la sección de Gift Cards`,
          variant: "default",
          requiredRole: undefined,
        });
      }
    }
    
    // Alerta de pago pendiente (solo para superadmin)
    if (isSuperAdmin && pendingPayments.length > 0) {
      pendingPayments.forEach(payment => {
        alerts.push({
          icon: DollarSign,
          title: `${payment.title} Pendiente`,
          description: `Vence el ${payment.dueDate} (en ${payment.days} días)`,
          variant: "destructive",
          requiredRole: 'superadmin' as const,
        });
      });
    }
    
    // Alerta de arreglos pendientes
    if (pendingArreglos > 0) {
      alerts.push({
        icon: Wrench,
        title: `${pendingArreglos} arreglos pendientes`,
        description: oldPendingArreglos > 0 ? `${oldPendingArreglos} con más de 5 días` : `Todos dentro del plazo normal`,
        variant: oldPendingArreglos > 0 ? "warning" : "default",
        requiredRole: undefined,
      });
    }
    
    // Filtrar alertas según el rol del usuario
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
              <div className="text-2xl font-bold">${monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}% respecto al mes pasado
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
            <div className="text-2xl font-bold">
              {isLoadingGiftCards ? "..." : activeGiftCards.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoadingGiftCards ? "Cargando..." : `${expiringGiftCards.length} próximas a vencer`}
            </p>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Productos Bajo Stock</CardTitle>
            <Package className="h-4 w-4 text-salon-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStock ? "..." : lowStockItems.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoadingStock ? "Cargando..." : `${criticalStockItems.length} críticos para reponer`}
            </p>
          </CardContent>
        </Card>
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Arreglos Pendientes</CardTitle>
            <Wrench className="h-4 w-4 text-salon-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingArreglos ? "..." : pendingArreglos}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoadingArreglos ? "Cargando..." : `${oldPendingArreglos} con más de 5 días`}
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
            {isLoadingGiftCards || isLoadingStock || isLoadingArreglos ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando alertas...
              </div>
            ) : alertItems.length > 0 ? (
              alertItems.map((alert, index) => (
                <Alert key={index} variant={alert.variant as "default" | "destructive"}>
                  <alert.icon className="h-5 w-5 text-amber-500" />
                  <AlertTitle>{alert.title}</AlertTitle>
                  <AlertDescription>{alert.description}</AlertDescription>
                </Alert>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay alertas para mostrar
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
