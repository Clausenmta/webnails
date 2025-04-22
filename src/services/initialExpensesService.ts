
import { supabase } from "@/integrations/supabase/client";

export interface InitialExpense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  created_at?: string;
  created_by?: string;
}

export interface InitialExpensePayload {
  date: string;
  description: string;
  category: string;
  amount: number;
}

export const initialExpensesService = {
  async fetchInitialExpenses(): Promise<InitialExpense[]> {
    const { data, error } = await supabase
      .from("initial_expenses")
      .select("*")
      .order("date", { ascending: true });
    if (error) throw error;
    return data;
  },

  async addInitialExpense(expense: InitialExpensePayload): Promise<InitialExpense> {
    const { data, error } = await supabase
      .from("initial_expenses")
      .insert([expense])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateInitialExpense(id: string, updates: InitialExpensePayload): Promise<InitialExpense> {
    const { data, error } = await supabase
      .from("initial_expenses")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async deleteInitialExpense(id: string): Promise<boolean> {
    const { error } = await supabase
      .from("initial_expenses")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  }
};
