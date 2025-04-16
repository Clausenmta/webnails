
import { supabase, getActiveSession } from "@/lib/supabase";
import { toast } from "sonner";
import { StockItem, MOCK_STOCK } from "@/types/stock";

/**
 * Service for fetching stock data from Supabase
 */
export const stockQueryService = {
  async fetchStock(): Promise<StockItem[]> {
    try {
      console.log("Solicitando stock desde la base de datos");
      
      // Verificamos la sesión del usuario con la función mejorada
      const session = await getActiveSession();
      if (!session) {
        console.warn("No hay sesión activa. Usando datos de muestra.");
        return MOCK_STOCK;
      }
      
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .order('product_name', { ascending: true });
      
      if (error) {
        console.error("Error al obtener stock:", error.message);
        toast.error(`Error al cargar inventario: ${error.message}`);
        throw error;
      }
      
      console.log("Stock obtenido:", data?.length || 0, "items");
      return data || [];
    } catch (error) {
      console.error("Error al obtener stock:", error);
      toast.error(`Error al obtener stock: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return [];
    }
  }
};
