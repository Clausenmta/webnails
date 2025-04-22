
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
  service?: string; // Changed from customer_email to service
  purchase_date: string;
  expiry_date: string;
  redeemed_date?: string;
  created_by: string;
  notes?: string;
  branch?: string; // Propiedad UI, no se guarda en BD
}

// Necesitamos que NewGiftCard tenga la propiedad branch para el UI
export type NewGiftCard = Omit<GiftCard, 'id' | 'created_at'> & {
  branch?: string; // Ensure branch is explicitly defined here
  service?: string; // Explicitly define service to replace customer_email
};

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
    service: "Corte y Color", // Changed from customer_email to service
    purchase_date: "01/04/2025",
    expiry_date: "01/05/2025",
    created_by: "admin",
    branch: "Fisherton"
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
        service: giftCard.customer_email, // Map customer_email to service for UI
        branch: undefined // Initialize branch as undefined for all fetched records
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
      
      // Store branch value before removing it for database insertion
      const branch = newGiftCard.branch;
      
      // Extract fields that don't exist in the database
      const { branch: _, ...giftCardData } = newGiftCard;
      
      // Create a data object specifically for the database with correct field mapping
      // Aseguramos que todos los campos numéricos tengan valores por defecto si están vacíos
      const dbGiftCardData = {
        code: giftCardData.code,
        amount: giftCardData.amount || 0, // Valor por defecto para amount si está vacío
        status: status,
        customer_name: giftCardData.customer_name || null,
        customer_email: giftCardData.service || null, // Map service to customer_email for database
        purchase_date: giftCardData.purchase_date,
        expiry_date: giftCardData.expiry_date,
        redeemed_date: giftCardData.redeemed_date || null,
        created_by: giftCardData.created_by,
        notes: giftCardData.notes || null
      };
      
      const { data, error } = await supabase
        .from('gift_cards')
        .insert([dbGiftCardData])
        .select()
        .single();
      
      if (error) throw error;
      
      // Reintegrate the branch with the returned data
      return {
        ...data,
        status: data.status as "active" | "redeemed" | "expired",
        service: data.customer_email, // Map customer_email to service for UI
        branch // Reintegrate branch for UI purposes
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
      
      // Store branch value before removing it for database update
      const branch = updates.branch;
      
      // Extract fields that don't exist in the database
      const { branch: _, service, ...otherUpdates } = updates;
      
      // Prepare database updates with mapping service to customer_email
      const dbUpdates: Record<string, any> = {
        ...otherUpdates
      };
      
      // Manejar los campos que podrían estar vacíos
      if (dbUpdates.amount === '') {
        dbUpdates.amount = 0;
      }
      
      // Only add customer_email field if service was provided
      if (service !== undefined) {
        dbUpdates.customer_email = service || null;
      }
      
      // Combinar la gift card actual con las actualizaciones
      const updatedGiftCard = {
        ...currentCard,
        ...dbUpdates
      };
      
      // Determinar estado basado en fechas si no se especifica en las actualizaciones
      if (!updates.status) {
        updatedGiftCard.status = determineStatus(
          updatedGiftCard.purchase_date, 
          updatedGiftCard.expiry_date, 
          updatedGiftCard.redeemed_date
        );
      }
      
      console.log("Updating gift card with:", updatedGiftCard);
      
      const { data, error } = await supabase
        .from('gift_cards')
        .update(updatedGiftCard)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Add back the branch property to the returned data
      return {
        ...data,
        status: data.status as "active" | "redeemed" | "expired",
        service: data.customer_email, // Map customer_email to service for UI
        branch // Reintegrate branch for UI purposes
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
  },
  
  // Función para importar múltiples tarjetas de regalo
  async importGiftCards(giftCards: NewGiftCard[]): Promise<{ successful: number; failed: number; errors: string[] }> {
    try {
      const session = await getActiveSession();
      if (!session) {
        throw new Error("Debe iniciar sesión para realizar esta operación");
      }
      
      // Preparar los datos para la inserción
      const dbGiftCards = giftCards.map(card => {
        // Determinar estado basado en fechas
        const status = determineStatus(
          card.purchase_date, 
          card.expiry_date, 
          card.redeemed_date
        );
        
        // Mapear los campos para la base de datos
        return {
          code: card.code,
          amount: card.amount || 0, // Valor por defecto si está vacío
          status: status,
          customer_name: card.customer_name || null,
          customer_email: card.service || null, // Map service to customer_email
          purchase_date: card.purchase_date,
          expiry_date: card.expiry_date,
          redeemed_date: card.redeemed_date || null,
          created_by: card.created_by || 'importación',
          notes: card.notes || null
        };
      });
      
      // Realizar la inserción de todos los registros
      const { data, error } = await supabase
        .from('gift_cards')
        .insert(dbGiftCards)
        .select();
      
      if (error) throw error;
      
      return {
        successful: data?.length || 0,
        failed: giftCards.length - (data?.length || 0),
        errors: []
      };
    } catch (error) {
      handleSupabaseError(error, "importar tarjetas de regalo");
      return {
        successful: 0,
        failed: giftCards.length,
        errors: [error.message || "Error desconocido al importar tarjetas de regalo"]
      };
    }
  }
};
