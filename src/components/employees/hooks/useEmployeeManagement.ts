
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Employee } from "@/types/employees";
import { employeeService } from "@/services/employeeService";

export const useEmployeeManagement = () => {
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSalaryOpen, setIsSalaryOpen] = useState(false);
  const [isSalaryHistoryOpen, setIsSalaryHistoryOpen] = useState(false);
  const [selectedEmployeeForHistory, setSelectedEmployeeForHistory] = useState<Employee | null>(null);
  
  const [newEmployeeData, setNewEmployeeData] = useState<Partial<Employee>>({
    name: "",
    position: "Estilista",
    status: "active",
    documents: []
  });

  const { data: employees = [], isLoading, error } = useQuery({
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
        currentMonthBilling: emp.performance_rating || 0,
        billingAverage: emp.performance_rating || 0,
        documents: []
      }));
    }
  });

  const handleSaveEmployee = async (employeeData: Employee | Partial<Employee>) => {
    try {
      if ('id' in employeeData && employeeData.id) {
        await employeeService.updateEmployee(employeeData.id, {
          name: employeeData.name || '',
          email: employeeData.email || '',
          position: employeeData.position || 'Estilista',
          phone: employeeData.phone,
          address: employeeData.address,
          status: employeeData.status || 'active',
          hire_date: employeeData.joinDate || new Date().toLocaleDateString('es-AR'),
          salary: employeeData.salary || 0,
          created_by: 'admin'
        });
        toast.success("Empleado actualizado correctamente");
      } else {
        await employeeService.addEmployee({
          name: employeeData.name || '',
          email: employeeData.email || 'empleado@nailsandco.com',
          position: employeeData.position || 'Estilista',
          phone: employeeData.phone,
          address: employeeData.address,
          status: 'active',
          hire_date: new Date().toLocaleDateString('es-AR'),
          salary: employeeData.salary || 0,
          created_by: 'admin'
        });
        toast.success("Empleado creado correctamente");
      }
      
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Error al guardar empleado:", error);
      toast.error("Error al guardar el empleado");
    }
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    try {
      await employeeService.deleteEmployee(employeeId);
      toast.success("Empleado eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      toast.error("Error al eliminar el empleado");
    }
  };

  const handleViewSalaryHistory = (employee: Employee) => {
    setSelectedEmployeeForHistory(employee);
    setIsSalaryHistoryOpen(true);
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsProfileOpen(true);
  };

  const handleViewProfile = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsProfileOpen(true);
  };

  const handleCalculateSalary = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsSalaryOpen(true);
  };

  return {
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
  };
};
