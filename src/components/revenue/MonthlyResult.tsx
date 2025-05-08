
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ArrowUp, 
  ArrowDown,
  TrendingUp,
  DollarSign,
  Percent
} from "lucide-react";
import { format } from "date-fns";

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
  const profitPercentage = totalRevenue > 0 
    ? (profit / totalRevenue) * 100 
    : 0;
  
  // Calculate percentage change compared to previous month
  const profitChange = prevMonthProfit !== 0 
    ? ((profit - prevMonthProfit) / Math.abs(prevMonthProfit)) * 100 
    : 0;
  
  // Calculate daily average and projected profit
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();
  
  // Calculate daily average based on data so far
  const dailyAverage = currentDay > 0 ? profit / currentDay : 0;
  
  // Project the month-end profit based on daily average
  const projectedProfit = dailyAverage * daysInMonth;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultado Mensual</CardTitle>
        <CardDescription>Ganancia del periodo y proyección</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Profit */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-salon-400" />
              <h3 className="text-sm font-medium">Ganancia Total</h3>
            </div>
            <p className="text-2xl font-bold">$ {profit.toLocaleString()}</p>
          </div>
          
          {/* Profit Percentage */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-5 w-5 text-salon-400" />
              <h3 className="text-sm font-medium">% de los Ingresos</h3>
            </div>
            <p className="text-2xl font-bold">{profitPercentage.toFixed(1)}%</p>
          </div>
          
          {/* Change vs Previous Month */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {profitChange >= 0 ? (
                <ArrowUp className="h-5 w-5 text-emerald-500" />
              ) : (
                <ArrowDown className="h-5 w-5 text-rose-500" />
              )}
              <h3 className="text-sm font-medium">vs Mes Anterior</h3>
            </div>
            <div className="flex items-center">
              <p className={`text-2xl font-bold ${profitChange >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                {Math.abs(profitChange).toFixed(1)}%
              </p>
            </div>
          </div>
          
          {/* Projected Profit */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-salon-400" />
              <h3 className="text-sm font-medium">Proyección al {format(new Date(today.getFullYear(), today.getMonth() + 1, 0), "dd/MM")}</h3>
            </div>
            <p className="text-2xl font-bold">$ {projectedProfit.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
