
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Interfaz para Stock
export interface StockItem {
  id: number;
  created_at: string;
  product_name: string;
  category: string;
  brand?: string;
  quantity: number;
  unit_price: number;
  purchase_date: string;
  expiry_date?: string;
  min_stock_level?: number;
  location?: string;
  supplier?: string;
  created_by: string;
}

export type NewStockItem = Omit<StockItem, 'id' | 'created_at'>;

// Categorías de productos para stock
export const stockCategories = [
  "Productos para cabello",
  "Productos para uñas",
  "Cosméticos",
  "Cuidado facial",
  "Equipamiento",
  "Herramientas",
  "Otros"
];

// Datos de muestra para cuando Supabase no está configurado
const MOCK_STOCK: StockItem[] = [
  {
    id: 1,
    created_at: new Date().toISOString(),
    product_name: "Shampoo profesional",
    category: "Productos para cabello",
    brand: "Marca Ejemplo",
    quantity: 10,
    unit_price: 1800,
    purchase_date: "01/04/2025",
    expiry_date: "01/04/2026",
    min_stock_level: 3,
    supplier: "Proveedor Ejemplo",
    created_by: "admin"
  }
];

export const stockService = {
  async fetchStock(): Promise<StockItem[]> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Usando datos de muestra.");
      return Promise.resolve(MOCK_STOCK);
    }

    try {
      const { data, error } = await supabase
        .from('stock')
        .select('*')
        .order('product_name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error al obtener stock:", error);
      return [];
    }
  },

  async addStockItem(newStockItem: NewStockItem): Promise<StockItem> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando inserción.");
      const mockStockItem: StockItem = {
        ...newStockItem,
        id: Math.floor(Math.random() * 1000) + 10,
        created_at: new Date().toISOString()
      };
      return Promise.resolve(mockStockItem);
    }

    try {
      const { data, error } = await supabase
        .from('stock')
        .insert([newStockItem])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error al agregar item de stock:", error);
      throw error;
    }
  },

  async updateStockItem(id: number, updates: Partial<NewStockItem>): Promise<StockItem> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando actualización.");
      const mockStockItem: StockItem = {
        ...MOCK_STOCK[0],
        ...updates,
        id
      };
      return Promise.resolve(mockStockItem);
    }

    try {
      const { data, error } = await supabase
        .from('stock')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error al actualizar item de stock:", error);
      throw error;
    }
  },

  async deleteStockItem(id: number): Promise<void> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando eliminación.");
      return Promise.resolve();
    }

    try {
      const { error } = await supabase
        .from('stock')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error al eliminar item de stock:", error);
      throw error;
    }
  }
};
