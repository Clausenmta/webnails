
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense, expenseCategories } from "@/types/expenses";

interface ExpenseCategoriesProps {
  expenses: Expense[];
}

export function ExpenseCategories({ expenses }: ExpenseCategoriesProps) {
  // Gastos por categoría (para el mes actual)
  const expensesByCategory = expenseCategories.map(category => {
    const total = expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      category,
      amount: total
    };
  });

  const totalExpenses = expensesByCategory.reduce((total, cat) => total + cat.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoría (Mes Actual)</CardTitle>
        <CardDescription>
          Desglose de gastos agrupados por categoría
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-left">Categoría</th>
                <th className="py-3 px-4 text-right">Monto Total</th>
                <th className="py-3 px-4 text-right">% del Total</th>
              </tr>
            </thead>
            <tbody>
              {expensesByCategory
                .filter(cat => cat.amount > 0)
                .sort((a, b) => b.amount - a.amount)
                .map((category, index) => {
                  const percentage = totalExpenses > 0 
                    ? ((category.amount / totalExpenses) * 100).toFixed(1) 
                    : "0.0";
                  
                  return (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">{category.category}</td>
                      <td className="py-3 px-4 text-right">${category.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">{percentage}%</td>
                    </tr>
                  );
                })}
                <tr className="font-bold bg-muted/30">
                  <td className="py-3 px-4">TOTAL</td>
                  <td className="py-3 px-4 text-right">
                    ${totalExpenses.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">100%</td>
                </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
