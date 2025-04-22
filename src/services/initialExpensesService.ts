
import { supabase } from "@/integrations/supabase/client";

export const initialExpensesService = {
  async fetchInitialExpenses() {
    const { data, error } = await supabase
      .from("initial_expenses")
      .select("*")
      .order("date", { ascending: true });
    if (error) throw error;
    return data;
  },

  async addInitialExpense(expense) {
    const { data, error } = await supabase
      .from("initial_expenses")
      .insert([expense])
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateInitialExpense(id, updates) {
    const { data, error } = await supabase
      .from("initial_expenses")
      .update(updates)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async deleteInitialExpense(id) {
    const { error } = await supabase
      .from("initial_expenses")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  }
}
