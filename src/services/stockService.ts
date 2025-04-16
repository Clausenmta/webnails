
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    try {
      console.log("Solicitando stock desde la base de datos");
      
      // Verificamos la sesión del usuario
      const { data: { session } } = await supabase.auth.getSession();
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

  async addStockItem(newStockItem: NewStockItem): Promise<StockItem> {
    try {
      console.log("Agregando nuevo item de stock:", newStockItem);
      
      // Verificamos la sesión del usuario
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No hay sesión activa para agregar stock");
        toast.error("Debe iniciar sesión para agregar productos");
        throw new Error("No hay sesión activa");
      }
      
      // Agregamos la información del usuario que crea el producto si no está presente
      if (!newStockItem.created_by) {
        newStockItem.created_by = session.user.email || session.user.id;
      }
      
      const { data, error } = await supabase
        .from('stock')
        .insert([newStockItem])
        .select()
        .single();
      
      if (error) {
        console.error("Error al agregar item de stock:", error.message);
        toast.error(`Error al guardar el producto: ${error.message}`);
        throw error;
      }
      
      console.log("Item de stock agregado correctamente:", data);
      toast.success("Producto agregado correctamente al inventario");
      return data;
    } catch (error) {
      console.error("Error al agregar item de stock:", error);
      toast.error(`Error al agregar producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      throw error;
    }
  },

  async updateStockItem(id: number, updates: Partial<NewStockItem>): Promise<StockItem> {
    try {
      console.log("Actualizando item de stock con ID:", id, "con datos:", updates);
      
      // Verificamos la sesión del usuario
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No hay sesión activa para actualizar stock");
        toast.error("Debe iniciar sesión para actualizar productos");
        throw new Error("No hay sesión activa");
      }
      
      const { data, error } = await supabase
        .from('stock')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Error al actualizar item de stock:", error.message);
        toast.error(`Error al actualizar el producto: ${error.message}`);
        throw error;
      }
      
      console.log("Item de stock actualizado correctamente:", data);
      toast.success("Producto actualizado correctamente");
      return data;
    } catch (error) {
      console.error("Error al actualizar item de stock:", error);
      toast.error(`Error al actualizar producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      throw error;
    }
  },

  async deleteStockItem(id: number): Promise<void> {
    try {
      console.log("Eliminando item de stock con ID:", id);
      
      // Verificamos la sesión del usuario
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error("No hay sesión activa para eliminar stock");
        toast.error("Debe iniciar sesión para eliminar productos");
        throw new Error("No hay sesión activa");
      }
      
      const { error } = await supabase
        .from('stock')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error al eliminar item de stock:", error.message);
        toast.error(`Error al eliminar el producto: ${error.message}`);
        throw error;
      }
      
      console.log("Item de stock eliminado correctamente");
      toast.success("Producto eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar item de stock:", error);
      toast.error(`Error al eliminar producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      throw error;
    }
  }
};
