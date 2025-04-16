
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

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
}

export type NewGiftCard = Omit<GiftCard, 'id' | 'created_at'>;

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
    created_by: "admin"
  }
];

export const giftCardService = {
  async fetchGiftCards(): Promise<GiftCard[]> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Usando datos de muestra.");
      return Promise.resolve(MOCK_GIFT_CARDS);
    }

    try {
      const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convertimos el valor de status al tipo correcto
      return (data || []).map(giftCard => ({
        ...giftCard,
        status: giftCard.status as "active" | "redeemed" | "expired"
      }));
    } catch (error) {
      console.error("Error al obtener gift cards:", error);
      return [];
    }
  },

  async addGiftCard(newGiftCard: NewGiftCard): Promise<GiftCard> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando inserción.");
      const mockGiftCard: GiftCard = {
        ...newGiftCard,
        id: Math.floor(Math.random() * 1000) + 10,
        created_at: new Date().toISOString()
      };
      return Promise.resolve(mockGiftCard);
    }

    try {
      const { data, error } = await supabase
        .from('gift_cards')
        .insert([newGiftCard])
        .select()
        .single();
      
      if (error) throw error;
      
      // Convertimos el valor de status al tipo correcto
      return {
        ...data,
        status: data.status as "active" | "redeemed" | "expired"
      };
    } catch (error) {
      console.error("Error al agregar gift card:", error);
      throw error;
    }
  },

  async updateGiftCard(id: number, updates: Partial<NewGiftCard>): Promise<GiftCard> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando actualización.");
      const mockGiftCard: GiftCard = {
        ...MOCK_GIFT_CARDS[0],
        ...updates,
        id
      };
      return Promise.resolve(mockGiftCard);
    }

    try {
      const { data, error } = await supabase
        .from('gift_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Convertimos el valor de status al tipo correcto
      return {
        ...data,
        status: data.status as "active" | "redeemed" | "expired"
      };
    } catch (error) {
      console.error("Error al actualizar gift card:", error);
      throw error;
    }
  },

  async deleteGiftCard(id: number): Promise<void> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando eliminación.");
      return Promise.resolve();
    }

    try {
      const { error } = await supabase
        .from('gift_cards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error al eliminar gift card:", error);
      throw error;
    }
  }
};
