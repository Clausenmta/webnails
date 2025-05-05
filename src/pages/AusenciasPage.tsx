
import { useState, useEffect } from "react";
import { format, isSameDay, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { absenceService, type Absence } from "@/services/absenceService";
import { employeeService } from "@/services/employeeService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarX2, Plus, UserRound } from "lucide-react";
import AbsenceDialog from "@/components/absences/AbsenceDialog";
import AbsenceList from "@/components/absences/AbsenceList";
import AbsenceFilters from "@/components/absences/AbsenceFilters";
import { Employee } from "@/types/employees";

export default function AusenciasPage() {
  const { isAuthorized } = useAuth();
  const queryClient = useQueryClient();
  
  // State
  const [date, setDate] = useState<Date>(new Date());
  const [isAddAbsenceOpen, setIsAddAbsenceOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(true);
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
  const [selectedDateAbsences, setSelectedDateAbsences] = useState<Absence[]>([]);
  
  // Filters
  const [filters, setFilters] = useState({
    employeeId: null as number | null,
    tipoAusencia: null as string | null,
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  });

  // Queries
  const { data: employees = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ['employees'],
    queryFn: employeeService.fetchEmployees,
    select: (data) => {
      return data.map(emp => ({
        id: emp.id,
        name: emp.name,
        position: emp.position,
        joinDate: emp.hire_date,
        email: emp.email,
        status: emp.status as "active" | "inactive",
        contact: emp.phone,
        salary: emp.salary,
        phone: emp.phone,
        address: emp.address,
        currentMonthBilling: 0,
        billingAverage: 0,
        documents: []
      })) as Employee[];
    }
  });

  const { data: absences = [], isLoading: isLoadingAbsences } = useQuery({
    queryKey: ['absences'],
    queryFn: absenceService.fetchAbsences,
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

  // Apply filters to absences
  const filteredAbsences = absences.filter(absence => {
    let matchesEmployee = true;
    let matchesType = true;
    
    if (filters.employeeId !== null) {
      matchesEmployee = absence.employee_id === filters.employeeId;
    }
    
    if (filters.tipoAusencia !== null) {
      matchesType = absence.tipo_ausencia === filters.tipoAusencia;
    }
    
    return matchesEmployee && matchesType;
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

  const handleEditAbsence = (absence: Absence) => {
    setSelectedAbsence(absence);
    setIsViewMode(false);
    setIsAddAbsenceOpen(true);
  };

  const handleViewAbsence = (absence: Absence) => {
    setSelectedAbsence(absence);
    setIsViewMode(true);
    setIsAddAbsenceOpen(true);
  };

  const handleDeleteAbsence = (id: number) => {
    if (confirm("¿Está seguro que desea eliminar esta ausencia?")) {
      deleteAbsenceMutation.mutate(id);
    }
  };

  const handleSaveAbsence = (absenceData: any) => {
    if (selectedAbsence) {
      // Update existing absence
      updateAbsenceMutation.mutate({
        id: selectedAbsence.id,
        data: absenceData
      });
    } else {
      // Create new absence
      addAbsenceMutation.mutate(absenceData);
    }
  };

  // Calendar day class modifier
  const getDayClass = (day: Date) => {
    const hasAbsence = absences.some(absence => {
      const fechaInicio = parseISO(absence.fecha_inicio);
      const fechaFin = parseISO(absence.fecha_fin);
      return (day >= fechaInicio && day <= fechaFin);
    });
    
    if (hasAbsence) {
      return "bg-red-100 hover:bg-red-200 text-red-700";
    }
    
    return undefined;
  };

  // Group absences by date for the calendar view
  const absencesByDate = absences.reduce((acc, absence) => {
    const start = parseISO(absence.fecha_inicio);
    const end = parseISO(absence.fecha_fin);
    
    // Create a date range
    let currentDate = start;
    while (currentDate <= end) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      
      if (!acc[dateString]) {
        acc[dateString] = [];
      }
      
      acc[dateString].push(absence);
      
      // Move to next day
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return acc;
  }, {} as Record<string, Absence[]>);

  // Loading state
  if (isLoadingEmployees || isLoadingAbsences) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ausencias</h2>
          <p className="text-muted-foreground">
            Gestión de ausencias de empleados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleAddAbsence}
            className="bg-salon-600 hover:bg-salon-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Registrar Ausencia
          </Button>
        </div>
      </div>

      <AbsenceFilters 
        employees={employees} 
        filters={filters}
        setFilters={setFilters}
      />

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="list">Listado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start">
            <div className="md:w-1/2">
              <Card>
                <CardHeader>
                  <CardTitle>Calendario de Ausencias</CardTitle>
                  <CardDescription>
                    Registro visual de ausencias de empleados
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
                        const dateString = format(date, 'yyyy-MM-dd');
                        return !!absencesByDate[dateString];
                      }
                    }}
                    modifiersClassNames={{
                      absence: "bg-red-100 text-red-800 font-medium"
                    }}
                  />
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
        </TabsContent>
        
        <TabsContent value="list">
          <AbsenceList 
            absences={filteredAbsences}
            employees={employees}
            onView={handleViewAbsence}
            onEdit={handleEditAbsence}
            onDelete={handleDeleteAbsence}
          />
        </TabsContent>
      </Tabs>

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
