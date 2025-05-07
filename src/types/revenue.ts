
export interface ServiceRevenue {
  id: string;
  service_name: string;
  revenue: number;
  quantity: number;
  month: string;
  year: string;
  created_at: string;
  created_by?: string;
}

export interface InitialExpense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

export interface IncomeExpense {
  id: number;
  date: string;
  concept: string;
  amount: number;
  category: string;
  created_by: string;
  provider?: string;
  payment_method?: string;
  due_date?: string;
  status?: string;
}
