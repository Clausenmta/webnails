
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
              <TableRow>
                <TableCell>Estilista</TableCell>
                <TableCell className="text-center">{employeesByPosition["Estilista"] || 0}</TableCell>
                <TableCell className="text-right">$42,000</TableCell>
                <TableCell className="text-right">$84,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Manicurista</TableCell>
                <TableCell className="text-center">{employeesByPosition["Manicurista"] || 0}</TableCell>
                <TableCell className="text-right">$38,000</TableCell>
                <TableCell className="text-right">$76,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Recepcionista</TableCell>
                <TableCell className="text-center">{employeesByPosition["Recepcionista"] || 0}</TableCell>
                <TableCell className="text-right">$25,000</TableCell>
                <TableCell className="text-right">$25,000</TableCell>
              </TableRow>
              <TableRow className="font-bold">
                <TableCell>TOTAL</TableCell>
                <TableCell className="text-center">{activeEmployees}</TableCell>
                <TableCell className="text-right">-</TableCell>
                <TableCell className="text-right">$185,000</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
