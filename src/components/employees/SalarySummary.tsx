
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

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Desglose de Sueldos</CardTitle>
        <CardDescription>
          Resumen de sueldos por posición
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
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
              {/* Estilista row */}
              <TableRow>
                <TableCell>Estilista</TableCell>
                <TableCell className="text-center">{employeesByPosition["Estilista"] || 0}</TableCell>
                <TableCell className="text-right">
                  ${calculateAverage(
                    positionSalaries["Estilista"]?.total || 0,
                    positionSalaries["Estilista"]?.count || 0
                  ).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  ${(positionSalaries["Estilista"]?.total || 0).toLocaleString()}
                </TableCell>
              </TableRow>
              
              {/* Manicurista row */}
              <TableRow>
                <TableCell>Manicurista</TableCell>
                <TableCell className="text-center">{employeesByPosition["Manicurista"] || 0}</TableCell>
                <TableCell className="text-right">
                  ${calculateAverage(
                    positionSalaries["Manicurista"]?.total || 0,
                    positionSalaries["Manicurista"]?.count || 0
                  ).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  ${(positionSalaries["Manicurista"]?.total || 0).toLocaleString()}
                </TableCell>
              </TableRow>
              
              {/* Recepcionista row */}
              <TableRow>
                <TableCell>Recepcionista</TableCell>
                <TableCell className="text-center">{employeesByPosition["Recepcionista"] || 0}</TableCell>
                <TableCell className="text-right">
                  ${calculateAverage(
                    positionSalaries["Recepcionista"]?.total || 0,
                    positionSalaries["Recepcionista"]?.count || 0
                  ).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  ${(positionSalaries["Recepcionista"]?.total || 0).toLocaleString()}
                </TableCell>
              </TableRow>
              
              {/* Total row */}
              <TableRow className="font-bold">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-center">{activeEmployees}</TableCell>
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
