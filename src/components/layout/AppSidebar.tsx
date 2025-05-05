
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  Users,
  DollarSign,
  Package,
  CreditCard,
  BarChart,
  Receipt,
  Wrench,
  CalendarX2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // Función para verificar si un item de menú debe mostrarse según el rol del usuario
  const shouldShowMenuItem = (requiredRole?: UserRole): boolean => {
    if (!requiredRole) return true; // Si no hay rol requerido, mostrar a todos
    if (!user) return false; // Si no hay usuario, no mostrar
    if (user.role === 'superadmin') return true; // Superadmin puede ver todo
    return user.role === requiredRole; // Verificar si el rol del usuario coincide con el requerido
  };
  
  const mainMenuItems = [
    {
      title: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
      requiredRole: undefined,
    },
    {
      title: "Gift Cards",
      path: "/gift-cards",
      icon: CreditCard,
      requiredRole: undefined,
    },
    {
      title: "Stock",
      path: "/stock",
      icon: Package,
      requiredRole: undefined,
    },
    {
      title: "Arreglos",
      path: "/arreglos",
      icon: Wrench,
      requiredRole: undefined,
    },
    {
      title: "Gastos",
      path: "/gastos",
      icon: DollarSign,
      requiredRole: undefined,
    },
    {
      title: "Empleados",
      path: "/empleados",
      icon: Users,
      requiredRole: 'superadmin' as UserRole,
    },
    {
      title: "Ausencias",
      path: "/ausencias",
      icon: CalendarX2,
      requiredRole: 'superadmin' as UserRole,
    },
    {
      title: "Resultados",
      path: "/resultados",
      icon: BarChart,
      requiredRole: 'superadmin' as UserRole,
    },
    {
      title: "Facturación",
      path: "/facturacion",
      icon: Receipt,
      requiredRole: 'superadmin' as UserRole,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <div className="h-8 w-auto">
              <img 
                src="https://nailsandco.com.ar/wp-content/uploads/2024/03/NAILSCO.png" 
                alt="Nails&Co Logo" 
                className="h-full w-auto object-contain cursor-pointer"
              />
            </div>
          </Link>
        </div>
        <SidebarTrigger className="md:hidden" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems
                .filter(item => shouldShowMenuItem(item.requiredRole))
                .map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild
                      className={location.pathname === item.path ? "bg-salon-100 text-salon-700" : ""}
                    >
                      <Link to={item.path} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              }
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar Sesión</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
