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
      gift_cards: {
        Row: {
          id: number
          created_at: string
          code: string
          amount: number
          status: "active" | "redeemed" | "expired"
          customer_name?: string
          customer_email?: string
          purchase_date: string
          expiry_date: string
          redeemed_date?: string
          created_by: string
          notes?: string
        }
        Insert: Omit<Database['public']['Tables']['gift_cards']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['gift_cards']['Insert']>
      }
      stock: {
        Row: {
          id: number
          created_at: string
          product_name: string
          category: string
          brand?: string
          quantity: number
          unit_price: number
          purchase_date: string
          expiry_date?: string
          min_stock_level?: number
          location?: string
          supplier?: string
          created_by: string
        }
        Insert: Omit<Database['public']['Tables']['stock']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['stock']['Insert']>
      }
      arreglos: {
        Row: {
          id: number
          created_at: string
          date: string
          client_name: string
          service_type: string
          description: string
          status: "pendiente" | "en_proceso" | "completado" | "cancelado"
          assigned_to?: string
          price: number
          completed_date?: string
          payment_status: "pendiente" | "pagado"
          created_by: string
          notes?: string
        }
        Insert: Omit<Database['public']['Tables']['arreglos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['arreglos']['Insert']>
      }
      employees: {
        Row: {
          id: number
          created_at: string
          name: string
          email: string
          position: string
          hire_date: string
          salary: number
          phone?: string
          address?: string
          status: "active" | "inactive"
          schedule?: Json
          skills?: string[]
          performance_rating?: number
          created_by: string
        }
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['employees']['Insert']>
      }
      sueldos: {
        Row: {
          id: string
          empleado_id: number
          mes: number
          anio: number
          facturacion: number
          comision: number
          adelanto: number
          vacaciones: number
          recepcion: number
          otros: number
          recibo: number
          total_efectivo: number
          total_completo: number
          asegurado: number
          created_at: string
          created_by: string
        }
        Insert: Omit<Database['public']['Tables']['sueldos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['sueldos']['Insert']>
      }
    }
  }
}
