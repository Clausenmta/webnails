
import { supabase, getActiveSession } from "@/lib/supabase";
import { toast } from "sonner";

// Interfaz para Gift Card
export interface GiftCard {
  id: number;
  created_at: string;
  code: string;
  amount: number;
  status: "active" | "redeemed" | "expired";
  customer_name?: string;
  customer_email?: string;
  purchase_date: string;
  expiry_date: string;
  redeemed_date?: string;
  created_by: string;
  notes?: string;
  branch?: string; // Nueva propiedad para sucursal
}

export type NewGiftCard = Omit<GiftCard, 'id' | 'created_at'>;

// Helper function to handle Supabase errors
const handleSupabaseError = (error: any, operation: string = "operación") => {
  console.error(`Error en ${operation}:`, error);
  
  if (error.message?.includes("JWT expired") || error.message?.includes("session")) {
    toast.error(`Su sesión ha expirado, por favor inicie sesión nuevamente`);
  } else if (error.message?.includes("violates")) {
    toast.error(`Error: La operación viola restricciones de la base de datos`);
  } else {
    toast.error(`Error en ${operation}: ${error.message}`);
  }
  
  return error;
};

// Datos de muestra para cuando Supabase no está configurado
const MOCK_GIFT_CARDS: GiftCard[] = [
  {
    id: 1,
    created_at: new Date().toISOString(),
    code: "GC-12345",
    amount: 2000,
    status: "active",
    customer_name: "Cliente de Ejemplo",
    customer_email: "cliente@example.com",
    purchase_date: "01/04/2025",
    expiry_date: "01/04/2026",
    created_by: "admin",
    branch: "Fisherton"
  }
];

export const giftCardService = {
  async fetchGiftCards(): Promise<GiftCard[]> {
    try {
      await getActiveSession();
      
      const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convertimos los valores de status al tipo correcto
      return (data || []).map(giftCard => ({
        ...giftCard,
        status: giftCard.status as "active" | "redeemed" | "expired"
      }));
    } catch (error) {
      handleSupabaseError(error, "obtener tarjetas de regalo");
      return MOCK_GIFT_CARDS;
    }
  },

  async addGiftCard(newGiftCard: NewGiftCard): Promise<GiftCard> {
    try {
      const session = await getActiveSession();
      if (!session) {
        throw new Error("Debe iniciar sesión para realizar esta operación");
      }
      
      const { data, error } = await supabase
        .from('gift_cards')
        .insert([newGiftCard])
        .select()
        .single();
      
      if (error) throw error;
      
      // Convertimos los valores de status al tipo correcto
      return {
        ...data,
        status: data.status as "active" | "redeemed" | "expired"
      };
    } catch (error) {
      handleSupabaseError(error, "agregar tarjeta de regalo");
      throw error;
    }
  },

  async updateGiftCard(id: number, updates: Partial<NewGiftCard>): Promise<GiftCard> {
    try {
      const session = await getActiveSession();
      if (!session) {
        throw new Error("Debe iniciar sesión para realizar esta operación");
      }
      
      const { data, error } = await supabase
        .from('gift_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Convertimos los valores de status al tipo correcto
      return {
        ...data,
        status: data.status as "active" | "redeemed" | "expired"
      };
    } catch (error) {
      handleSupabaseError(error, "actualizar tarjeta de regalo");
      throw error;
    }
  },

  async deleteGiftCard(id: number): Promise<void> {
    try {
      const session = await getActiveSession();
      if (!session) {
        throw new Error("Debe iniciar sesión para realizar esta operación");
      }
      
      const { error } = await supabase
        .from('gift_cards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, "eliminar tarjeta de regalo");
      throw error;
    }
  }
};
