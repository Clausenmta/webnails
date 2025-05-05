
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CalendarX2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Absence } from "@/services/absenceService";
import { Employee } from "@/types/employees";

interface AbsenceListProps {
  absences: Absence[];
  employees: Employee[];
  onView: (absence: Absence) => void;
  onEdit: (absence: Absence) => void;
  onDelete: (id: number) => void;
}

export default function AbsenceList({ 
  absences, 
  employees, 
  onView, 
  onEdit, 
  onDelete 
}: AbsenceListProps) {
  // Helper function to get employee name from ID
  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : "Empleado desconocido";
  };

  const sortedAbsences = [...absences].sort((a, b) => {
    return new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime();
  });

  const getBadgeClass = (tipoAusencia: string) => {
    switch (tipoAusencia) {
      case "Vacaciones":
        return "bg-blue-100 text-blue-800";
      case "Enfermedad":
        return "bg-red-100 text-red-800";
      case "Licencia":
        return "bg-amber-100 text-amber-800";
      case "Ausencia justificada":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de Ausencias</CardTitle>
      </CardHeader>
      <CardContent>
        {absences.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead>Hasta</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAbsences.map((absence) => (
                  <TableRow key={absence.id}>
                    <TableCell>{absence.employee_name || getEmployeeName(absence.employee_id)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeClass(absence.tipo_ausencia)}`}>
                        {absence.tipo_ausencia}
                      </span>
                    </TableCell>
                    <TableCell>{format(parseISO(absence.fecha_inicio), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{format(parseISO(absence.fecha_fin), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="max-w-xs truncate">{absence.observaciones || "-"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(absence)}
                        >
                          Ver
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(absence)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(absence.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarX2 className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              No hay ausencias registradas con los filtros actuales
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
