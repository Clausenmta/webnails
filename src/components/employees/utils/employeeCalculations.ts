
import { Employee } from "@/types/employees";

export const calculateEmployeesByPosition = (employees: Employee[]) => {
  return employees
    .filter(emp => emp.status === "active")
    .reduce((acc, employee) => {
      acc[employee.position] = (acc[employee.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
};

export const calculatePositionSummary = (employees: Employee[]) => {
  const positionSummary = employees.reduce((acc, employee) => {
    if (employee.status !== "active") return acc;
    
    const position = employee.position;
    
    if (!acc[position]) {
      acc[position] = {
        count: 0,
        totalBilling: 0,
        avgBilling: 0
      };
    }
    
    acc[position].count += 1;
    acc[position].totalBilling += employee.currentMonthBilling || 0;
    
    return acc;
  }, {} as Record<string, { count: number, totalBilling: number, avgBilling: number }>);

  // Calcular promedios después de que todos los valores se hayan sumado
  Object.keys(positionSummary).forEach(position => {
    const { count, totalBilling } = positionSummary[position];
    positionSummary[position].avgBilling = count > 0 ? totalBilling / count : 0;
  });

  return positionSummary;
};

export const getActiveEmployeesCount = (employees: Employee[]) => {
  return employees.filter(emp => emp.status === "active").length;
};

export const filterEmployees = (employees: Employee[], searchTerm: string) => {
  return employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );
};
