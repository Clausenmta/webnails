
export interface Employee {
  id: number;
  name: string;
  position: string;
  email: string;
  status: "active" | "inactive";
  joinDate: string;
  contact?: string;
  salary?: number;
  billingAverage?: number;
  currentMonthBilling?: number;
  phone?: string;
  address?: string;
  documentId?: string;
  birthday?: string;
  bankAccount?: string;
  documents?: {
    id: number;
    name: string;
    date: string;
    type: "salary" | "contract" | "other";
    url: string;
  }[];
}
