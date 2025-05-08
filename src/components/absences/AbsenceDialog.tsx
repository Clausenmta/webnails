
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Employee } from "@/types/employees";
import { useAuth } from "@/contexts/AuthContext";
import { Absence } from "@/services/absenceService";
import { useQuery } from "@tanstack/react-query";
import { absenceTypeService, TipoAusenciaEnum } from "@/services/absenceTypeService";

interface AbsenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  absence: Absence | null;
  onSave: (absenceData: any) => void;
  viewMode?: boolean;
}

export default function AbsenceDialog({ 
  open, 
  onOpenChange, 
  employees,
  absence,
  onSave,
  viewMode = false
}: AbsenceDialogProps) {
  const { user } = useAuth();
  
  // Fetch absence types from the database
  const { data: absenceTypes = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['absenceTypes'],
    queryFn: absenceTypeService.fetchAbsenceTypes
  });
  
  const [formData, setFormData] = useState({
    employee_id: 0,
    tipo_ausencia: "" as TipoAusenciaEnum | "",
    fecha_inicio: new Date(),
    fecha_fin: new Date(),
    observaciones: ""
  });

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open && absence) {
      setFormData({
        employee_id: absence.employee_id,
        tipo_ausencia: absence.tipo_ausencia,
        fecha_inicio: parseISO(absence.fecha_inicio),
        fecha_fin: parseISO(absence.fecha_fin),
        observaciones: absence.observaciones || ""
      });
    } else if (open) {
      // Default values for new absence
      setFormData({
        employee_id: employees.length > 0 ? employees[0].id : 0,
        tipo_ausencia: absenceTypes.length > 0 ? absenceTypes[0].nombre : "" as TipoAusenciaEnum | "",
        fecha_inicio: new Date(),
        fecha_fin: new Date(),
        observaciones: ""
      });
    }
  }, [open, absence, employees, absenceTypes]);

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.employee_id) {
      toast.error("Debe seleccionar un empleado");
      return;
    }

    if (!formData.tipo_ausencia) {
      toast.error("Debe seleccionar un tipo de ausencia");
      return;
    }

    if (!formData.fecha_inicio || !formData.fecha_fin) {
      toast.error("Debe seleccionar las fechas de inicio y fin");
      return;
    }

    if (formData.fecha_fin < formData.fecha_inicio) {
      toast.error("La fecha de fin no puede ser anterior a la fecha de inicio");
      return;
    }

    if (!formData.tipo_ausencia) {
      toast.error("Debe seleccionar un tipo de ausencia válido");
      return;
    }

    const absenceData = {
      employee_id: formData.employee_id,
      tipo_ausencia: formData.tipo_ausencia as TipoAusenciaEnum,
      fecha_inicio: format(formData.fecha_inicio, 'yyyy-MM-dd'),
      fecha_fin: format(formData.fecha_fin, 'yyyy-MM-dd'),
      observaciones: formData.observaciones,
      created_by: user?.username || 'system'
    };

    onSave(absenceData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {viewMode 
              ? "Ver Ausencia" 
              : absence ? "Editar Ausencia" : "Registrar Ausencia"}
          </DialogTitle>
          <DialogDescription>
            {viewMode 
              ? "Detalles de la ausencia registrada."
              : "Completa los detalles para registrar una ausencia."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Empleado</Label>
            <Select
              value={formData.employee_id.toString()}
              onValueChange={(value) => setFormData({ 
                ...formData, 
                employee_id: Number(value) 
              })}
              disabled={viewMode}
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
            <Label>Tipo de Ausencia</Label>
            <Select 
              value={formData.tipo_ausencia}
              onValueChange={(value) => setFormData({ 
                ...formData, 
                tipo_ausencia: value as TipoAusenciaEnum 
              })}
              disabled={viewMode || isLoadingTypes}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingTypes ? (
                  <SelectItem value="">Cargando opciones...</SelectItem>
                ) : (
                  absenceTypes.map(type => (
                    <SelectItem key={type.id} value={type.nombre}>
                      {type.nombre}
                    </SelectItem>
                  ))
                )}
                {!isLoadingTypes && absenceTypes.length === 0 && (
                  <SelectItem value="">No hay tipos disponibles</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Fecha de Inicio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.fecha_inicio && "text-muted-foreground"
                  )}
                  disabled={viewMode}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.fecha_inicio 
                    ? format(formData.fecha_inicio, 'dd/MM/yyyy')
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.fecha_inicio}
                  onSelect={(date) => date && setFormData({ ...formData, fecha_inicio: date })}
                  initialFocus
                  locale={es}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label>Fecha de Fin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.fecha_fin && "text-muted-foreground"
                  )}
                  disabled={viewMode}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.fecha_fin 
                    ? format(formData.fecha_fin, 'dd/MM/yyyy')
                    : "Seleccionar fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.fecha_fin}
                  onSelect={(date) => date && setFormData({ ...formData, fecha_fin: date })}
                  initialFocus
                  locale={es}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (opcional)</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Detalles adicionales de la ausencia"
              disabled={viewMode}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {viewMode ? "Cerrar" : "Cancelar"}
          </Button>
          {!viewMode && (
            <Button onClick={handleSubmit} className="bg-salon-400 hover:bg-salon-500">
              {absence ? "Actualizar" : "Registrar"} Ausencia
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
