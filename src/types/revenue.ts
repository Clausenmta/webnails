
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
