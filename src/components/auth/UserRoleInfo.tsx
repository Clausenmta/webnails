
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/types/auth";
import { AlertCircle, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";

interface UserRoleInfoProps {
  testRoles?: UserRole[];
}

const UserRoleInfo = ({ testRoles = ["superadmin", "employee"] }: UserRoleInfoProps) => {
  const { user, isAuthorized } = useAuth();

  if (!user) {
    return (
      <Card className="mb-4 border-destructive">
        <CardHeader className="pb-2">
          <CardTitle className="text-destructive flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            No hay usuario autenticado
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-salon-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-salon-700 flex items-center">
          <ShieldCheck className="h-5 w-5 mr-2" />
          Información del Usuario
        </CardTitle>
        <CardDescription>Verificación de roles y permisos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="font-semibold">Nombre:</div>
          <div>{user.name}</div>
          
          <div className="font-semibold">Email:</div>
          <div>{user.username}</div>
          
          <div className="font-semibold">ID:</div>
          <div className="text-xs text-muted-foreground">{user.id}</div>
          
          <div className="font-semibold">Rol actual:</div>
          <div>
            <Badge variant={user.role === 'superadmin' ? 'default' : 'outline'}>
              {user.role === 'superadmin' ? 'Administrador' : 'Empleado'}
            </Badge>
          </div>
        </div>
        
        <div className="border-t pt-2">
          <p className="text-sm font-medium mb-2">Comprobación de permisos:</p>
          <div className="space-y-1">
            {testRoles.map((role) => (
              <div key={role} className="flex items-center justify-between text-sm">
                <span>Acceso como {role === 'superadmin' ? 'Administrador' : 'Empleado'}:</span>
                {isAuthorized(role) ? (
                  <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Autorizado
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    No autorizado
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRoleInfo;
