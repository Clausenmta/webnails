
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { expenseCategories, Expense } from "@/types/expenses";

interface ExpenseCategoriesProps {
  filteredExpenses: Expense[];
  prevMonthExpenses: Expense[];
}

// Función para sumar montos por categoría
function calcSums(expenses: Expense[]) {
  const result: Record<string, number> = {};
  expenseCategories.forEach(cat => result[cat] = 0);
  expenses.forEach(exp => {
    if (result[exp.category] !== undefined) result[exp.category] += exp.amount;
  });
  return result;
}

export function ExpenseCategories({ filteredExpenses, prevMonthExpenses }: ExpenseCategoriesProps) {
  const thisMonth = calcSums(filteredExpenses);
  const prevMonth = calcSums(prevMonthExpenses);

  const total = Object.values(thisMonth).reduce((a, b) => a + b, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoría (Mes Actual)</CardTitle>
        <CardDescription>Desglose y comparativo con el mes anterior</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-left">Categoría</th>
                <th className="py-3 px-4 text-right">Monto Total</th>
                <th className="py-3 px-4 text-right">% del Total</th>
                <th className="py-3 px-4 text-right">Vs Mes Anterior</th>
              </tr>
            </thead>
            <tbody>
              {expenseCategories
                .map(cat => ({
                  cat,
                  value: thisMonth[cat],
                  prev: prevMonth[cat]
                }))
                .filter(({value}) => value > 0)
                .sort((a, b) => b.value - a.value)
                .map(({cat, value, prev}, index) => {
                  const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
                  let delta = 0;
                  if (prev > 0) {
                    delta = ((value - prev) / prev) * 100;
                  }
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{cat}</td>
                      <td className="py-3 px-4 text-right">${value.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">{percent}%</td>
                      <td className="py-3 px-4 text-right">
                        {prev > 0 ? (
                          <span className={delta >= 0 ? "text-rose-500" : "text-emerald-500"}>
                            {delta >= 0 ? "+" : "-"}{Math.abs(delta).toFixed(1)}%
                          </span>
                        ) : "-"}
                      </td>
                    </tr>
                  )
                })}
              <tr className="font-bold bg-muted/30">
                <td className="py-3 px-4">TOTAL</td>
                <td className="py-3 px-4 text-right">${total.toLocaleString()}</td>
                <td className="py-3 px-4 text-right">100%</td>
                <td className="py-3 px-4 text-right"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
