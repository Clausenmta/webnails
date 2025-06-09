
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getActiveSession } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { UserRole } from '@/types/auth';

interface AuthUser extends User {
  role: UserRole;
  name: string;
  specialPermissions?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthorized: (requiredRole: UserRole) => boolean;
  hasSpecialPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuración de usuarios y roles
const USER_ROLES: Record<string, { role: UserRole; name: string; specialPermissions?: string[] }> = {
  'clausnemi@gmail.com': { 
    role: 'superadmin', 
    name: 'Claudio Nemi',
    specialPermissions: ['ausencias', 'empleados', 'resultados']
  },
  'nailsandcopaula@gmail.com': { 
    role: 'superadmin', 
    name: 'Paula Gomez',
    specialPermissions: ['ausencias', 'empleados', 'resultados']
  },
  'nailsandcofisherton@gmail.com': { 
    role: 'employee', 
    name: 'Empleado Fisherton',
    specialPermissions: ['ausencias']
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión inicial
    const checkSession = async () => {
      try {
        const session = await getActiveSession();
        if (session?.user) {
          const userConfig = USER_ROLES[session.user.email!];
          if (userConfig) {
            setUser({
              ...session.user,
              role: userConfig.role,
              name: userConfig.name,
              specialPermissions: userConfig.specialPermissions || []
            });
          }
        }
      } catch (error) {
        console.error('Error verificando sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session ? 'Usuario autenticado' : 'Sin sesión');
      
      if (session?.user) {
        const userConfig = USER_ROLES[session.user.email!];
        if (userConfig) {
          setUser({
            ...session.user,
            role: userConfig.role,
            name: userConfig.name,
            specialPermissions: userConfig.specialPermissions || []
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const userConfig = USER_ROLES[data.user.email!];
        if (!userConfig) {
          throw new Error('Usuario no autorizado');
        }

        setUser({
          ...data.user,
          role: userConfig.role,
          name: userConfig.name,
          specialPermissions: userConfig.specialPermissions || []
        });
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setLoading(true);
    supabase.auth.signOut().finally(() => {
      setUser(null);
      setLoading(false);
    });
  };

  const isAuthorized = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    
    if (user.role === 'superadmin') return true;
    
    return user.role === requiredRole;
  };

  const hasSpecialPermission = (permission: string): boolean => {
    if (!user) return false;
    
    if (user.role === 'superadmin') return true;
    
    return user.specialPermissions?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAuthorized,
      hasSpecialPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
