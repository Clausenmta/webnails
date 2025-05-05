import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { es } from "date-fns/locale";
import { format, isSameDay, parseISO } from "date-fns";
import { CalendarX2, Plus, UserRound } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { absenceService, Absence } from "@/services/absenceService";
import AbsenceDialog from "@/components/absences/AbsenceDialog";
import { Employee } from "@/types/employees";

interface AbsenceCalendarProps {
  employees: Employee[];
  currentEmployeeId?: number;
}

export default function AbsenceCalendar({ employees, currentEmployeeId }: AbsenceCalendarProps) {
  const { isAuthorized, user } = useAuth();
  const queryClient = useQueryClient();
  
  const [date, setDate] = useState<Date>(new Date());
  const [isAddAbsenceOpen, setIsAddAbsenceOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
  const [selectedDateAbsences, setSelectedDateAbsences] = useState<Absence[]>([]);
  
  // Query for absences
  const { data: absences = [], isLoading } = useQuery({
    queryKey: ['absences', currentEmployeeId],
    queryFn: async () => {
      // If a specific employee is selected, fetch only their absences
      if (currentEmployeeId) {
        return await absenceService.getEmployeeAbsences(currentEmployeeId);
      }
      // Otherwise fetch all absences
      return await absenceService.fetchAbsences();
    },
    select: (data) => {
      return data.map(absence => {
        const employee = employees.find(emp => emp.id === absence.employee_id);
        return {
          ...absence,
          employee_name: employee?.name || 'Empleado desconocido'
        };
      });
    }
  });
  
  // Mutations
  const addAbsenceMutation = useMutation({
    mutationFn: absenceService.addAbsence,
    onSuccess: () => {
      toast.success("Ausencia registrada correctamente");
      queryClient.invalidateQueries({ queryKey: ['absences'] });
      setIsAddAbsenceOpen(false);
      setSelectedAbsence(null);
    }
  });

  const updateAbsenceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Absence> }) => 
      absenceService.updateAbsence(id, data),
    onSuccess: () => {
      toast.success("Ausencia actualizada correctamente");
      queryClient.invalidateQueries({ queryKey: ['absences'] });
      setIsAddAbsenceOpen(false);
      setSelectedAbsence(null);
    }
  });

  const deleteAbsenceMutation = useMutation({
    mutationFn: (id: number) => absenceService.deleteAbsence(id),
    onSuccess: () => {
      toast.success("Ausencia eliminada correctamente");
      queryClient.invalidateQueries({ queryKey: ['absences'] });
    }
  });
  
  // Effects
  useEffect(() => {
    if (date && absences.length > 0) {
      const filtered = absences.filter(absence => {
        const fechaInicio = parseISO(absence.fecha_inicio);
        const fechaFin = parseISO(absence.fecha_fin);
        
        // Check if the selected date falls between the start and end dates
        return (date >= fechaInicio && date <= fechaFin);
      });
      
      setSelectedDateAbsences(filtered);
    } else {
      setSelectedDateAbsences([]);
    }
  }, [date, absences]);
  
  // Handlers
  const handleAddAbsence = () => {
    setSelectedAbsence(null);
    setIsViewMode(false);
    setIsAddAbsenceOpen(true);
  };
  
  const handleViewAbsence = (absence: Absence) => {
    setSelectedAbsence(absence);
    setIsViewMode(true);
    setIsAddAbsenceOpen(true);
  };
  
  const handleEditAbsence = (absence: Absence) => {
    setSelectedAbsence(absence);
    setIsViewMode(false);
    setIsAddAbsenceOpen(true);
  };
  
  const handleDeleteAbsence = (id: number) => {
    if (confirm("¿Está seguro que desea eliminar esta ausencia?")) {
      deleteAbsenceMutation.mutate(id);
    }
  };
  
  const handleSaveAbsence = (absenceData: any) => {
    // If we're editing an existing absence
    if (selectedAbsence) {
      updateAbsenceMutation.mutate({
        id: selectedAbsence.id,
        data: absenceData
      });
    } else {
      // Creating a new absence
      addAbsenceMutation.mutate(absenceData);
    }
  };
  
  // Calendar day class modifier
  const getAbsenceTypeClass = (type: string) => {
    switch (type) {
      case "Vacaciones":
        return "bg-blue-100 text-blue-600";
      case "Enfermedad":
        return "bg-red-100 text-red-600";
      case "Licencia":
        return "bg-amber-100 text-amber-600";
      case "Ausencia justificada":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p>Cargando datos de ausencias...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="md:w-1/2">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Ausencias</CardTitle>
              <CardDescription>
                Registro de ausencias de empleados
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md border shadow-sm"
                locale={es}
                modifiers={{
                  absence: (date) => {
                    return absences.some(absence => {
                      const start = parseISO(absence.fecha_inicio);
                      const end = parseISO(absence.fecha_fin);
                      return date >= start && date <= end;
                    });
                  }
                }}
                modifiersClassNames={{
                  absence: "bg-red-100 text-red-800 font-medium"
                }}
              />
              
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={handleAddAbsence}
                  className="bg-salon-400 hover:bg-salon-500"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar Ausencia
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:w-1/2">
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
                              onClick={() => handleViewAbsence(absence)}
                            >
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditAbsence(absence)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAbsence(absence.id)}
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
        </div>
      </div>

      <AbsenceDialog 
        open={isAddAbsenceOpen}
        onOpenChange={setIsAddAbsenceOpen}
        employees={employees}
        absence={selectedAbsence}
        onSave={handleSaveAbsence}
        viewMode={isViewMode}
      />
    </div>
  );
}
