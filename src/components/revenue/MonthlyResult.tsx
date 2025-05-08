
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUp, ArrowDown, DollarSign, Percent, TrendingUp, TrendingDown } from "lucide-react";
interface MonthlyResultProps {
  totalRevenue: number;
  totalExpenses: number;
  prevMonthRevenue: number;
  prevMonthExpenses: number;
  isLoading: boolean;
}
export function MonthlyResult({
  totalRevenue,
  totalExpenses,
  prevMonthRevenue,
  prevMonthExpenses,
  isLoading
}: MonthlyResultProps) {
  // Calculate profit metrics
  const profit = totalRevenue - totalExpenses;
  const prevMonthProfit = prevMonthRevenue - prevMonthExpenses;

  // Calculate profit percentage of total revenue
  const profitPercentage = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  // Calculate percentage change compared to previous month
  const profitChange = prevMonthProfit !== 0 ? (profit - prevMonthProfit) / Math.abs(prevMonthProfit) * 100 : 0;

  // Calculate revenue change compared to previous month
  const revenueChange = prevMonthRevenue !== 0 ? (totalRevenue - prevMonthRevenue) / prevMonthRevenue * 100 : 0;

  // Calculate expenses change compared to previous month
  const expensesChange = prevMonthExpenses !== 0 ? (totalExpenses - prevMonthExpenses) / prevMonthExpenses * 100 : 0;
  return <Card>
      <CardHeader>
        <CardTitle>Resultado Mensual</CardTitle>
        <CardDescription>Resumen de ingresos, gastos y ganancia del periodo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-salon-400" />
              <h3 className="text-sm font-medium">Ingresos Totales</h3>
            </div>
            <p className="text-2xl font-bold">$ {totalRevenue.toLocaleString()}</p>
            <div className="flex items-center mt-1">
              {revenueChange >= 0 ? <div className="flex items-center text-xs text-emerald-500">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>{Math.abs(revenueChange).toFixed(1)}% vs mes anterior</span>
                </div> : <div className="flex items-center text-xs text-rose-500">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  <span>{Math.abs(revenueChange).toFixed(1)}% vs mes anterior</span>
                </div>}
            </div>
          </div>
          
          {/* Total Expenses */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-salon-400" />
              <h3 className="text-sm font-medium">Gastos Totales</h3>
            </div>
            <p className="text-2xl font-bold">$ {totalExpenses.toLocaleString()}</p>
            <div className="flex items-center mt-1">
              {expensesChange <= 0 ? <div className="flex items-center text-xs text-emerald-500">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  <span>{Math.abs(expensesChange).toFixed(1)}% vs mes anterior</span>
                </div> : <div className="flex items-center text-xs text-rose-500">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>{Math.abs(expensesChange).toFixed(1)}% vs mes anterior</span>
                </div>}
            </div>
          </div>
          
          {/* Total Profit */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-salon-400" />
              <h3 className="text-sm font-medium">Resultado</h3>
            </div>
            <p className={`text-2xl font-bold ${profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              $ {profit.toLocaleString()}
            </p>
            <div className="flex items-center mt-1">
              {profitChange >= 0 ? <div className="flex items-center text-xs text-emerald-500">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>{Math.abs(profitChange).toFixed(1)}% vs mes anterior</span>
                </div> : <div className="flex items-center text-xs text-rose-500">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  <span>{Math.abs(profitChange).toFixed(1)}% vs mes anterior</span>
                </div>}
            </div>
          </div>
          
          {/* Profit Percentage */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-5 w-5 text-salon-400" />
              <h3 className="text-sm font-medium">Rentabilidad</h3>
            </div>
            <p className={`text-2xl font-bold ${profitPercentage >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              {profitPercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              % de los ingresos totales
            </p>
          </div>
        </div>
      </CardContent>
    </Card>;
}
