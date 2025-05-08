import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { absenceService, Absence } from "@/services/absenceService";
import { Employee } from "@/types/employees";
import { useAuth } from "@/contexts/AuthContext";
import { absenceTypeService } from "@/services/absenceTypeService";

export function useEmployeeAbsences(employees: Employee[], currentEmployeeId?: number) {
  const { user } = useAuth();
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
  
  // Query for absence types to make them available in the hook
  const { data: absenceTypes = [] } = useQuery({
    queryKey: ['absenceTypes'],
    queryFn: absenceTypeService.fetchAbsenceTypes
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

  return {
    date,
    setDate,
    absences,
    isLoading,
    isAddAbsenceOpen,
    setIsAddAbsenceOpen,
    isViewMode,
    selectedAbsence,
    selectedDateAbsences,
    absenceTypes,
    handleAddAbsence,
    handleViewAbsence,
    handleEditAbsence,
    handleDeleteAbsence,
    handleSaveAbsence
  };
}
