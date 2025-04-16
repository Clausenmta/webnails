import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Expense, NewExpense } from "@/types/expenses";

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
    created_at: new Date().toISOString()
  }
];

export const expenseService = {
  async fetchExpenses(): Promise<Expense[]> {
    // Si Supabase no está configurado, devuelve datos de muestra
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Usando datos de muestra.");
      return Promise.resolve(MOCK_EXPENSES);
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Transformar los datos si es necesario para que coincidan con el tipo Expense
      return data || [];
    } catch (error) {
      console.error("Error al obtener gastos:", error);
      return [];
    }
  },

  async addExpense(newExpense: NewExpense): Promise<Expense> {
    // Si Supabase no está configurado, simula una inserción
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando inserción.");
      const mockExpense: Expense = {
        ...newExpense,
        id: Math.floor(Math.random() * 1000) + 10,
        created_at: new Date().toISOString()
      };
      return Promise.resolve(mockExpense);
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([newExpense])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error al agregar gasto:", error);
      throw error;
    }
  },

  async deleteExpense(id: number): Promise<void> {
    // Si Supabase no está configurado, simula una eliminación
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando eliminación.");
      return Promise.resolve();
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error al eliminar gasto:", error);
      throw error;
    }
  },

  async updateExpense(id: number, updates: Partial<NewExpense>): Promise<Expense> {
    // Si Supabase no está configurado, simula una actualización
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando actualización.");
      const mockExpense: Expense = {
        ...MOCK_EXPENSES[0],
        ...updates,
        id
      };
      return Promise.resolve(mockExpense);
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error al actualizar gasto:", error);
      throw error;
    }
  }
};
