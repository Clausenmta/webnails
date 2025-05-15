
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AbsenceDialog from "@/components/absences/AbsenceDialog";
import AbsenceList from "@/components/absences/AbsenceList";
import AbsenceFilters from "@/components/absences/AbsenceFilters";
import { AbsenceHeader } from "@/components/absences/AbsenceHeader";
import { AbsenceCalendarView } from "@/components/absences/AbsenceCalendarView";
import { useAbsenceManagement, AbsenceFiltersState } from "@/hooks/useAbsenceManagement";

export default function AusenciasPage() {
  const {
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
    filteredAbsences,
    absencesByDate,
    isLoadingEmployees,
    isLoadingAbsences,
    handleAddAbsence,
    handleEditAbsence,
    handleViewAbsence,
    handleDeleteAbsence,
    handleSaveAbsence
  } = useAbsenceManagement();

  // Loading state
  if (isLoadingEmployees || isLoadingAbsences) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full min-w-0">
      <AbsenceHeader onAddAbsence={handleAddAbsence} />

      <AbsenceFilters 
        employees={employees} 
        filters={filters}
        setFilters={(newFilters) => setFilters(newFilters as AbsenceFiltersState)}
      />

      <Tabs defaultValue="calendar">
        <TabsList className="overflow-x-auto flex w-full">
          <TabsTrigger value="calendar" className="whitespace-nowrap">Calendario</TabsTrigger>
          <TabsTrigger value="list" className="whitespace-nowrap">Listado</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-4">
          <AbsenceCalendarView
            date={date}
            setDate={setDate}
            selectedDateAbsences={selectedDateAbsences}
            absencesByDate={absencesByDate}
            onViewAbsence={handleViewAbsence}
            onEditAbsence={handleEditAbsence}
            onDeleteAbsence={handleDeleteAbsence}
          />
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
