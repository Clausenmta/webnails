
import { supabase } from "@/integrations/supabase/client";
import { Expense, NewExpense } from "@/types/expenses";
import { toast } from "sonner";

// Datos de muestra para cuando Supabase no está configurado
const MOCK_EXPENSES: Expense[] = [
  {
    id: 1,
    date: "15/04/2025",
    concept: "Ejemplo: Compra de productos",
    amount: 1500,
    category: "Insumos",
    created_by: "admin",
    details: "Datos de ejemplo cuando Supabase no está configurado",
    created_at: new Date().toISOString(),
    status: "pending" // Aseguramos que sea "pending" | "paid" y no un string genérico
  }
];

export const expenseService = {
  async fetchExpenses(): Promise<Expense[]> {
    try {
      console.log("Solicitando gastos desde la base de datos");
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error("Error al obtener gastos:", error.message);
        toast.error(`Error al cargar gastos: ${error.message}`);
        throw error;
      }
      
      console.log("Gastos obtenidos:", data?.length || 0);
      // Aseguramos que los valores de status sean del tipo correcto
      return (data || []).map(expense => ({
        ...expense,
        // Aseguramos que status sea "pending" o "paid"
        status: (expense.status as "pending" | "paid" | null) || undefined
      }));
    } catch (error) {
      console.error("Error al obtener gastos:", error);
      return [];
    }
  },

  async addExpense(newExpense: NewExpense): Promise<Expense> {
    try {
      console.log("Agregando nuevo gasto:", newExpense);
      const { data, error } = await supabase
        .from('expenses')
        .insert([newExpense])
        .select()
        .single();
      
      if (error) {
        console.error("Error al agregar gasto:", error.message);
        toast.error(`Error al guardar el gasto: ${error.message}`);
        throw error;
      }
      
      console.log("Gasto agregado correctamente:", data);
      toast.success("Gasto registrado correctamente");
      
      // Aseguramos que status sea del tipo correcto
      return {
        ...data,
        status: (data.status as "pending" | "paid" | null) || undefined
      };
    } catch (error) {
      console.error("Error al agregar gasto:", error);
      throw error;
    }
  },

  async deleteExpense(id: number): Promise<void> {
    try {
      console.log("Eliminando gasto con ID:", id);
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error al eliminar gasto:", error.message);
        toast.error(`Error al eliminar el gasto: ${error.message}`);
        throw error;
      }
      
      console.log("Gasto eliminado correctamente");
      toast.success("Gasto eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
      throw error;
    }
  },

  async updateExpense(id: number, updates: Partial<NewExpense>): Promise<Expense> {
    try {
      console.log("Actualizando gasto con ID:", id, "con datos:", updates);
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Error al actualizar gasto:", error.message);
        toast.error(`Error al actualizar el gasto: ${error.message}`);
        throw error;
      }
      
      console.log("Gasto actualizado correctamente:", data);
      toast.success("Gasto actualizado correctamente");
      
      // Aseguramos que status sea del tipo correcto
      return {
        ...data,
        status: (data.status as "pending" | "paid" | null) || undefined
      };
    } catch (error) {
      console.error("Error al actualizar gasto:", error);
      throw error;
    }
  }
};
