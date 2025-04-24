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
      arreglos: {
        Row: {
          assigned_to: string | null
          client_name: string
          completed_date: string | null
          created_at: string | null
          created_by: string
          date: string
          description: string
          id: number
          notes: string | null
          payment_status: string
          price: number
          repair_date: string | null
          service_type: string
          status: string
        }
        Insert: {
          assigned_to?: string | null
          client_name: string
          completed_date?: string | null
          created_at?: string | null
          created_by: string
          date: string
          description: string
          id?: number
          notes?: string | null
          payment_status: string
          price: number
          repair_date?: string | null
          service_type: string
          status: string
        }
        Update: {
          assigned_to?: string | null
          client_name?: string
          completed_date?: string | null
          created_at?: string | null
          created_by?: string
          date?: string
          description?: string
          id?: number
          notes?: string | null
          payment_status?: string
          price?: number
          repair_date?: string | null
          service_type?: string
          status?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          address: string | null
          created_at: string | null
          created_by: string
          email: string
          hire_date: string
          id: number
          name: string
          performance_rating: number | null
          phone: string | null
          position: string
          salary: number
          schedule: Json | null
          skills: string[] | null
          status: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          created_by: string
          email: string
          hire_date: string
          id?: number
          name: string
          performance_rating?: number | null
          phone?: string | null
          position: string
          salary: number
          schedule?: Json | null
          skills?: string[] | null
          status: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          created_by?: string
          email?: string
          hire_date?: string
          id?: number
          name?: string
          performance_rating?: number | null
          phone?: string | null
          position?: string
          salary?: number
          schedule?: Json | null
          skills?: string[] | null
          status?: string
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          access_level: string
          id: number
          name: string
        }
        Insert: {
          access_level?: string
          id?: number
          name: string
        }
        Update: {
          access_level?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          concept: string
          created_at: string | null
          created_by: string
          date: string
          details: string | null
          due_date: string | null
          id: number
          payment_method: string | null
          provider: string | null
          status: string | null
        }
        Insert: {
          amount: number
          category: string
          concept: string
          created_at?: string | null
          created_by: string
          date: string
          details?: string | null
          due_date?: string | null
          id?: number
          payment_method?: string | null
          provider?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          category?: string
          concept?: string
          created_at?: string | null
          created_by?: string
          date?: string
          details?: string | null
          due_date?: string | null
          id?: number
          payment_method?: string | null
          provider?: string | null
          status?: string | null
        }
        Relationships: []
      }
      gift_cards: {
        Row: {
          amount: number
          code: string
          created_at: string | null
          created_by: string
          customer_email: string | null
          customer_name: string | null
          expiry_date: string
          id: number
          notes: string | null
          purchase_date: string
          redeemed_date: string | null
          status: string
          sucursal: string[] | null
        }
        Insert: {
          amount: number
          code: string
          created_at?: string | null
          created_by: string
          customer_email?: string | null
          customer_name?: string | null
          expiry_date: string
          id?: number
          notes?: string | null
          purchase_date: string
          redeemed_date?: string | null
          status: string
          sucursal?: string[] | null
        }
        Update: {
          amount?: number
          code?: string
          created_at?: string | null
          created_by?: string
          customer_email?: string | null
          customer_name?: string | null
          expiry_date?: string
          id?: number
          notes?: string | null
          purchase_date?: string
          redeemed_date?: string | null
          status?: string
          sucursal?: string[] | null
        }
        Relationships: []
      }
      initial_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          date: string
          description: string
          id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string
          created_by?: string | null
          date: string
          description: string
          id?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          id?: string
        }
        Relationships: []
      }
      service_revenue: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          month: string
          quantity: number
          revenue: number
          service_name: string
          year: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          month: string
          quantity?: number
          revenue?: number
          service_name: string
          year: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          month?: string
          quantity?: number
          revenue?: number
          service_name?: string
          year?: string
        }
        Relationships: []
      }
      stock: {
        Row: {
          brand: string | null
          category: string
          created_at: string | null
          created_by: string
          expiry_date: string | null
          id: number
          location: string | null
          min_stock_level: number | null
          product_name: string
          purchase_date: string
          quantity: number
          supplier: string | null
          unit_price: number
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string | null
          created_by: string
          expiry_date?: string | null
          id?: number
          location?: string | null
          min_stock_level?: number | null
          product_name: string
          purchase_date: string
          quantity: number
          supplier?: string | null
          unit_price: number
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string | null
          created_by?: string
          expiry_date?: string | null
          id?: number
          location?: string | null
          min_stock_level?: number | null
          product_name?: string
          purchase_date?: string
          quantity?: number
          supplier?: string | null
          unit_price?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
