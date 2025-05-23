
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, ShieldCheck, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserRoleInfo from "../auth/UserRoleInfo";
import UserRoleManager from "../auth/UserRoleManager";

export function AppHeader() {
  // Estado para manejar el menú de notificaciones con useCallback para evitar re-renders
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [showRoleManager, setShowRoleManager] = useState(false);
  const { user, logout, isAuthorized } = useAuth();
  const navigate = useNavigate();
  
  // Uso de useCallback para mejorar el rendimiento y evitar re-renders innecesarios
  const handleMenuOpenChange = useCallback((open: boolean) => {
    setIsMenuOpen(open);
  }, []);

  const handleLogout = useCallback(() => {
    setIsMenuOpen(false);
    
    // Realizar el logout
    logout();
    
    // Notificación para el usuario
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente."
    });
    
    // Redirigir al login
    navigate("/login");
  }, [logout, navigate]);

  const handleNavigation = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Función para obtener las iniciales del nombre del usuario
  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    
    const nameParts = user.name.split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  const toggleRoleInfo = () => {
    setShowRoleInfo(!showRoleInfo);
    setShowRoleManager(false);
  };

  const toggleRoleManager = () => {
    setShowRoleManager(!showRoleManager);
    setShowRoleInfo(false);
  };

  return (
    <header className="border-b bg-white py-3 px-6 shadow-sm">
      <div className="flex h-12 items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-salon-600 hover:bg-salon-50" />
          {/* Logo removed from header, only kept in sidebar */}
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Verificar Roles"
            onClick={toggleRoleInfo}
            className="text-salon-600 hover:bg-salon-50"
          >
            <ShieldCheck className="h-5 w-5" />
          </Button>
          {isAuthorized('superadmin') && (
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Gestionar Roles"
              onClick={toggleRoleManager}
              className="text-salon-600 hover:bg-salon-50"
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Notificaciones"
            className="text-salon-600 hover:bg-salon-50 relative"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-salon-500"></span>
          </Button>
          <DropdownMenu 
            open={isMenuOpen} 
            onOpenChange={handleMenuOpenChange}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full" size="icon">
                <Avatar className="h-9 w-9 border-2 border-salon-100">
                  <AvatarImage src="/placeholder.svg" alt="Avatar" />
                  <AvatarFallback className="bg-salon-400 text-white font-medium">{getUserInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50 bg-white w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.role === 'superadmin' ? 'Administrador' : 'Empleado'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link 
                  to="/perfil"
                  className="cursor-pointer"
                  onClick={handleNavigation}
                >
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link 
                  to="/configuracion"
                  className="cursor-pointer"
                  onClick={handleNavigation}
                >
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 cursor-pointer focus:text-red-600"
              >
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {showRoleInfo && (
        <div className="mt-4">
          <UserRoleInfo />
        </div>
      )}

      {showRoleManager && (
        <div className="mt-4">
          <UserRoleManager />
        </div>
      )}
    </header>
  );
}
