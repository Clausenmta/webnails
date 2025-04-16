
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock } from "lucide-react";
import { Expense } from "@/types/expenses";
import { addDays, isAfter, isBefore } from "date-fns";

interface UpcomingExpensesProps {
  expenses: Expense[];
}

export function UpcomingExpenses({ expenses }: UpcomingExpensesProps) {
  // Gastos próximos a vencer
  const upcomingExpenses = expenses
    .filter(expense => expense.due_date && expense.status === "pending")
    .sort((a, b) => {
      // Convertir fechas de vencimiento para comparación
      const dateA = a.due_date ? a.due_date.split('/').reverse().join('-') : '';
      const dateB = b.due_date ? b.due_date.split('/').reverse().join('-') : '';
      return dateA.localeCompare(dateB);
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos Próximos a Vencer</CardTitle>
        <CardDescription>
          Pagos pendientes ordenados por fecha de vencimiento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-left">Concepto</th>
                <th className="py-3 px-4 text-left">Proveedor</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-center">Vencimiento</th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {upcomingExpenses.map(expense => {
                // Convertir fecha de vencimiento a objeto Date
                const parts = expense.due_date ? expense.due_date.split('/') : [];
                const dueDate = parts.length === 3 
                  ? new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])) 
                  : new Date();
                
                // Calcular si está próximo a vencer (menos de 7 días)
                const today = new Date();
                const isCloseToDue = isBefore(dueDate, addDays(today, 7));
                const isPastDue = isBefore(dueDate, today);
                
                return (
                  <tr key={expense.id} className={`border-b ${isPastDue ? 'bg-red-50' : (isCloseToDue ? 'bg-amber-50' : '')}`}>
                    <td className="py-3 px-4">{expense.concept}</td>
                    <td className="py-3 px-4">{expense.provider || "-"}</td>
                    <td className="py-3 px-4 text-right">${expense.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {expense.due_date}
                        {isPastDue && (
                          <AlertTriangle className="ml-2 h-4 w-4 text-red-500" />
                        )}
                        {!isPastDue && isCloseToDue && (
                          <Clock className="ml-2 h-4 w-4 text-amber-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        expense.status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {expense.status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {upcomingExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No hay gastos próximos a vencer
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
