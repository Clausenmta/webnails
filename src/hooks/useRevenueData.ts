
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

  // Process income data to generate service revenue
  const serviceData = useState(() => {
    // Group income expenses by concept (which we'll treat as the service name)
    const serviceGroups: Record<string, { ingresos: number, cantidad: number }> = {};
    
    incomeExpenses.forEach(expense => {
      const serviceName = expense.concept;
      if (!serviceGroups[serviceName]) {
        serviceGroups[serviceName] = { ingresos: 0, cantidad: 0 };
      }
      serviceGroups[serviceName].ingresos += expense.amount;
      serviceGroups[serviceName].cantidad += 1;
    });

    // Convert grouped data to array format
    return Object.entries(serviceGroups).map(([servicio, data]) => ({
      servicio,
      cantidad: data.cantidad,
      ingresos: data.ingresos,
      ingresosPrevMes: 0 // We'll set this to 0 for now
    }));
  })[0];

  // Format pending payments for display
  const formattedPendingPayments = pendingPayments.map(payment => ({
    id: payment.id,
    proveedor: payment.provider || 'Desconocido',
    monto: payment.amount,
    vencimiento: payment.due_date || '',
    medioPago: payment.payment_method || 'Desconocido'
  }));

  // Calculate totals
  const totalServices = serviceData.reduce((sum, item) => sum + item.ingresos, 0);

  return {
    serviceData,
    totalServices,
    pendingPayments: formattedPendingPayments,
    isLoading: isLoadingIncomes || isLoadingPayments
  };
}
