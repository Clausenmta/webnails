
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
  const { isAuthorized, user } = useAuth();
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
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-left whitespace-nowrap">Fecha</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Concepto</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Categoría</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Proveedor</th>
                <th className="py-3 px-4 text-left whitespace-nowrap">Medio de Pago</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Monto</th>
                {isSuperAdmin && <th className="py-3 px-4 text-left whitespace-nowrap">Registrado por</th>}
                <th className="py-3 px-4 text-right whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <tr key={expense.id} className="border-b">
                  <td className="py-3 px-4 whitespace-nowrap">{expense.date}</td>
                  <td className="py-3 px-4 max-w-[150px] truncate">{expense.concept}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{expense.category}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{expense.provider || "-"}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{expense.payment_method || "-"}</td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">${expense.amount.toLocaleString()}</td>
                  {isSuperAdmin && <td className="py-3 px-4 whitespace-nowrap">{expense.created_by}</td>}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onViewExpense(expense)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Ver</span>
                      </Button>
                      {(isSuperAdmin || (!isSuperAdmin && user?.username === expense.created_by)) && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onDeleteExpense(expense)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Eliminar</span>
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
