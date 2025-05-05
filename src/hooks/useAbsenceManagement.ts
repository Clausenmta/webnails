
import { useState, useEffect } from "react";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { absenceService, type Absence } from "@/services/absenceService";
import { employeeService } from "@/services/employeeService";
import { Employee } from "@/types/employees";

export interface AbsenceFiltersState {
  employeeId: number | null;
  tipoAusencia: string | null;
  startDate: Date;
  endDate: Date;
}

export function useAbsenceManagement() {
  const queryClient = useQueryClient();
  
  // State
  const [date, setDate] = useState<Date>(new Date());
  const [isAddAbsenceOpen, setIsAddAbsenceOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(true);
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
  const [selectedDateAbsences, setSelectedDateAbsences] = useState<Absence[]>([]);
  
  // Filters
  const [filters, setFilters] = useState<AbsenceFiltersState>({
    employeeId: null,
    tipoAusencia: null,
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

  return {
    date,
    setDate,
    isAddAbsenceOpen,
    setIsAddAbsenceOpen,
    isViewMode,
    selectedAbsence,
    selectedDateAbsences,
    filters,
    setFilters,
    employees,
    absences,
    filteredAbsences,
    absencesByDate,
    isLoadingEmployees,
    isLoadingAbsences,
    handleAddAbsence,
    handleEditAbsence,
    handleViewAbsence,
    handleDeleteAbsence,
    handleSaveAbsence
  };
}
