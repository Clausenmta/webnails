
import { supabase, getActiveSession } from "@/lib/supabase";
import { toast } from "sonner";
import { StockItem, NewStockItem } from "@/types/stock";

/**
 * Service for stock mutation operations (add, update, delete)
 */
export const stockMutationService = {
  async addStockItem(newStockItem: NewStockItem): Promise<StockItem> {
    try {
      console.log("Agregando nuevo item de stock:", newStockItem);
      
      // Verificamos la sesión del usuario con la función mejorada
      const session = await getActiveSession();
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
      
      // Verificamos la sesión del usuario con la función mejorada
      const session = await getActiveSession();
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
      
      // Verificamos la sesión del usuario con la función mejorada
      const session = await getActiveSession();
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
