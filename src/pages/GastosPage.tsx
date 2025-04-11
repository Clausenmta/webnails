
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

// Esta es una página de ejemplo simplificada para la gestión de gastos con permisos por rol
export default function GastosPage() {
  const { user, isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  
  // Datos de ejemplo de gastos
  const [expenses, setExpenses] = useState([
    { id: 1, date: "05/04/2025", concept: "Alquiler", amount: 150000, category: "Fijos", createdBy: "claus" },
    { id: 2, date: "03/04/2025", concept: "Expensas", amount: 30000, category: "Fijos", createdBy: "paula" },
    { id: 3, date: "03/04/2025", concept: "Productos OPI", amount: 45000, category: "Proveedores", createdBy: "claus" },
    { id: 4, date: "02/04/2025", concept: "Productos CND", amount: 35000, category: "Proveedores", createdBy: "paula" },
    { id: 5, date: "01/04/2025", concept: "Materiales varios", amount: 12500, category: "Insumos", createdBy: "recepcion" },
    { id: 6, date: "30/03/2025", concept: "Limpieza", amount: 8000, category: "Servicios", createdBy: "recepcion1" },
  ]);

  // Filtrar gastos según el rol del usuario
  const filteredExpenses = isSuperAdmin 
    ? expenses 
    : expenses.filter(expense => 
        expense.createdBy === user?.username || 
        (expense.category !== "Fijos" && expense.category !== "Proveedores")
      );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gastos</h2>
          <p className="text-muted-foreground">
            {isSuperAdmin 
              ? "Gestión completa de gastos del salón" 
              : "Registro de gastos e insumos"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="bg-salon-400 hover:bg-salon-500">
            Registrar Gasto
          </Button>
          {isSuperAdmin && (
            <Button variant="outline">
              Exportar Reporte
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Gastos</CardTitle>
          <CardDescription>
            {isSuperAdmin 
              ? "Visualización completa de todos los gastos registrados" 
              : "Gastos registrados por recepción"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left">Fecha</th>
                  <th className="py-3 px-4 text-left">Concepto</th>
                  <th className="py-3 px-4 text-left">Categoría</th>
                  <th className="py-3 px-4 text-right">Monto</th>
                  {isSuperAdmin && <th className="py-3 px-4 text-left">Registrado por</th>}
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(expense => (
                  <tr key={expense.id} className="border-b">
                    <td className="py-3 px-4">{expense.date}</td>
                    <td className="py-3 px-4">{expense.concept}</td>
                    <td className="py-3 px-4">{expense.category}</td>
                    <td className="py-3 px-4 text-right">${expense.amount.toLocaleString()}</td>
                    {isSuperAdmin && <td className="py-3 px-4">{expense.createdBy}</td>}
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">Ver</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
