
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

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
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

    const { data, error } = await supabase
      .from('expenses')
      .insert([newExpense])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteExpense(id: number): Promise<void> {
    // Si Supabase no está configurado, simula una eliminación
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando eliminación.");
      return Promise.resolve();
    }

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
