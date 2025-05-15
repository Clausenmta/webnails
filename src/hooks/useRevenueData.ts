
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { revenueService } from "@/services/revenueService";
import { toast } from "sonner";

export function useRevenueData(selectedMonth: string, year: string) {
  // Convert month name to number (0-11)
  const getMonthNumber = (monthName: string): number => {
    const monthAbbreviations = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return monthAbbreviations.indexOf(monthName);
  };

  const monthNumber = getMonthNumber(selectedMonth);
  const yearNumber = parseInt(year);

  // Fetch monthly billing total
  const { data: monthlyBilling = 0, isLoading: isLoadingBilling } = useQuery({
    queryKey: ['monthlyBilling', monthNumber, yearNumber],
    queryFn: () => revenueService.fetchTotalMonthlyBilling(monthNumber, yearNumber),
    enabled: monthNumber >= 0 && !isNaN(yearNumber),
  });

  // Fetch income data from expenses with category "Ingresos"
  const { data: incomeExpenses = [], isLoading: isLoadingIncomes } = useQuery({
    queryKey: ['income-expenses', monthNumber, yearNumber],
    queryFn: () => revenueService.fetchIncomeFromExpenses(monthNumber, yearNumber),
    enabled: monthNumber >= 0 && !isNaN(yearNumber),
  });

  // Fetch pending payments for providers
  const { data: pendingPayments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ['pending-payments'],
    queryFn: revenueService.fetchPendingPayments,
  });

  // Process income data to generate service revenue from actual expense data
  const [serviceData, setServiceData] = useState<any[]>([]);

  useEffect(() => {
    // Group income expenses by concept (which represents the service name)
    const serviceGroups: Record<string, { ingresos: number, cantidad: number, ingresosPrevMes: number }> = {};
    
    // Calculate previous month data
    const prevMonthNumber = monthNumber > 0 ? monthNumber - 1 : 11;
    const prevYearNumber = monthNumber > 0 ? yearNumber : yearNumber - 1;
    
    // Fetch previous month data (this will run once when incomeExpenses changes)
    const fetchPreviousMonthData = async () => {
      try {
        const prevMonthData = await revenueService.fetchIncomeFromExpenses(prevMonthNumber, prevYearNumber);
        
        // Process current month data
        incomeExpenses.forEach(expense => {
          const serviceName = expense.concept;
          if (!serviceGroups[serviceName]) {
            serviceGroups[serviceName] = { ingresos: 0, cantidad: 0, ingresosPrevMes: 0 };
          }
          serviceGroups[serviceName].ingresos += expense.amount;
          serviceGroups[serviceName].cantidad += 1;
        });
        
        // Add previous month data
        prevMonthData.forEach(expense => {
          const serviceName = expense.concept;
          if (!serviceGroups[serviceName]) {
            serviceGroups[serviceName] = { ingresos: 0, cantidad: 0, ingresosPrevMes: 0 };
          }
          serviceGroups[serviceName].ingresosPrevMes += expense.amount;
        });
        
        // Convert grouped data to array format
        const formattedServiceData = Object.entries(serviceGroups).map(([servicio, data]) => ({
          servicio,
          cantidad: data.cantidad,
          ingresos: data.ingresos,
          ingresosPrevMes: data.ingresosPrevMes
        }));
        
        setServiceData(formattedServiceData);
      } catch (error) {
        console.error("Error fetching previous month data:", error);
      }
    };
    
    if (incomeExpenses.length > 0 || monthNumber >= 0) {
      fetchPreviousMonthData();
    } else {
      setServiceData([]);
    }
  }, [incomeExpenses, monthNumber, yearNumber]);

  // Calculate totals using the actual billing data
  const totalServices = monthlyBilling || serviceData.reduce((sum, item) => sum + item.ingresos, 0);
  
  // Format pending payments for display
  const formattedPendingPayments = pendingPayments.map(payment => ({
    id: payment.id,
    proveedor: payment.provider || 'Desconocido',
    monto: payment.amount,
    vencimiento: payment.due_date || '',
    medioPago: payment.payment_method || 'Desconocido',
    concept: payment.concept,
    category: payment.category
  }));

  return {
    serviceData,
    totalServices,
    monthlyBilling,
    pendingPayments: formattedPendingPayments,
    isLoading: isLoadingIncomes || isLoadingPayments || isLoadingBilling,
    incomeExpenses
  };
}
