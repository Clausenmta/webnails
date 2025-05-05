
import { useEmployeeAbsences } from "@/hooks/employees/useEmployeeAbsences";
import { EmployeeAbsenceCalendar } from "./absences/EmployeeAbsenceCalendar"; 
import { EmployeeAbsenceDetails } from "./absences/EmployeeAbsenceDetails";
import AbsenceDialog from "@/components/absences/AbsenceDialog";
import { Employee } from "@/types/employees";
import { parseISO } from "date-fns";

interface AbsenceCalendarProps {
  employees: Employee[];
  currentEmployeeId?: number;
}

export default function AbsenceCalendar({ employees, currentEmployeeId }: AbsenceCalendarProps) {
  const {
    date,
    setDate,
    absences,
    isLoading,
    isAddAbsenceOpen,
    setIsAddAbsenceOpen,
    isViewMode,
    selectedAbsence,
    selectedDateAbsences,
    handleAddAbsence,
    handleViewAbsence,
    handleEditAbsence,
    handleDeleteAbsence,
    handleSaveAbsence
  } = useEmployeeAbsences(employees, currentEmployeeId);

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
          <EmployeeAbsenceCalendar 
            date={date}
            onDateChange={(newDate) => newDate && setDate(newDate)}
            absences={absences}
            onAddAbsence={handleAddAbsence}
          />
        </div>
        
        <div className="md:w-1/2">
          <EmployeeAbsenceDetails
            date={date}
            selectedDateAbsences={selectedDateAbsences}
            onViewAbsence={handleViewAbsence}
            onEditAbsence={handleEditAbsence}
            onDeleteAbsence={handleDeleteAbsence}
          />
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
