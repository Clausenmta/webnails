
import { useMemo } from 'react';
import { useArreglosData } from '@/hooks/arreglos/useArreglosData';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export function useArreglosRevenue() {
  const { arreglos, isLoading } = useArreglosData();

  const dashboardData = useMemo(() => {
    // If data is loading or no arreglos, return default values
    if (isLoading || !arreglos.length) {
      return {
        monthlyRevenue: 0,
        previousMonthRevenue: 0,
        percentageChange: 0,
        completedArreglos: 0,
        pendingArreglos: 0,
        oldPendingArreglos: 0
      };
    }

    // Get current date and previous month dates
    const currentDate = new Date();
    const currentMonth = startOfMonth(currentDate);
    const previousMonth = startOfMonth(subMonths(currentDate, 1));
    
    // Filter arreglos for current month and previous month
    const currentMonthArreglos = arreglos.filter(arreglo => {
      const arregloDate = new Date(arreglo.date);
      return arregloDate >= currentMonth && arregloDate <= endOfMonth(currentDate);
    });
    
    const previousMonthArreglos = arreglos.filter(arreglo => {
      const arregloDate = new Date(arreglo.date);
      return arregloDate >= previousMonth && arregloDate < currentMonth;
    });
    
    // Calculate monthly revenue
    const monthlyRevenue = currentMonthArreglos.reduce((total, arreglo) => 
      total + (arreglo.price || 0), 0);
    
    // Calculate previous month's revenue
    const previousMonthRevenue = previousMonthArreglos.reduce((total, arreglo) => 
      total + (arreglo.price || 0), 0);
    
    // Calculate percentage change
    let percentageChange = 0;
    if (previousMonthRevenue > 0) {
      percentageChange = ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    }
    
    // Count pending and completed arreglos
    const pendingArreglos = arreglos.filter(arreglo => arreglo.status === 'pendiente');
    const completedArreglos = arreglos.filter(arreglo => arreglo.status === 'completado');
    
    // Count old pending arreglos (more than 5 days)
    const oldPendingArreglos = pendingArreglos.filter(arreglo => {
      const arregloDate = new Date(arreglo.date);
      const today = new Date();
      const diffTime = today.getTime() - arregloDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 5;
    });

    return {
      monthlyRevenue,
      previousMonthRevenue,
      percentageChange,
      completedArreglos: completedArreglos.length,
      pendingArreglos: pendingArreglos.length,
      oldPendingArreglos: oldPendingArreglos.length
    };
  }, [arreglos, isLoading]);

  return dashboardData;
}
