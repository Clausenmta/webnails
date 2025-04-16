
import { supabase } from "@/lib/supabase";
import { Expense, NewExpense } from "@/types/expenses";

export const expenseService = {
  async fetchExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addExpense(newExpense: NewExpense): Promise<Expense> {
    const { data, error } = await supabase
      .from('expenses')
      .insert([newExpense])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteExpense(id: number): Promise<void> {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
