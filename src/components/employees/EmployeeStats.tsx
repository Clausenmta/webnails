
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Employee } from "@/types/employees";

interface PositionSummary {
  count: number;
  totalBilling: number;
  avgBilling: number;
}

interface EmployeeStatsProps {
  employees: Employee[];
  positionSummary: Record<string, PositionSummary>;
}

export function EmployeeStats({ employees, positionSummary }: EmployeeStatsProps) {
  // Asegurar que todos los valores de positionSummary estén actualizados
  const activeEmployees = employees.filter(e => e.status === "active");
  
  // Recalcular los promedios para asegurarnos de que son correctos
  Object.keys(positionSummary).forEach(position => {
    const positionEmployees = activeEmployees.filter(e => e.position === position);
    positionSummary[position].count = positionEmployees.length;
    
    // Recalcular la facturación total
    const totalBilling = positionEmployees.reduce((sum, emp) => sum + (emp.currentMonthBilling || 0), 0);
    positionSummary[position].totalBilling = totalBilling;
    
    // Recalcular el promedio
    positionSummary[position].avgBilling = positionEmployees.length > 0 
      ? totalBilling / positionEmployees.length 
      : 0;
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total Empleados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{employees.length}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {activeEmployees.length} activos,{" "}
            {employees.filter(e => e.status === "inactive").length} inactivos
          </p>
        </CardContent>
      </Card>
      
      {Object.entries(positionSummary).map(([position, data]) => (
        <Card key={position}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {position}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.count}</div>
            <div className="flex flex-col mt-1">
              <p className="text-xs text-muted-foreground">
                Facturación Total: ${data.totalBilling.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Promedio: ${data.avgBilling.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
