
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Trash2 } from "lucide-react";
import { Expense } from "@/types/expenses";
import { useAuth } from "@/contexts/AuthContext";

interface ExpenseListProps {
  expenses: Expense[];
  onViewExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
}

export function ExpenseList({ expenses, onViewExpense, onDeleteExpense }: ExpenseListProps) {
  const { isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');

  return (
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
                <th className="py-3 px-4 text-left">Proveedor</th>
                <th className="py-3 px-4 text-left">Medio de Pago</th>
                <th className="py-3 px-4 text-right">Monto</th>
                {isSuperAdmin && <th className="py-3 px-4 text-left">Registrado por</th>}
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <tr key={expense.id} className="border-b">
                  <td className="py-3 px-4">{expense.date}</td>
                  <td className="py-3 px-4">{expense.concept}</td>
                  <td className="py-3 px-4">{expense.category}</td>
                  <td className="py-3 px-4">{expense.provider || "-"}</td>
                  <td className="py-3 px-4">{expense.payment_method || "-"}</td>
                  <td className="py-3 px-4 text-right">${expense.amount.toLocaleString()}</td>
                  {isSuperAdmin && <td className="py-3 px-4">{expense.created_by}</td>}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onViewExpense(expense)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      {isSuperAdmin && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDeleteExpense(expense)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={isSuperAdmin ? 8 : 7} className="py-8 text-center text-muted-foreground">
                    No hay gastos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
