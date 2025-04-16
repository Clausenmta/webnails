
export interface Expense {
  id: number;
  date: string; // "DD/MM/YYYY"
  concept: string;
  amount: number;
  category: string;
  created_by: string;
  details?: string;
  due_date?: string; // "DD/MM/YYYY" - opcional para gastos con vencimiento
  provider?: string; // opcional para gastos con vencimiento
  status?: "pending" | "paid"; // opcional para gastos con vencimiento
  created_at: string;
}

export type NewExpense = Omit<Expense, 'id' | 'created_at'>;

export const expenseCategories = [
  "Fijos", 
  "Proveedores", 
  "Insumos", 
  "Servicios", 
  "Marketing", 
  "Personal", 
  "Otros"
];
