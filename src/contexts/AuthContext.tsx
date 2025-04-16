
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '@/types/auth';
import { supabase } from "@/integrations/supabase/client";
import { Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  isAuthenticated: false,
  isAuthorized: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Lista de superadmins para facilitar la gestión
  const superadminEmails = [
    'claus@nailsandco.com.ar',
    'paula@nailsandco.com.ar'
  ];

  // Determinar el rol basado en el email
  const determineUserRole = (email: string | undefined): UserRole => {
    if (!email) return 'employee';
    return superadminEmails.includes(email.toLowerCase()) ? 'superadmin' : 'employee';
  };

  // Inicializar la sesión de Supabase y escuchar cambios
  useEffect(() => {
    // Configurar el listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
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
        }
      }
    );

    // Verificar si hay una sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
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
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
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
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error al cerrar sesión:', error.message);
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión correctamente",
        variant: "destructive"
      });
    } else {
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
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
