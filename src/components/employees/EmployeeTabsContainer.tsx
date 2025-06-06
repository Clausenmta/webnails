
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Employee } from "@/types/employees";
import { EmployeeList } from "./EmployeeList";
import { EmployeeStats } from "./EmployeeStats";
import { SalarySummary } from "./SalarySummary";
import { GlobalSalaryCalculation } from "./GlobalSalaryCalculation";
import AbsenceCalendar from "./AbsenceCalendar";

interface EmployeeTabsContainerProps {
  employees: Employee[];
  filteredEmployees: Employee[];
  positionSummary: Record<string, { count: number, totalBilling: number, avgBilling: number }>;
  employeesByPosition: Record<string, number>;
  activeEmployees: number;
  onViewProfile: (employee: Employee) => void;
  onCalculateSalary: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: number) => void;
  onViewSalaryHistory: (employee: Employee) => void;
}

export const EmployeeTabsContainer = ({
  employees,
  filteredEmployees,
  positionSummary,
  employeesByPosition,
  activeEmployees,
  onViewProfile,
  onCalculateSalary,
  onDeleteEmployee,
  onViewSalaryHistory
}: EmployeeTabsContainerProps) => {
  return (
    <Tabs defaultValue="employees">
      <TabsList>
        <TabsTrigger value="employees">Listado de Empleados</TabsTrigger>
        <TabsTrigger value="global-calculation">Cálculo Global</TabsTrigger>
        <TabsTrigger value="summary">Resumen</TabsTrigger>
        <TabsTrigger value="absences">Ausencias</TabsTrigger>
      </TabsList>
      
      <TabsContent value="employees">
        <Card>
          <CardHeader>
            <CardTitle>Personal Activo</CardTitle>
            <CardDescription>
              Gestión de empleados y cálculo de sueldos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmployeeList
              employees={filteredEmployees}
              onViewProfile={onViewProfile}
              onCalculateSalary={onCalculateSalary}
              onDeleteEmployee={onDeleteEmployee}
              onViewSalaryHistory={onViewSalaryHistory}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="global-calculation">
        <GlobalSalaryCalculation employees={employees} />
      </TabsContent>
      
      <TabsContent value="summary">
        <EmployeeStats
          employees={employees}
          positionSummary={positionSummary}
        />
        <SalarySummary
          employees={employees}
          employeesByPosition={employeesByPosition}
          activeEmployees={activeEmployees}
        />
      </TabsContent>
      
      <TabsContent value="absences">
        <AbsenceCalendar employees={employees} />
      </TabsContent>
    </Tabs>
  );
};
