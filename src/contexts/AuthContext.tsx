
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

// Predefined users
const USERS = [
  { id: '1', username: 'claus', password: 'chimuelo1510', name: 'Claus', role: 'superadmin' as UserRole },
  { id: '2', username: 'paula', password: 'tucuman1344', name: 'Paula', role: 'superadmin' as UserRole },
  { id: '3', username: 'recepcion', password: 'nails1452', name: 'Recepcionista', role: 'employee' as UserRole },
  { id: '4', username: 'recepcion1', password: 'nails3652', name: 'Recepcionista 1', role: 'employee' as UserRole },
];

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

  // Check for stored user on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const foundUser = USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      // Create a user object without the password
      const loggedInUser: User = {
        id: foundUser.id,
        username: foundUser.username,
        name: foundUser.name,
        role: foundUser.role,
      };

      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAuthorized = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    
    // Superadmin has access to everything
    if (user.role === 'superadmin') return true;
    
    // Employee only has access to employee permissions
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
