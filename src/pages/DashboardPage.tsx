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
  Calendar,
  CalendarDays,
  ShoppingBag,
  House
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
import { revenueService } from "@/services/revenueService";
import { expenseService } from "@/services/expenseService";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  // Consulta para obtener pagos pendientes reales
  const { data: pendingPaymentsData = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ['pendingPayments'],
    queryFn: revenueService.fetchPendingPayments,
    enabled: isSuperAdmin, // Solo cargar para superadmin
  });
  
  // Consulta para obtener gastos con vencimiento (alquiler, servicios, etc.)
  const { data: expenses = [], isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: expenseService.fetchExpenses,
    enabled: isSuperAdmin, // Solo cargar para superadmin
  });

  // Calcular estadísticas basadas en datos reales
  const activeGiftCards = giftCards.filter(card => card.status === 'active');
  
  // Obtener gift cards que vencen en los próximos 30 días
  const expiringGiftCards = activeGiftCards.filter(card => {
    try {
      const expiryDate = new Date(card.expiry_date);
      const today = new Date();
      const diffDays = differenceInDays(expiryDate, today);
      return diffDays <= 30 && diffDays > 0; // Próximas a vencer en 30 días
    } catch (e) {
      console.error("Error al procesar fecha de vencimiento de gift card:", e);
      return false;
    }
  });
  
  // Ordenar gift cards por fecha de vencimiento (primero las que vencen antes)
  const sortedExpiringCards = [...expiringGiftCards].sort((a, b) => {
    const dateA = new Date(a.expiry_date);
    const dateB = new Date(b.expiry_date);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Encontrar productos con stock bajo
  const lowStockItems = stockItems.filter(item => 
    item.quantity <= (item.min_stock_level || 5)
  );
  
  // Encontrar productos con stock crítico (menos de la mitad del nivel mínimo)
  const criticalStockItems = lowStockItems.filter(item => 
    item.quantity <= (item.min_stock_level || 5) / 2
  );
  
  // Procesar pagos pendientes reales de la base de datos
  const upcomingExpenses = expenses
    .filter(expense => {
      if (!expense.due_date || expense.status === 'paid') return false;
      
      try {
        // Parsear la fecha DD/MM/YYYY
        const [day, month, year] = expense.due_date.split('/').map(Number);
        const dueDate = new Date(year, month - 1, day);
        const today = new Date();
        
        // Comprobar que la fecha es futura y dentro de los próximos 30 días
        const diffDays = differenceInDays(dueDate, today);
        return diffDays >= 0 && diffDays <= 30;
      } catch (e) {
        console.error("Error al procesar fecha de vencimiento:", e, expense);
        return false;
      }
    })
    .map(expense => ({
      title: expense.concept,
      dueDate: expense.due_date,
      amount: expense.amount,
      days: differenceInDays(
        new Date(
          parseInt(expense.due_date.split('/')[2]),
          parseInt(expense.due_date.split('/')[1]) - 1,
          parseInt(expense.due_date.split('/')[0])
        ),
        new Date()
      ),
      category: expense.category
    }))
    .sort((a, b) => a.days - b.days);

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
      // Mostrar productos con stock agotado primero
      const noStockItems = lowStockItems.filter(item => item.quantity === 0);
      const lowStockItemsFiltered = lowStockItems.filter(item => item.quantity > 0);
      
      // Mostrar productos agotados
      noStockItems.forEach(item => {
        alerts.push({
          icon: ShoppingBag,
          title: `Stock Agotado: ${item.product_name}`,
          description: `No quedan unidades en inventario`,
          variant: "error",
          requiredRole: undefined,
        });
      });
      
      // Mostrar productos con stock bajo
      lowStockItemsFiltered.slice(0, Math.max(0, 3 - noStockItems.length)).forEach(item => {
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
          variant: "info",
          requiredRole: undefined,
        });
      }
    }
    
    // Alerta de vencimiento de gift card
    if (sortedExpiringCards.length > 0) {
      // Mostrar hasta 2 gift cards próximas a vencer
      sortedExpiringCards.slice(0, 2).forEach(card => {
        try {
          const expiryDate = new Date(card.expiry_date);
          const today = new Date();
          const diffDays = differenceInDays(expiryDate, today);
          
          alerts.push({
            icon: CalendarDays,
            title: `Gift Card próxima a vencer: ${card.code}`,
            description: `Vence el ${format(expiryDate, 'dd/MM/yyyy')} (en ${diffDays} días)`,
            variant: diffDays <= 3 ? "error" : "warning",
            requiredRole: undefined,
          });
        } catch (e) {
          console.error("Error al procesar alerta de gift card:", e);
        }
      });
      
      // Si hay más gift cards por vencer, mostrar un resumen
      if (sortedExpiringCards.length > 2) {
        alerts.push({
          icon: Calendar,
          title: `${sortedExpiringCards.length - 2} gift cards más por vencer`,
          description: `Revisar en la sección de Gift Cards`,
          variant: "info",
          requiredRole: undefined,
        });
      }
    }
    
    // Alerta de pagos pendientes (alquiler, servicios, etc.) - solo para superadmin
    if (isSuperAdmin && upcomingExpenses.length > 0) {
      // Mostrar hasta 3 pagos próximos más urgentes
      upcomingExpenses.slice(0, 2).forEach(payment => {
        const isRent = payment.category === 'Fijos' || 
                      payment.title.toLowerCase().includes('alquiler') || 
                      payment.title.toLowerCase().includes('renta');
        
        alerts.push({
          icon: isRent ? House : DollarSign,
          title: `${isRent ? 'Pago de Alquiler' : payment.title} Pendiente`,
          description: `Vence el ${payment.dueDate} (en ${payment.days} días)`,
          variant: payment.days <= 3 ? "error" : "warning",
          requiredRole: 'superadmin' as const,
        });
      });
      
      // Si hay más pagos pendientes, mostrar un resumen
      if (upcomingExpenses.length > 2) {
        alerts.push({
          icon: DollarSign,
          title: `${upcomingExpenses.length - 2} pagos más pendientes`,
          description: `Revisar en la sección de Gastos`,
          variant: "info",
          requiredRole: 'superadmin' as const,
        });
      }
    }
    
    // Alerta de arreglos pendientes
    if (pendingArreglos > 0) {
      alerts.push({
        icon: Wrench,
        title: `${pendingArreglos} arreglos pendientes`,
        description: oldPendingArreglos > 0 ? `${oldPendingArreglos} con más de 5 días` : `Todos dentro del plazo normal`,
        variant: oldPendingArreglos > 0 ? "warning" : "info",
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
              {isLoadingGiftCards ? "Cargando..." : `${sortedExpiringCards.length} próximas a vencer`}
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
          <CardContent>
            {isLoadingGiftCards || isLoadingStock || isLoadingArreglos || isLoadingPayments ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando alertas...
              </div>
            ) : alertItems.length > 0 ? (
              <Carousel 
                opts={{
                  align: "start",
                  loop: alertItems.length > 4,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {alertItems.map((alert, index) => (
                    <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <Alert variant={alert.variant as "default" | "destructive" | "warning" | "error" | "info" | "success"}>
                        <alert.icon className="h-5 w-5" />
                        <AlertTitle>{alert.title}</AlertTitle>
                        <AlertDescription>{alert.description}</AlertDescription>
                      </Alert>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-end gap-2 pt-2">
                  <CarouselPrevious className="relative static -translate-y-0 translate-x-0 rounded border border-input bg-background" />
                  <CarouselNext className="relative static -translate-y-0 translate-x-0 rounded border border-input bg-background" />
                </div>
              </Carousel>
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
