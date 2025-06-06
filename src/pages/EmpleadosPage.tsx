
import { useEmployeeManagement } from "@/components/employees/hooks/useEmployeeManagement";
import { 
  calculateEmployeesByPosition, 
  calculatePositionSummary, 
  getActiveEmployeesCount, 
  filterEmployees 
} from "@/components/employees/utils/employeeCalculations";
import { EmployeePageHeader } from "@/components/employees/EmployeePageHeader";
import { EmployeeTabsContainer } from "@/components/employees/EmployeeTabsContainer";
import { EmployeeDialogsContainer } from "@/components/employees/EmployeeDialogsContainer";

export default function EmpleadosPage() {
  const {
    // State
    searchTerm,
    selectedEmployee,
    isProfileOpen,
    isSalaryOpen,
    isSalaryHistoryOpen,
    selectedEmployeeForHistory,
    newEmployeeData,
    employees,
    isLoading,
    error,
    
    // Setters
    setSearchTerm,
    setIsProfileOpen,
    setIsSalaryOpen,
    setIsSalaryHistoryOpen,
    setNewEmployeeData,
    
    // Handlers
    handleSaveEmployee,
    handleDeleteEmployee,
    handleViewSalaryHistory,
    handleAddEmployee,
    handleViewProfile,
    handleCalculateSalary
  } = useEmployeeManagement();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Cargando empleados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <p>Error al cargar empleados. Por favor intente de nuevo.</p>
      </div>
    );
  }

  const filteredEmployees = filterEmployees(employees, searchTerm);
  const employeesByPosition = calculateEmployeesByPosition(employees);
  const positionSummary = calculatePositionSummary(employees);
  const activeEmployees = getActiveEmployeesCount(employees);

  return (
    <div className="space-y-6">
      <EmployeePageHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddEmployee={handleAddEmployee}
      />

      <EmployeeTabsContainer
        employees={employees}
        filteredEmployees={filteredEmployees}
        positionSummary={positionSummary}
        employeesByPosition={employeesByPosition}
        activeEmployees={activeEmployees}
        onViewProfile={handleViewProfile}
        onCalculateSalary={handleCalculateSalary}
        onDeleteEmployee={handleDeleteEmployee}
        onViewSalaryHistory={handleViewSalaryHistory}
      />

      <EmployeeDialogsContainer
        selectedEmployee={selectedEmployee}
        isProfileOpen={isProfileOpen}
        isSalaryOpen={isSalaryOpen}
        isSalaryHistoryOpen={isSalaryHistoryOpen}
        selectedEmployeeForHistory={selectedEmployeeForHistory}
        newEmployeeData={newEmployeeData}
        onProfileOpenChange={setIsProfileOpen}
        onSalaryOpenChange={setIsSalaryOpen}
        onSalaryHistoryOpenChange={setIsSalaryHistoryOpen}
        onSaveEmployee={handleSaveEmployee}
        setNewEmployeeData={setNewEmployeeData}
      />
    </div>
  );
}
