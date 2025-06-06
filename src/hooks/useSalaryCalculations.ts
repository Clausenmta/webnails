
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { salaryService, Salary, NewSalary } from "@/services/salaryService";
import { Employee } from "@/types/employees";

export interface SalaryCalculationRow {
  empleado_id: number;
  empleado_name: string;
  empleado_position: string;
  facturacion: number;
  comision: number;
  adelanto: number;
  vacaciones: number;
  recepcion: number;
  otros: number;
  recibo: number;
  total_efectivo: number;
  total_completo: number;
  asegurado: number;
  salary_id?: string;
}

export const useSalaryCalculations = (employees: Employee[]) => {
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: existingSalaries = [], isLoading } = useQuery({
    queryKey: ['salaries', selectedMonth, selectedYear],
    queryFn: () => salaryService.fetchSalaries(selectedMonth, selectedYear),
  });

  const calculateCommission = (facturacion: number, position: string): number => {
    const percentage = position.toLowerCase().includes('manicur') ? 0.32 : 0.30;
    return facturacion * percentage;
  };

  const calculateTotalEfectivo = (
    comision: number,
    adelanto: number,
    vacaciones: number,
    recepcion: number,
    otros: number,
    recibo: number
  ): number => {
    return comision - adelanto + vacaciones + recepcion + otros - recibo;
  };

  const calculateTotalCompleto = (
    comision: number,
    vacaciones: number,
    recepcion: number,
    otros: number,
    recibo: number
  ): number => {
    return comision + vacaciones + recepcion + otros + recibo;
  };

  const calculateAsegurado = (totalCompleto: number): number => {
    return totalCompleto < 500000 ? 500000 - totalCompleto : 0;
  };

  const salaryRows = useMemo(() => {
    const activeEmployees = employees.filter(emp => emp.status === "active");
    
    return activeEmployees.map(employee => {
      const existingSalary = existingSalaries.find(s => s.empleado_id === employee.id);
      
      const facturacion = existingSalary?.facturacion || 0;
      const adelanto = existingSalary?.adelanto || 0;
      const vacaciones = existingSalary?.vacaciones || 0;
      const recepcion = existingSalary?.recepcion || 0;
      const otros = existingSalary?.otros || 0;
      const recibo = existingSalary?.recibo || 0;
      
      const comision = calculateCommission(facturacion, employee.position);
      const total_efectivo = calculateTotalEfectivo(comision, adelanto, vacaciones, recepcion, otros, recibo);
      const total_completo = calculateTotalCompleto(comision, vacaciones, recepcion, otros, recibo);
      const asegurado = calculateAsegurado(total_completo);

      return {
        empleado_id: employee.id,
        empleado_name: employee.name,
        empleado_position: employee.position,
        facturacion,
        comision,
        adelanto,
        vacaciones,
        recepcion,
        otros,
        recibo,
        total_efectivo,
        total_completo,
        asegurado,
        salary_id: existingSalary?.id
      };
    });
  }, [employees, existingSalaries]);

  const saveSalaryMutation = useMutation({
    mutationFn: (salaryData: NewSalary) => salaryService.upsertSalary(salaryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries', selectedMonth, selectedYear] });
    },
  });

  const saveSalary = (row: SalaryCalculationRow) => {
    const salaryData: NewSalary = {
      empleado_id: row.empleado_id,
      mes: selectedMonth,
      anio: selectedYear,
      facturacion: row.facturacion,
      comision: row.comision,
      adelanto: row.adelanto,
      vacaciones: row.vacaciones,
      recepcion: row.recepcion,
      otros: row.otros,
      recibo: row.recibo,
      total_efectivo: row.total_efectivo,
      total_completo: row.total_completo,
      asegurado: row.asegurado,
      created_by: 'admin'
    };

    saveSalaryMutation.mutate(salaryData);
  };

  const updateSalaryField = (empleado_id: number, field: keyof SalaryCalculationRow, value: number) => {
    queryClient.setQueryData(['salaries', selectedMonth, selectedYear], (old: Salary[] = []) => {
      const updated = [...old];
      const existingIndex = updated.findIndex(s => s.empleado_id === empleado_id);
      
      if (existingIndex >= 0) {
        updated[existingIndex] = { ...updated[existingIndex], [field]: value };
      } else {
        const newSalary: Salary = {
          id: `temp-${empleado_id}`,
          empleado_id,
          mes: selectedMonth,
          anio: selectedYear,
          facturacion: 0,
          comision: 0,
          adelanto: 0,
          vacaciones: 0,
          recepcion: 0,
          otros: 0,
          recibo: 0,
          total_efectivo: 0,
          total_completo: 0,
          asegurado: 0,
          created_at: new Date().toISOString(),
          created_by: 'admin',
          [field]: value
        };
        updated.push(newSalary);
      }
      
      return updated;
    });
  };

  return {
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    salaryRows,
    isLoading,
    saveSalary,
    updateSalaryField,
    saveSalaryMutation,
    calculateCommission,
    calculateTotalEfectivo,
    calculateTotalCompleto,
    calculateAsegurado
  };
};
