
export type UserRole = 'superadmin' | 'employee';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAuthorized: (requiredRole: UserRole) => boolean;
}
