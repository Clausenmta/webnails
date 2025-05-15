
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { toast } from "sonner";
import { IncomeExpense, ServiceRevenue as ServiceRevenueType } from "@/types/revenue";

type ServiceRevenue = {
  service_name: string;
  revenue: number;
  quantity: number;
  month: string;
  year: string;
  id: string;
};

export const revenueService = {
  async fetchRevenueByService(month: string, year: string): Promise<ServiceRevenueType[]> {
    try {
      console.log(`Fetching revenue data for ${month}/${year}`);
      
      const { data, error } = await supabase
        .from('service_revenue')
        .select('*')
        .eq('month', month)
        .eq('year', year);
      
      if (error) {
        console.error("Error fetching revenue data:", error.message);
        toast.error(`Error al cargar datos de facturación: ${error.message}`);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} revenue records`);
      return data || [];
    } catch (error) {
      console.error("Error in fetchRevenueByService:", error);
      toast.error(`Error al obtener datos de facturación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return [];
    }
  },
  
  async fetchTotalMonthlyBilling(month: number, year: number): Promise<number> {
    try {
      console.log(`Fetching total monthly billing for month ${month+1}/${year}`);
      
      // Format month to match the DD/MM/YYYY format used in expenses
      const monthStr = (month + 1).toString().padStart(2, '0');
      const monthPattern = `%/${monthStr}/${year}`;
      
      // Get all income entries from expenses table
      const { data: incomeData, error: incomeError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('category', 'Ingresos')
        .like('date', monthPattern);
      
      if (incomeError) {
        console.error("Error fetching income data:", incomeError.message);
        throw incomeError;
      }
      
      // Calculate total from income entries
      const incomeTotal = (incomeData || []).reduce((sum, item) => sum + (item.amount || 0), 0);
      console.log(`Calculated total monthly billing: $${incomeTotal.toLocaleString()}`);
      
      return incomeTotal;
    } catch (error) {
      console.error("Error in fetchTotalMonthlyBilling:", error);
      return 0;
    }
  },
  
  async fetchIncomeFromExpenses(month: number, year: number): Promise<IncomeExpense[]> {
    try {
      console.log(`Fetching income expenses for month ${month+1}/${year}`);
      
      // Format month to match the DD/MM/YYYY format used in expenses
      // We'll search for patterns where the middle part matches our month
      const monthStr = (month + 1).toString().padStart(2, '0');
      const monthPattern = `%/${monthStr}/${year}`;
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('category', 'Ingresos')
        .like('date', monthPattern);
      
      if (error) {
        console.error("Error fetching income expenses:", error.message);
        toast.error(`Error al cargar datos de ingresos: ${error.message}`);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} income records from expenses`);
      return data || [];
    } catch (error) {
      console.error("Error in fetchIncomeFromExpenses:", error);
      toast.error(`Error al obtener datos de ingresos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return [];
    }
  },
  
  async fetchPendingPayments(): Promise<IncomeExpense[]> {
    try {
      console.log("Fetching pending payments");
      
      const today = new Date();
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('status', 'pending')
        .or('category.eq.Proveedores');
      
      if (error) {
        console.error("Error fetching pending payments:", error.message);
        toast.error(`Error al cargar pagos pendientes: ${error.message}`);
        throw error;
      }
      
      // Further filter the results: we want expenses that have a due_date and are still pending
      const pendingPayments = (data || []).filter(expense => {
        if (!expense.due_date) return false;
        
        try {
          const [day, month, year] = expense.due_date.split('/');
          const dueDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          return dueDate >= today;
        } catch (error) {
          console.error(`Error parsing due date ${expense.due_date}:`, error);
          return false;
        }
      });
      
      console.log(`Fetched ${pendingPayments.length} pending payments`);
      return pendingPayments as IncomeExpense[];
    } catch (error) {
      console.error("Error in fetchPendingPayments:", error);
      toast.error(`Error al obtener pagos pendientes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return [];
    }
  }
};
