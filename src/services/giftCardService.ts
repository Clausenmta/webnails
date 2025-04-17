
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
  branch?: string; // Propiedad para sucursal
  is_redeemed?: boolean; // Nueva propiedad para indicar si ha sido canjeada
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
    expiry_date: "01/05/2025",
    created_by: "admin",
    branch: "Fisherton",
    is_redeemed: false
  }
];

// Calcular la fecha de vencimiento (30 días después de la fecha de compra)
export const calculateExpiryDate = (purchaseDate: string): string => {
  try {
    const date = new Date(purchaseDate);
    if (isNaN(date.getTime())) {
      // Si la fecha no es válida, usar la fecha actual
      const today = new Date();
      today.setDate(today.getDate() + 30);
      return today.toISOString().split('T')[0];
    }
    
    // Añadir 30 días a la fecha de compra
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error("Error al calcular fecha de vencimiento:", error);
    // En caso de error, devolver una fecha 30 días después de hoy
    const today = new Date();
    today.setDate(today.getDate() + 30);
    return today.toISOString().split('T')[0];
  }
};

// Determinar el estado según las fechas
export const determineStatus = (purchaseDate: string, expiryDate: string, redeemedDate?: string): GiftCard["status"] => {
  if (redeemedDate) return "redeemed";
  
  const today = new Date();
  const expiry = new Date(expiryDate);
  
  return today > expiry ? "expired" : "active";
};

export const giftCardService = {
  async fetchGiftCards(): Promise<GiftCard[]> {
    try {
      await getActiveSession();
      
      const { data, error } = await supabase
        .from('gift_cards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convertimos los valores de status al tipo correcto y procesamos los datos
      return (data || []).map(giftCard => ({
        ...giftCard,
        status: giftCard.status as "active" | "redeemed" | "expired",
        is_redeemed: giftCard.status === "redeemed" || giftCard.redeemed_date != null
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
      
      // Determinar estado basado en fechas
      const status = determineStatus(
        newGiftCard.purchase_date, 
        newGiftCard.expiry_date, 
        newGiftCard.redeemed_date
      );
      
      const { data, error } = await supabase
        .from('gift_cards')
        .insert([{
          ...newGiftCard,
          status
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Convertimos los valores de status al tipo correcto
      return {
        ...data,
        status: data.status as "active" | "redeemed" | "expired",
        is_redeemed: data.status === "redeemed" || data.redeemed_date != null
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
      
      // Obtener la gift card actual para tener la información completa
      const { data: currentCard, error: fetchError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Combinar la gift card actual con las actualizaciones
      const updatedGiftCard = {
        ...currentCard,
        ...updates
      };
      
      // Determinar estado basado en fechas si no se especifica en las actualizaciones
      if (!updates.status) {
        updatedGiftCard.status = determineStatus(
          updatedGiftCard.purchase_date, 
          updatedGiftCard.expiry_date, 
          updatedGiftCard.redeemed_date
        );
      }
      
      const { data, error } = await supabase
        .from('gift_cards')
        .update(updatedGiftCard)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Convertimos los valores de status al tipo correcto
      return {
        ...data,
        status: data.status as "active" | "redeemed" | "expired",
        is_redeemed: data.status === "redeemed" || data.redeemed_date != null
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
