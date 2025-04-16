
import { supabase, getActiveSession } from "@/lib/supabase";
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
    status: "pending"
  }
];

export const expenseService = {
  async fetchExpenses(): Promise<Expense[]> {
    try {
      console.log("Solicitando gastos desde la base de datos");
      
      // Verificamos la sesión del usuario con la función mejorada
      const session = await getActiveSession();
      if (!session) {
        console.warn("No hay sesión activa. Usando datos de muestra.");
        return MOCK_EXPENSES;
      }
      
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
      toast.error(`Error al obtener gastos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return [];
    }
  },

  async addExpense(newExpense: NewExpense): Promise<Expense> {
    try {
      console.log("Agregando nuevo gasto:", newExpense);
      
      // Verificamos la sesión del usuario con la función mejorada
      const session = await getActiveSession();
      if (!session) {
        console.error("No hay sesión activa para agregar gasto");
        toast.error("Debe iniciar sesión para agregar gastos");
        throw new Error("No hay sesión activa");
      }
      
      // Agregamos la información del usuario que crea el gasto si no está presente
      if (!newExpense.created_by) {
        newExpense.created_by = session.user.email || session.user.id;
      }
      
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
      toast.error(`Error al agregar gasto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      throw error;
    }
  },

  async deleteExpense(id: number): Promise<void> {
    try {
      console.log("Eliminando gasto con ID:", id);
      
      // Verificamos la sesión del usuario con la función mejorada
      const session = await getActiveSession();
      if (!session) {
        console.error("No hay sesión activa para eliminar gasto");
        toast.error("Debe iniciar sesión para eliminar gastos");
        throw new Error("No hay sesión activa");
      }
      
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
      toast.error(`Error al eliminar gasto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      throw error;
    }
  },

  async updateExpense(id: number, updates: Partial<NewExpense>): Promise<Expense> {
    try {
      console.log("Actualizando gasto con ID:", id, "con datos:", updates);
      
      // Verificamos la sesión del usuario con la función mejorada
      const session = await getActiveSession();
      if (!session) {
        console.error("No hay sesión activa para actualizar gasto");
        toast.error("Debe iniciar sesión para actualizar gastos");
        throw new Error("No hay sesión activa");
      }
      
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
      toast.error(`Error al actualizar gasto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      throw error;
    }
  }
};
