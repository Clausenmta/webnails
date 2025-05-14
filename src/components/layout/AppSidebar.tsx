
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
  const { user, logout, hasSpecialPermission } = useAuth();
  
  // Función para verificar si un item de menú debe mostrarse según el rol del usuario
  const shouldShowMenuItem = (requiredRole?: UserRole, specialPermission?: string): boolean => {
    if (!user) return false; // Si no hay usuario, no mostrar
    
    // Si se especifica un permiso especial, verificar
    if (specialPermission && hasSpecialPermission(specialPermission)) return true;
    
    // Si no hay rol requerido, mostrar a todos
    if (!requiredRole) return true;
    
    // Superadmin puede ver todo
    if (user.role === 'superadmin') return true;
    
    // Verificar si el rol del usuario coincide con el requerido
    return user.role === requiredRole;
  };
  
  const mainMenuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      requiredRole: undefined,
      specialPermission: undefined,
    },
    {
      title: "Gift Cards",
      path: "/gift-cards",
      icon: CreditCard,
      requiredRole: undefined,
      specialPermission: undefined,
    },
    {
      title: "Stock",
      path: "/stock",
      icon: Package,
      requiredRole: undefined,
      specialPermission: undefined,
    },
    {
      title: "Arreglos",
      path: "/arreglos",
      icon: Wrench,
      requiredRole: undefined,
      specialPermission: undefined,
    },
    {
      title: "Gastos",
      path: "/gastos",
      icon: DollarSign,
      requiredRole: undefined,
      specialPermission: undefined,
    },
    {
      title: "Empleados",
      path: "/empleados",
      icon: Users,
      requiredRole: 'superadmin' as UserRole,
      specialPermission: undefined,
    },
    {
      title: "Ausencias",
      path: "/ausencias",
      icon: CalendarX2,
      requiredRole: 'superadmin' as UserRole,
      specialPermission: 'ausencias',
    },
    {
      title: "Resultados",
      path: "/resultados",
      icon: BarChart,
      requiredRole: 'superadmin' as UserRole,
      specialPermission: undefined,
    },
    {
      title: "Facturación",
      path: "/facturacion",
      icon: Receipt,
      requiredRole: 'superadmin' as UserRole,
      specialPermission: undefined,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="flex items-center justify-between py-4 px-5">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center">
            <div className="h-8 w-auto">
              <img 
                src="https://nailsandco.com.ar/wp-content/uploads/2024/03/NAILSCO.png" 
                alt="Nails&Co Logo" 
                className="h-full w-auto object-contain cursor-pointer"
              />
            </div>
          </Link>
        </div>
        <SidebarTrigger className="md:hidden text-salon-600" />
      </SidebarHeader>
      
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-salon-500 px-2 mb-2">Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems
                .filter(item => shouldShowMenuItem(item.requiredRole, item.specialPermission))
                .map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild
                      className={isCurrentPath(item.path) 
                        ? "bg-salon-100 text-salon-700 font-medium" 
                        : "text-salon-600 hover:bg-salon-50 hover:text-salon-900 transition-colors"
                      }
                    >
                      <Link to={item.path} className="flex items-center gap-3 py-2.5 px-3 rounded-md">
                        <item.icon className={`h-[18px] w-[18px] ${isCurrentPath(item.path) ? 'text-salon-600' : 'text-salon-500'}`} />
                        <span className="text-sm">{item.title}</span>
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
          className="w-full justify-start gap-2 text-salon-600 hover:text-salon-700 hover:bg-salon-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar Sesión</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
