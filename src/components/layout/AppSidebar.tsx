
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { 
  CreditCard, 
  Package, 
  Wrench, 
  DollarSign, 
  Users, 
  BarChart, 
  Receipt, 
  LogOut, 
  Home,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const location = useLocation();
  
  const mainMenuItems = [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Gift Cards",
      url: "/gift-cards",
      icon: CreditCard,
    },
    {
      title: "Stock",
      url: "/stock",
      icon: Package,
    },
    {
      title: "Arreglos",
      url: "/arreglos",
      icon: Wrench,
    },
    {
      title: "Gastos",
      url: "/gastos",
      icon: DollarSign,
    },
    {
      title: "Empleados",
      url: "/empleados",
      icon: Users,
    },
    {
      title: "Resultados",
      url: "/resultados",
      icon: BarChart,
    },
    {
      title: "Facturación",
      url: "/facturacion",
      icon: Receipt,
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-salon-400">
            <Home className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold bg-gradient-to-r from-salon-400 to-salon-600 bg-clip-text text-transparent">
            Estetica Flow
          </span>
        </div>
        <SidebarTrigger className="md:hidden" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={cn(
                      isActive(item.url) && "bg-salon-100 text-salon-700"
                    )}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start gap-2 text-muted-foreground"
          asChild
        >
          <Link to="/login">
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
