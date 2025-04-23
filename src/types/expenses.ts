export type PaymentMethod = "Efectivo" | "Transferencia" | "Cuenta Corriente";

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
  payment_method?: PaymentMethod;
}

export type NewExpense = Omit<Expense, 'id' | 'created_at'>;

// These are now managed in the database
// We keep this constant for backward compatibility 
export const expenseCategories = [
  "Fijos", 
  "Servicios", 
  "Impuestos y Tasas",
  "Mantenimiento",
  "Sueldos",
  "Honorarios",
  "Cargas Sociales",
  "Proveedores", 
  "Insumos generales", 
  "Marketing", 
  "Ingresos",
  "Varios"
];

export const paymentMethods: PaymentMethod[] = [
  "Efectivo", 
  "Transferencia", 
  "Cuenta Corriente"
];
