
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
  House,
  ExternalLink,
  Receipt,
  FileText
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
import { useRevenueData } from "@/hooks/useRevenueData";

export default function DashboardPage() {
  const { user, isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Extract month and year from currentDate for data fetching
  const selectedMonth = format(currentDate, 'MMM', { locale: es }).substring(0, 3).charAt(0).toUpperCase() + format(currentDate, 'MMM', { locale: es }).substring(0, 3).substring(1);
  const selectedYear = format(currentDate, 'yyyy');
  
  // Get numeric month and year for the revenue calculation
  const numericMonth = currentDate.getMonth();
  const numericYear = currentDate.getFullYear();
  
  // Use our revenue data hook to get real revenue data
  const { 
    totalServices,
    pendingPayments,
    isLoading: isLoadingRevenue
  } = useRevenueData(selectedMonth, selectedYear);
  
  // Fetch real billing data from the database
  const { data: monthlyBilling = 0, isLoading: isLoadingBilling } = useQuery({
    queryKey: ['monthlyBilling', numericMonth, numericYear],
    queryFn: () => revenueService.fetchTotalMonthlyBilling(numericMonth, numericYear)
  });
  
  // Get previous month for comparison
  const prevMonth = new Date(currentDate);
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  
  // Fetch previous month billing for comparison
  const { data: prevMonthBilling = 0 } = useQuery({
    queryKey: ['monthlyBilling', prevMonth.getMonth(), prevMonth.getFullYear()],
    queryFn: () => revenueService.fetchTotalMonthlyBilling(prevMonth.getMonth(), prevMonth.getFullYear()),
    enabled: !isLoadingBilling
  });
  
  // Calculate percentage change
  const billingPercentageChange = prevMonthBilling > 0 ? 
    ((monthlyBilling - prevMonthBilling) / prevMonthBilling) * 100 : 0;
  
  // Use our hook to get arreglos revenue data
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
        
        // Comprobar que la fecha es futura y dentro de los próximos 7 días (cambiado de 30 a 7)
        const diffDays = differenceInDays(dueDate, today);
        return diffDays >= 0 && diffDays <= 7; // Mostrar solo gastos con vencimiento en los próximos 7 días
      } catch (e) {
        console.error("Error al procesar fecha de vencimiento:", e, expense);
        return false;
      }
    })
    .map(expense => ({
      id: expense.id,
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
      category: expense.category,
      paymentMethod: expense.payment_method,
      provider: expense.provider
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

  // Organizar alertas por categorías
  const generateAlertsByCategories = () => {
    const alertCategories = {
      stock: {
        title: "🔴 Productos Bajo Stock",
        alerts: [] as any[]
      },
      giftCards: {
        title: "🎁 Gift Cards por Vencer",
        alerts: [] as any[]
      },
      expenses: {
        title: "💰 Pagos Pendientes",
        alerts: [] as any[]
      }
    };
    
    // Productos sin stock o stock crítico
    // Primero los productos sin stock
    lowStockItems
      .filter(item => item.quantity === 0)
      .forEach(item => {
        alertCategories.stock.alerts.push({
          id: item.id,
          icon: ShoppingBag,
          title: `Stock Agotado: ${item.product_name}`,
          description: `No quedan unidades en inventario`,
          variant: "error",
          link: `/stock/${item.id}`
        });
      });
    
    // Después los productos con stock crítico
    lowStockItems
      .filter(item => item.quantity > 0)
      .slice(0, 5) // Limitar para no mostrar demasiados
      .forEach(item => {
        alertCategories.stock.alerts.push({
          id: item.id,
          icon: AlertTriangle,
          title: `Stock Bajo: ${item.product_name}`,
          description: `Quedan ${item.quantity} unidades en inventario`,
          variant: "warning",
          link: `/stock/${item.id}`
        });
      });
    
    // Gift Cards por vencer
    if (sortedExpiringCards.length > 0) {
      sortedExpiringCards.forEach(card => {
        try {
          const expiryDate = new Date(card.expiry_date);
          const today = new Date();
          const diffDays = differenceInDays(expiryDate, today);
          
          alertCategories.giftCards.alerts.push({
            id: card.id,
            icon: CalendarDays,
            title: `Gift Card próxima a vencer: ${card.code}`,
            description: `Vence el ${format(expiryDate, 'dd/MM/yyyy')} (en ${diffDays} días)`,
            variant: diffDays <= 3 ? "error" : "warning",
            link: `/gift-cards/${card.id}`
          });
        } catch (e) {
          console.error("Error al procesar alerta de gift card:", e);
        }
      });
    }
    
    // Gastos con vencimiento próximo
    if (isSuperAdmin && upcomingExpenses.length > 0) {
      upcomingExpenses.forEach(payment => {
        const isRent = payment.category === 'Fijos' || 
                      payment.title.toLowerCase().includes('alquiler') || 
                      payment.title.toLowerCase().includes('renta');
        
        const isService = payment.category === 'Servicios';
        const isPending = !payment.paymentMethod;
        
        // Elegir el icono según la categoría o tipo de pago
        let icon = DollarSign;
        if (isRent) icon = House;
        else if (isService) icon = FileText;
        else icon = Receipt;
        
        alertCategories.expenses.alerts.push({
          id: payment.id,
          icon,
          title: `${payment.title}`,
          description: `Vence el ${payment.dueDate} (en ${payment.days} días) - $${payment.amount.toLocaleString()}`,
          variant: payment.days <= 3 ? "error" : "warning",
          link: `/gastos/${payment.id}`
        });
      });
    }
    
    // Filtrar categorías que no tienen alertas
    return Object.values(alertCategories).filter(category => category.alerts.length > 0);
  };
  
  const alertCategories = generateAlertsByCategories();

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
              <div className="text-2xl font-bold">
                ${isLoadingBilling ? "..." : monthlyBilling.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {billingPercentageChange > 0 ? '+' : ''}{billingPercentageChange.toFixed(1)}% respecto al mes pasado
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
            {isLoadingGiftCards || isLoadingStock || isLoadingArreglos || isLoadingPayments || isLoadingExpenses ? (
              <div className="text-center py-8 text-muted-foreground">
                Cargando alertas...
              </div>
            ) : alertCategories.length > 0 ? (
              <div className="space-y-6">
                {alertCategories.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-3">
                    <h3 className="text-md font-semibold">{category.title}</h3>
                    <ScrollArea className="w-full" orientation="horizontal">
                      <div className="flex space-x-2 pb-3 px-1">
                        {category.alerts.map((alert, alertIndex) => (
                          <Link to={alert.link} key={alertIndex} className="min-w-[280px] md:min-w-[320px] max-w-[320px]">
                            <Alert 
                              variant={alert.variant as "default" | "destructive" | "warning" | "error" | "info" | "success"}
                              className="hover:bg-muted/50 transition-colors cursor-pointer h-full"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-start gap-2">
                                  <alert.icon className="h-5 w-5 mt-0.5 shrink-0" />
                                  <div className="overflow-hidden">
                                    <AlertTitle className="truncate">{alert.title}</AlertTitle>
                                    <AlertDescription className="truncate">{alert.description}</AlertDescription>
                                  </div>
                                </div>
                                <ExternalLink className="h-4 w-4 shrink-0" />
                              </div>
                            </Alert>
                          </Link>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ))}
              </div>
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
