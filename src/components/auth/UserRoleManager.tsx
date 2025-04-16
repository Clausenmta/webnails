
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Shield, ShieldAlert } from "lucide-react";
import { toast } from '@/hooks/use-toast';

interface UserEntry {
  email: string;
  role: UserRole;
}

const UserRoleManager = () => {
  const { user, updateUserRole, isAuthorized } = useAuth();
  const [users, setUsers] = useState<UserEntry[]>([
    { email: 'claus@nailsandco.com.ar', role: 'superadmin' },
    { email: 'paula@nailsandco.com.ar', role: 'superadmin' },
  ]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('employee');

  // Verificar permisos
  if (!user || !isAuthorized('superadmin')) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <ShieldAlert className="h-5 w-5 mr-2" />
            Acceso Denegado
          </CardTitle>
          <CardDescription>
            No tienes permisos para administrar roles de usuario.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleRoleChange = (email: string, newRole: UserRole) => {
    // Actualizar el estado local
    setUsers(
      users.map(user => 
        user.email === email ? { ...user, role: newRole } : user
      )
    );
    
    // Actualizar el rol en el contexto de autenticación
    updateUserRole(email, newRole);
    
    toast({
      title: "Rol actualizado",
      description: `El rol de ${email} ha sido actualizado a ${newRole === 'superadmin' ? 'Administrador' : 'Empleado'}`,
      className: "bg-green-100 border-green-300 text-green-800"
    });
  };

  const handleAddUser = () => {
    if (!newUserEmail || !newUserEmail.includes('@')) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un correo electrónico válido",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar si el usuario ya existe
    if (users.some(user => user.email === newUserEmail)) {
      toast({
        title: "Error",
        description: "Este usuario ya existe en la lista",
        variant: "destructive"
      });
      return;
    }
    
    // Agregar nuevo usuario
    setUsers([...users, { email: newUserEmail, role: newUserRole }]);
    updateUserRole(newUserEmail, newUserRole);
    
    // Limpiar formulario
    setNewUserEmail('');
    setNewUserRole('employee');
    
    toast({
      title: "Usuario agregado",
      description: `${newUserEmail} ha sido agregado con rol de ${newUserRole === 'superadmin' ? 'Administrador' : 'Empleado'}`,
      className: "bg-green-100 border-green-300 text-green-800"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-salon-600" />
          Administración de Roles
        </CardTitle>
        <CardDescription>
          Gestiona los roles de los usuarios registrados en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Usuarios Registrados</h3>
          <div className="space-y-4">
            {users.map((userEntry) => (
              <div key={userEntry.email} className="border p-4 rounded-md bg-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{userEntry.email}</span>
                </div>
                <RadioGroup 
                  value={userEntry.role} 
                  onValueChange={(value) => handleRoleChange(userEntry.email, value as UserRole)}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="superadmin" id={`admin-${userEntry.email}`} />
                    <Label htmlFor={`admin-${userEntry.email}`}>Administrador</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="employee" id={`employee-${userEntry.email}`} />
                    <Label htmlFor={`employee-${userEntry.email}`}>Empleado</Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-3">Agregar Usuario</h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input 
                id="email" 
                value={newUserEmail} 
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="ejemplo@correo.com" 
              />
            </div>
            <div>
              <Label className="mb-2 block">Rol</Label>
              <RadioGroup 
                value={newUserRole} 
                onValueChange={(value) => setNewUserRole(value as UserRole)}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="superadmin" id="new-admin" />
                  <Label htmlFor="new-admin">Administrador</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="employee" id="new-employee" />
                  <Label htmlFor="new-employee">Empleado</Label>
                </div>
              </RadioGroup>
            </div>
            <Button 
              onClick={handleAddUser}
              className="w-full bg-salon-500 hover:bg-salon-600"
            >
              Agregar Usuario
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRoleManager;
