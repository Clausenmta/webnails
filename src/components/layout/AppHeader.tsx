
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export function AppHeader() {
  // Estado para manejar el menú de notificaciones
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white py-2 px-6">
      <div className="flex h-12 items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          {/* Logo removed from header, only kept in sidebar */}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
          </Button>
          <DropdownMenu 
            open={isMenuOpen} 
            onOpenChange={(open) => {
              setIsMenuOpen(open);
            }}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full" size="icon">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" alt="Avatar" />
                  <AvatarFallback className="bg-salon-400 text-white">AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link 
                  to="/perfil"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link 
                  to="/configuracion"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  setIsMenuOpen(false);
                  console.log("Cerrar sesión");
                }}
              >
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
