
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Employee } from "@/types/employees";

interface SalarySummaryProps {
  employees: Employee[];
  employeesByPosition: Record<string, number>;
  activeEmployees: number;
}

export function SalarySummary({ 
  employees, 
  employeesByPosition, 
  activeEmployees 
}: SalarySummaryProps) {
  // Recalcular los conteos por posición para asegurar precisión
  const recalculatedEmployeesByPosition: Record<string, number> = {};
  
  employees
    .filter(employee => employee.status === "active")
    .forEach(employee => {
      recalculatedEmployeesByPosition[employee.position] = 
        (recalculatedEmployeesByPosition[employee.position] || 0) + 1;
    });
  
  // Calculate averages and totals by position from actual employee data
  const positionSalaries: Record<string, { total: number, count: number }> = {};
  
  // Group all active employees by position and calculate totals
  employees.forEach(employee => {
    if (employee.status === "active" && employee.salary) {
      if (!positionSalaries[employee.position]) {
        positionSalaries[employee.position] = { total: 0, count: 0 };
      }
      positionSalaries[employee.position].total += employee.salary;
      positionSalaries[employee.position].count += 1;
    }
  });
  
  // Calculate total salary across all positions
  const totalMonthlySalary = Object.values(positionSalaries).reduce(
    (sum, { total }) => sum + total, 
    0
  );
  
  // Helper function to calculate average
  const calculateAverage = (total: number, count: number) => {
    return count > 0 ? total / count : 0;
  };

  // Calculamos el total de empleados activos para verificación
  const actualActiveEmployees = employees.filter(emp => emp.status === "active").length;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Desglose de Sueldos</CardTitle>
        <CardDescription>
          Resumen de sueldos por posición
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Posición</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Promedio Mensual</TableHead>
                <TableHead className="text-right">Total Mensual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Generar filas dinámicamente para cada posición */}
              {Object.keys(recalculatedEmployeesByPosition).map(position => (
                <TableRow key={position}>
                  <TableCell>{position}</TableCell>
                  <TableCell className="text-center">{recalculatedEmployeesByPosition[position]}</TableCell>
                  <TableCell className="text-right">
                    ${calculateAverage(
                      positionSalaries[position]?.total || 0,
                      positionSalaries[position]?.count || 0
                    ).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ${(positionSalaries[position]?.total || 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Total row */}
              <TableRow className="font-bold">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-center">{actualActiveEmployees}</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">${totalMonthlySalary.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
