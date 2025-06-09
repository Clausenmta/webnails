
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
  },

  async updateStock(productId: number, quantity: number, operation: "add" | "remove"): Promise<StockItem> {
    try {
      console.log("Actualizando stock:", { productId, quantity, operation });
      
      // Verificamos la sesión del usuario
      const session = await getActiveSession();
      if (!session) {
        console.error("No hay sesión activa para actualizar stock");
        toast.error("Debe iniciar sesión para actualizar stock");
        throw new Error("No hay sesión activa");
      }

      // Primero obtenemos el stock actual
      const { data: currentStock, error: fetchError } = await supabase
        .from('stock')
        .select('quantity')
        .eq('id', productId)
        .single();

      if (fetchError) {
        console.error("Error al obtener stock actual:", fetchError.message);
        toast.error(`Error al obtener stock actual: ${fetchError.message}`);
        throw fetchError;
      }

      // Calculamos la nueva cantidad
      const currentQuantity = Number(currentStock.quantity);
      let newQuantity: number;

      if (operation === "add") {
        newQuantity = currentQuantity + quantity;
      } else {
        newQuantity = currentQuantity - quantity;
        if (newQuantity < 0) {
          toast.error("No se puede reducir el stock por debajo de 0");
          throw new Error("Stock insuficiente");
        }
      }

      // Actualizamos el stock
      const { data, error } = await supabase
        .from('stock')
        .update({ quantity: newQuantity })
        .eq('id', productId)
        .select()
        .single();

      if (error) {
        console.error("Error al actualizar stock:", error.message);
        toast.error(`Error al actualizar stock: ${error.message}`);
        throw error;
      }

      console.log("Stock actualizado correctamente:", data);
      return data;
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      toast.error(`Error al actualizar stock: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      throw error;
    }
  }
};
