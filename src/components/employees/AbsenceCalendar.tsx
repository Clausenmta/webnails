
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { es } from "date-fns/locale";
import { format, isSameDay } from "date-fns";
import { CalendarX2, Plus, UserRound } from "lucide-react";

interface Absence {
  id: number;
  employeeId: number;
  employeeName: string;
  date: Date;
  type: "vacation" | "sick" | "personal" | "other";
  description: string;
}

interface Employee {
  id: number;
  name: string;
  position: string;
}

interface AbsenceCalendarProps {
  employees: Employee[];
}

export default function AbsenceCalendar({ employees }: AbsenceCalendarProps) {
  const { isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  
  const [date, setDate] = useState<Date>(new Date());
  const [absences, setAbsences] = useState<Absence[]>([
    { 
      id: 1, 
      employeeId: 1, 
      employeeName: "María García", 
      date: new Date(2025, 3, 15), 
      type: "vacation",
      description: "Vacaciones programadas" 
    },
    { 
      id: 2, 
      employeeId: 2, 
      employeeName: "Laura Martínez", 
      date: new Date(2025, 3, 20), 
      type: "sick",
      description: "Licencia médica" 
    },
    { 
      id: 3, 
      employeeId: 3, 
      employeeName: "Juan Pérez", 
      date: new Date(2025, 3, 8), 
      type: "personal",
      description: "Trámites personales" 
    }
  ]);
  
  const [isAddAbsenceOpen, setIsAddAbsenceOpen] = useState(false);
  const [selectedDateAbsences, setSelectedDateAbsences] = useState<Absence[]>([]);
  const [newAbsence, setNewAbsence] = useState<Omit<Absence, 'id'>>({
    employeeId: employees[0]?.id || 0,
    employeeName: employees[0]?.name || "",
    date: new Date(),
    type: "vacation",
    description: ""
  });
  
  // Tipos de ausencia
  const absenceTypes = [
    { value: "vacation", label: "Vacaciones" },
    { value: "sick", label: "Enfermedad" },
    { value: "personal", label: "Personal" },
    { value: "other", label: "Otro" }
  ];
  
  useEffect(() => {
    // Actualizar ausencias seleccionadas cuando cambia la fecha
    const filtered = absences.filter(absence => 
      isSameDay(absence.date, date)
    );
    setSelectedDateAbsences(filtered);
  }, [date, absences]);
  
  const handleAddAbsence = () => {
    // Crear nueva ausencia
    const id = Math.max(0, ...absences.map(a => a.id)) + 1;
    
    // Buscar el nombre del empleado
    const employee = employees.find(e => e.id === newAbsence.employeeId);
    const employeeName = employee ? employee.name : "Empleado";
    
    const absenceToAdd: Absence = {
      ...newAbsence,
      id,
      employeeName
    };
    
    setAbsences([...absences, absenceToAdd]);
    
    // Resetear formulario
    setNewAbsence({
      employeeId: employees[0]?.id || 0,
      employeeName: employees[0]?.name || "",
      date: new Date(),
      type: "vacation",
      description: ""
    });
    
    setIsAddAbsenceOpen(false);
    toast.success("Ausencia registrada correctamente");
  };
  
  const handleDeleteAbsence = (id: number) => {
    setAbsences(absences.filter(absence => absence.id !== id));
    toast.success("Ausencia eliminada correctamente");
  };
  
  // Función para colorear fechas con ausencias
  const getDayClass = (day: Date) => {
    const hasAbsence = absences.some(absence => isSameDay(absence.date, day));
    
    if (hasAbsence) {
      return "bg-red-100 hover:bg-red-200 text-red-700";
    }
    
    return undefined;
  };

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
                  absence: (date) => absences.some(absence => isSameDay(absence.date, date))
                }}
                modifiersClassNames={{
                  absence: "bg-red-100 text-red-800 font-medium"
                }}
              />
              
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => setIsAddAbsenceOpen(true)}
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
                        absence.type === "vacation" ? "bg-blue-100" :
                        absence.type === "sick" ? "bg-red-100" :
                        absence.type === "personal" ? "bg-amber-100" : "bg-gray-100"
                      }`}>
                        {absence.type === "vacation" ? (
                          <CalendarX2 className="h-5 w-5 text-blue-600" />
                        ) : absence.type === "sick" ? (
                          <CalendarX2 className="h-5 w-5 text-red-600" />
                        ) : (
                          <CalendarX2 className="h-5 w-5 text-amber-600" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium flex items-center">
                              <UserRound className="h-4 w-4 mr-1" />
                              {absence.employeeName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {absenceTypes.find(t => t.value === absence.type)?.label || absence.type}
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAbsence(absence.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Eliminar
                          </Button>
                        </div>
                        
                        {absence.description && (
                          <p className="mt-2 text-sm border-t pt-2">
                            {absence.description}
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
      
      {/* Dialog para agregar ausencia */}
      <Dialog open={isAddAbsenceOpen} onOpenChange={setIsAddAbsenceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Ausencia</DialogTitle>
            <DialogDescription>
              Completa los detalles para registrar una ausencia.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employee">Empleado</Label>
              <Select
                value={newAbsence.employeeId.toString()}
                onValueChange={(value) => setNewAbsence({ ...newAbsence, employeeId: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar empleado" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id.toString()}>
                      {employee.name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={format(newAbsence.date, "yyyy-MM-dd")}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : new Date();
                  setNewAbsence({ ...newAbsence, date });
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Ausencia</Label>
              <Select
                value={newAbsence.type}
                onValueChange={(value) => 
                  setNewAbsence({ 
                    ...newAbsence, 
                    type: value as "vacation" | "sick" | "personal" | "other" 
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {absenceTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={newAbsence.description}
                onChange={(e) => setNewAbsence({ ...newAbsence, description: e.target.value })}
                placeholder="Detalles adicionales de la ausencia"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAbsenceOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddAbsence}
              className="bg-salon-400 hover:bg-salon-500"
            >
              Registrar Ausencia
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
