
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredPermission?: string;
}

const ProtectedRoute = ({ children, requiredRole, requiredPermission }: ProtectedRouteProps) => {
  const { isAuthenticated, isAuthorized, hasSpecialPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar permiso especial si se requiere
  if (requiredPermission && !hasSpecialPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Verificar rol si se requiere
  if (requiredRole && !isAuthorized(requiredRole) && 
      !(requiredPermission && hasSpecialPermission(requiredPermission))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
