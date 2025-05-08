
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '@/types/auth';
import { supabase } from "@/integrations/supabase/client";
import { Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

// Actualizar el mapa de correos electrónicos a roles
const userRoleMap: Record<string, UserRole> = {
  'clausnemi@gmail.com': 'superadmin',
  'nailsandcopaula@gmail.com': 'superadmin',
  'nailsandcofisherton@gmail.com': 'employee',
};

// Lista de permisos especiales para usuarios específicos
const specialPermissions: Record<string, string[]> = {
  'nailsandcofisherton@gmail.com': ['ausencias']
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
  isAuthorized: () => false,
  updateUserRole: () => {},
  hasSpecialPermission: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Determinar el rol basado en el email usando el mapa de roles
  const determineUserRole = (email: string | undefined): UserRole => {
    if (!email) return 'employee';
    return userRoleMap[email.toLowerCase()] || 'employee';
  };

  // Función para verificar permisos especiales
  const hasSpecialPermission = (permissionName: string): boolean => {
    if (!user || !user.username) return false;
    
    // Los superadmin tienen todos los permisos
    if (user.role === 'superadmin') return true;
    
    // Verificar si el usuario tiene permisos especiales
    const userPermissions = specialPermissions[user.username.toLowerCase()] || [];
    return userPermissions.includes(permissionName);
  };

  // Función para actualizar el rol de un usuario
  const updateUserRole = (email: string, newRole: UserRole) => {
    if (!email) return;
    
    // Actualizar el mapa de roles
    userRoleMap[email.toLowerCase()] = newRole;
    
    // Si el usuario actual es el que se está modificando, actualizar su estado
    if (user && user.username.toLowerCase() === email.toLowerCase()) {
      setUser({
        ...user,
        role: newRole
      });
      
      toast({
        title: "Rol actualizado",
        description: `El rol de ${email} ha sido actualizado a ${newRole === 'superadmin' ? 'Administrador' : 'Empleado'}`,
        className: "bg-green-100 border-green-300 text-green-800"
      });
    }
  };

  // Inicializar la sesión de Supabase y escuchar cambios
  useEffect(() => {
    console.log("Inicializando contexto de autenticación");

    // Configurar el listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Evento de autenticación:", event);
        setSession(currentSession);
        if (currentSession?.user) {
          // Crear usuario con rol basado en email
          const userData: User = {
            id: currentSession.user.id,
            username: currentSession.user.email || '',
            name: currentSession.user.user_metadata.name || currentSession.user.email?.split('@')[0] || 'Usuario',
            role: determineUserRole(currentSession.user.email)
          };
          setUser(userData);
          console.log("Usuario autenticado:", userData);
        } else {
          setUser(null);
          console.log("No hay usuario autenticado");
        }
      }
    );

    // Verificar si hay una sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Verificando sesión existente:", currentSession ? "Sesión encontrada" : "No hay sesión");
      setSession(currentSession);
      if (currentSession?.user) {
        // Crear usuario con rol basado en email
        const userData: User = {
          id: currentSession.user.id,
          username: currentSession.user.email || '',
          name: currentSession.user.user_metadata.name || currentSession.user.email?.split('@')[0] || 'Usuario',
          role: determineUserRole(currentSession.user.email)
        };
        setUser(userData);
        console.log("Sesión existente encontrada:", userData);
      } else {
        console.log("No se encontró sesión activa");
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Intentando iniciar sesión con:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Error al iniciar sesión:', error.message);
        toast({
          title: "Error de inicio de sesión",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      if (data.user) {
        console.log("Inicio de sesión exitoso:", data.user.email);
        toast({
          title: "Inicio de sesión exitoso",
          description: `Bienvenido/a ${data.user.user_metadata.name || data.user.email?.split('@')[0] || ''}`,
          className: "bg-green-100 border-green-300 text-green-800"
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error inesperado:', error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive"
      });
      return false;
    }
  };

  const logout = async () => {
    console.log("Cerrando sesión...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión correctamente",
        variant: "destructive"
      });
    } else {
      console.log("Sesión cerrada correctamente");
      setUser(null);
      setSession(null);
    }
  };

  const isAuthorized = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    
    // Superadmin tiene acceso a todo
    if (user.role === 'superadmin') return true;
    
    // Employee solo tiene acceso a permisos de employee
    return user.role === requiredRole;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAuthorized,
        updateUserRole,
        hasSpecialPermission,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
