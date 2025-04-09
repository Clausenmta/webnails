
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
import { Link, useLocation } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  Users,
  DollarSign,
  Package,
  CreditCard,
  BarChart,
  Receipt,
  Wrench
} from "lucide-react";

export function AppSidebar() {
  const location = useLocation();
  
  const mainMenuItems = [
    {
      title: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Gift Cards",
      path: "/gift-cards",
      icon: CreditCard,
    },
    {
      title: "Stock",
      path: "/stock",
      icon: Package,
    },
    {
      title: "Arreglos",
      path: "/arreglos",
      icon: Wrench,
    },
    {
      title: "Gastos",
      path: "/gastos",
      icon: DollarSign,
    },
    {
      title: "Empleados",
      path: "/empleados",
      icon: Users,
    },
    {
      title: "Resultados",
      path: "/resultados",
      icon: BarChart,
    },
    {
      title: "Facturación",
      path: "/facturacion",
      icon: Receipt,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-auto">
            <img 
              src="https://nailsandco.com.ar/wp-content/uploads/2023/03/NAILSCO.png" 
              alt="Nails&Co Logo" 
              className="h-full w-auto object-contain"
            />
          </div>
          {/* Removed "Central" text that was here */}
        </div>
        <SidebarTrigger className="md:hidden" />
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
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
