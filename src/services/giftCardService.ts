
import { supabase } from "@/integrations/supabase/client";
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
    try {
      console.log("Solicitando gift cards desde la base de datos");
      
      // Verificamos la sesión del usuario
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.warn("No hay sesión activa. Usando datos de muestra.");
        return MOCK_GIFT_CARDS;
      }
      
      const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error al obtener gift cards:", error.message);
        toast.error(`Error al cargar las tarjetas de regalo: ${error.message}`);
        throw error;
      }
      
      console.log("Gift cards obtenidas:", data?.length || 0);
      // Convertimos el valor de status al tipo correcto
      return (data || []).map(giftCard => ({
        ...giftCard,
        status: giftCard.status as "active" | "redeemed" | "expired"
      }));
    } catch (error) {
      console.error("Error al obtener gift cards:", error);
      toast.error(`Error al obtener tarjetas de regalo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return [];
    }
  },

  async addGiftCard(newGiftCard: NewGiftCard): Promise<GiftCard> {
    try {
      console.log("Agregando nueva gift card:", newGiftCard);
      
      // Verificamos la sesión del usuario
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No hay sesión activa para agregar gift card");
        toast.error("Debe iniciar sesión para agregar tarjetas de regalo");
        throw new Error("No hay sesión activa");
      }
      
      // Agregamos la información del usuario que crea la gift card si no está presente
      if (!newGiftCard.created_by) {
        newGiftCard.created_by = session.user.email || session.user.id;
      }
      
      const { data, error } = await supabase
        .from('gift_cards')
        .insert([newGiftCard])
        .select()
        .single();
      
      if (error) {
        console.error("Error al agregar gift card:", error.message);
        toast.error(`Error al guardar la tarjeta de regalo: ${error.message}`);
        throw error;
      }
      
      console.log("Gift card agregada correctamente:", data);
      toast.success("Tarjeta de regalo creada correctamente");
      
      // Convertimos el valor de status al tipo correcto
      return {
        ...data,
        status: data.status as "active" | "redeemed" | "expired"
      };
    } catch (error) {
      console.error("Error al agregar gift card:", error);
      toast.error(`Error al agregar tarjeta de regalo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      throw error;
    }
  },

  async updateGiftCard(id: number, updates: Partial<NewGiftCard>): Promise<GiftCard> {
    try {
      console.log("Actualizando gift card con ID:", id, "con datos:", updates);
      
      // Verificamos la sesión del usuario
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No hay sesión activa para actualizar gift card");
        toast.error("Debe iniciar sesión para actualizar tarjetas de regalo");
        throw new Error("No hay sesión activa");
      }
      
      const { data, error } = await supabase
        .from('gift_cards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Error al actualizar gift card:", error.message);
        toast.error(`Error al actualizar la tarjeta de regalo: ${error.message}`);
        throw error;
      }
      
      console.log("Gift card actualizada correctamente:", data);
      toast.success("Tarjeta de regalo actualizada correctamente");
      
      // Convertimos el valor de status al tipo correcto
      return {
        ...data,
        status: data.status as "active" | "redeemed" | "expired"
      };
    } catch (error) {
      console.error("Error al actualizar gift card:", error);
      toast.error(`Error al actualizar tarjeta de regalo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      throw error;
    }
  },

  async deleteGiftCard(id: number): Promise<void> {
    try {
      console.log("Eliminando gift card con ID:", id);
      
      // Verificamos la sesión del usuario
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No hay sesión activa para eliminar gift card");
        toast.error("Debe iniciar sesión para eliminar tarjetas de regalo");
        throw new Error("No hay sesión activa");
      }
      
      const { error } = await supabase
        .from('gift_cards')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error al eliminar gift card:", error.message);
        toast.error(`Error al eliminar la tarjeta de regalo: ${error.message}`);
        throw error;
      }
      
      console.log("Gift card eliminada correctamente");
      toast.success("Tarjeta de regalo eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar gift card:", error);
      toast.error(`Error al eliminar tarjeta de regalo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      throw error;
    }
  }
};
