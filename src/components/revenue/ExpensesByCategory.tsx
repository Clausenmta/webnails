
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface ExpensesByCategoryProps {
  expenseDataByCategory: {
    categoria: string;
    monto: number;
    montoPrevMes: number;
  }[];
  isLoading: boolean;
}

export function ExpensesByCategory({ expenseDataByCategory, isLoading }: ExpensesByCategoryProps) {
  // Filtrar la categoría "Ingresos" y recalcular el total
  const filteredExpenses = expenseDataByCategory.filter(item => item.categoria !== "Ingresos");
  const totalExpense = filteredExpenses.reduce((sum, item) => sum + item.monto, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoría</CardTitle>
        <CardDescription>Desglose y comparativo con el mes anterior</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Categoría</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Monto Total</TableHead>
                  <TableHead className="text-right whitespace-nowrap">% del Total</TableHead>
                  <TableHead className="text-right whitespace-nowrap">Vs Mes Anterior</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses
                    .sort((a, b) => b.monto - a.monto)
                    .map((item, index) => {
                      const percent = totalExpense > 0 ? ((item.monto / totalExpense) * 100).toFixed(1) : "0.0";
                      
                      let delta = 0;
                      if (item.montoPrevMes > 0) {
                        delta = ((item.monto - item.montoPrevMes) / item.montoPrevMes) * 100;
                      }

                      return (
                        <TableRow key={index}>
                          <TableCell className="whitespace-nowrap">{item.categoria}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">$ {item.monto.toLocaleString()}</TableCell>
                          <TableCell className="text-right whitespace-nowrap">{percent}%</TableCell>
                          <TableCell className="text-right whitespace-nowrap">
                            {item.montoPrevMes > 0 ? (
                              <span className={delta >= 0 ? "text-rose-500" : "text-emerald-500"}>
                                {delta >= 0 ? "+" : "-"}{Math.abs(delta).toFixed(1)}%
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No hay datos de gastos para el periodo seleccionado
                      </TableCell>
                    </TableRow>
                  )
                }
                {filteredExpenses.length > 0 && (
                  <TableRow className="font-bold bg-muted/30">
                    <TableCell className="whitespace-nowrap">TOTAL</TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      $ {totalExpense.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">100%</TableCell>
                    <TableCell className="text-right"></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
