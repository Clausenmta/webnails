
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarX2, UserRound } from "lucide-react";
import { Absence } from "@/services/absenceService";

interface EmployeeAbsenceDetailsProps {
  date: Date;
  selectedDateAbsences: Absence[];
  onViewAbsence: (absence: Absence) => void;
  onEditAbsence: (absence: Absence) => void;
  onDeleteAbsence: (id: number) => void;
}

export function EmployeeAbsenceDetails({
  date,
  selectedDateAbsences,
  onViewAbsence,
  onEditAbsence,
  onDeleteAbsence
}: EmployeeAbsenceDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Ausencias del {format(date, "d 'de' MMMM, yyyy", { locale: es })}
        </CardTitle>
        <CardDescription>
          {selectedDateAbsences.length > 0
            ? `${selectedDateAbsences.length} ausencias registradas`
            : "No hay ausencias registradas para esta fecha"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedDateAbsences.length > 0 ? (
          <div className="space-y-4">
            {selectedDateAbsences.map(absence => (
              <div
                key={absence.id}
                className="flex items-start gap-4 p-4 border rounded-md"
              >
                <div className={`p-2 rounded-full ${
                  absence.tipo_ausencia === "Vacaciones" ? "bg-blue-100" :
                  absence.tipo_ausencia === "Enfermedad" ? "bg-red-100" :
                  absence.tipo_ausencia === "Licencia" ? "bg-amber-100" :
                  absence.tipo_ausencia === "Ausencia justificada" ? "bg-green-100" :
                  "bg-gray-100"
                }`}>
                  <CalendarX2 className={`h-5 w-5 ${
                    absence.tipo_ausencia === "Vacaciones" ? "text-blue-600" :
                    absence.tipo_ausencia === "Enfermedad" ? "text-red-600" :
                    absence.tipo_ausencia === "Licencia" ? "text-amber-600" :
                    absence.tipo_ausencia === "Ausencia justificada" ? "text-green-600" :
                    "text-gray-600"
                  }`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium flex items-center">
                        <UserRound className="h-4 w-4 mr-1" />
                        {absence.employee_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {absence.tipo_ausencia}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(absence.fecha_inicio), "dd/MM/yyyy")} - 
                        {format(parseISO(absence.fecha_fin), "dd/MM/yyyy")}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewAbsence(absence)}
                      >
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditAbsence(absence)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteAbsence(absence.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                  
                  {absence.observaciones && (
                    <p className="mt-2 text-sm border-t pt-2">
                      {absence.observaciones}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarX2 className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              No hay ausencias registradas para esta fecha
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
