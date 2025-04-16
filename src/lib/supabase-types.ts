
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: number
          created_at: string
          date: string
          concept: string
          amount: number
          category: string
          created_by: string
          details?: string
          due_date?: string
          provider?: string
          status?: "pending" | "paid"
        }
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>
      }
    }
  }
}
