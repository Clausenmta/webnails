import { supabase, getActiveSession } from "@/lib/supabase";
import { toast } from "sonner";
import { StockItem, MOCK_STOCK } from "@/types/stock";

/**
 * Service for fetching stock data from Supabase
 */
export const stockQueryService = {
  async fetchStockItems(): Promise<StockItem[]> {
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
  },

  // Keep the old method name for backward compatibility
  async fetchStock(): Promise<StockItem[]> {
    return this.fetchStockItems();
  },

  async getStockItem(id: number): Promise<StockItem | null> {
    try {
      console.log("Buscando item de stock con ID:", id);
      
      // Verificamos la sesión del usuario
      const session = await getActiveSession();
      if (!session) {
        console.warn("No hay sesión activa para buscar item");
        return null;
      }
      
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No se encontró el registro
          console.warn("No se encontró el item de stock con ID:", id);
          return null;
        }
        
        console.error("Error al obtener item de stock:", error.message);
        toast.error(`Error al cargar producto: ${error.message}`);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error al obtener item de stock:", error);
      return null;
    }
  }
};
