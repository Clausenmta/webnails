
import { Employee } from "@/types/employees";
import EmployeeProfileDialog from "./EmployeeProfileDialog";
import SalaryCalculationDialog from "./SalaryCalculationDialog";
import { EmployeeSalaryHistoryDialog } from "./EmployeeSalaryHistoryDialog";

interface EmployeeDialogsContainerProps {
  selectedEmployee: Employee | null;
  isProfileOpen: boolean;
  isSalaryOpen: boolean;
  isSalaryHistoryOpen: boolean;
  selectedEmployeeForHistory: Employee | null;
  newEmployeeData: Partial<Employee>;
  onProfileOpenChange: (open: boolean) => void;
  onSalaryOpenChange: (open: boolean) => void;
  onSalaryHistoryOpenChange: (open: boolean) => void;
  onSaveEmployee: (employeeData: Employee | Partial<Employee>) => void;
  setNewEmployeeData: (data: Partial<Employee>) => void;
}

export const EmployeeDialogsContainer = ({
  selectedEmployee,
  isProfileOpen,
  isSalaryOpen,
  isSalaryHistoryOpen,
  selectedEmployeeForHistory,
  newEmployeeData,
  onProfileOpenChange,
  onSalaryOpenChange,
  onSalaryHistoryOpenChange,
  onSaveEmployee,
  setNewEmployeeData
}: EmployeeDialogsContainerProps) => {
  return (
    <>
      <EmployeeProfileDialog
        open={isProfileOpen}
        onOpenChange={onProfileOpenChange}
        employee={selectedEmployee}
        onSave={onSaveEmployee}
        newEmployeeData={newEmployeeData}
        setNewEmployeeData={setNewEmployeeData}
      />
      
      {selectedEmployee && (
        <SalaryCalculationDialog
          open={isSalaryOpen}
          onOpenChange={onSalaryOpenChange}
          employee={selectedEmployee}
        />
      )}
      
      {selectedEmployeeForHistory && (
        <EmployeeSalaryHistoryDialog
          open={isSalaryHistoryOpen}
          onOpenChange={onSalaryHistoryOpenChange}
          employee={selectedEmployeeForHistory}
        />
      )}
    </>
  );
};
