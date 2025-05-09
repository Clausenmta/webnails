
export interface IncomeExpense {
  id: number;
  date: string; // "DD/MM/YYYY"
  concept: string;
  amount: number;
  category: string;
  created_by: string;
  details?: string;
  due_date?: string; // "DD/MM/YYYY" - opcional para gastos con vencimiento
  provider?: string; // opcional para gastos con vencimiento
  status?: "pending" | "paid" | string; // Updated to accept any string value
  payment_method?: string;
  created_at?: string; // Adding this field as it appears in the database
}

export interface ServiceRevenue {
  service_name: string;
  revenue: number;
  quantity: number;
  month: string;
  year: string;
  id: string;
}

export interface PendingPayment {
  id: number;
  concept: string;
  amount: number;
  due_date: string;
  category: string;
  days_remaining: number;
}
