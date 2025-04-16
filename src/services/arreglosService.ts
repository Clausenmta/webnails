
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Interfaz para Arreglos
export interface Arreglo {
  id: number;
  created_at: string;
  date: string;
  client_name: string;
  service_type: string;
  description: string;
  status: "pendiente" | "en_proceso" | "completado" | "cancelado";
  assigned_to?: string;
  price: number;
  completed_date?: string;
  payment_status: "pendiente" | "pagado";
  created_by: string;
  notes?: string;
}

export type NewArreglo = Omit<Arreglo, 'id' | 'created_at'>;

// Tipos de servicio para arreglos
export const serviceTypes = [
  "Corte de pelo",
  "Coloración",
  "Peinado",
  "Manicura",
  "Pedicura",
  "Tratamiento facial",
  "Otro"
];

// Datos de muestra para cuando Supabase no está configurado
const MOCK_ARREGLOS: Arreglo[] = [
  {
    id: 1,
    created_at: new Date().toISOString(),
    date: "20/04/2025",
    client_name: "Cliente de Ejemplo",
    service_type: "Coloración",
    description: "Coloración rubia con mechas",
    status: "pendiente",
    price: 5000,
    payment_status: "pendiente",
    created_by: "admin"
  }
];

export const arreglosService = {
  async fetchArreglos(): Promise<Arreglo[]> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Usando datos de muestra.");
      return Promise.resolve(MOCK_ARREGLOS);
    }

    try {
      const { data, error } = await supabase
        .from('arreglos')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      // Convertimos los valores de status al tipo correcto
      return (data || []).map(arreglo => ({
        ...arreglo,
        status: arreglo.status as "pendiente" | "en_proceso" | "completado" | "cancelado",
        payment_status: arreglo.payment_status as "pendiente" | "pagado"
      }));
    } catch (error) {
      console.error("Error al obtener arreglos:", error);
      return [];
    }
  },

  async addArreglo(newArreglo: NewArreglo): Promise<Arreglo> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando inserción.");
      const mockArreglo: Arreglo = {
        ...newArreglo,
        id: Math.floor(Math.random() * 1000) + 10,
        created_at: new Date().toISOString()
      };
      return Promise.resolve(mockArreglo);
    }

    try {
      const { data, error } = await supabase
        .from('arreglos')
        .insert([newArreglo])
        .select()
        .single();
      
      if (error) throw error;
      
      // Convertimos los valores de status al tipo correcto
      return {
        ...data,
        status: data.status as "pendiente" | "en_proceso" | "completado" | "cancelado",
        payment_status: data.payment_status as "pendiente" | "pagado"
      };
    } catch (error) {
      console.error("Error al agregar arreglo:", error);
      throw error;
    }
  },

  async updateArreglo(id: number, updates: Partial<NewArreglo>): Promise<Arreglo> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando actualización.");
      const mockArreglo: Arreglo = {
        ...MOCK_ARREGLOS[0],
        ...updates,
        id
      };
      return Promise.resolve(mockArreglo);
    }

    try {
      const { data, error } = await supabase
        .from('arreglos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Convertimos los valores de status al tipo correcto
      return {
        ...data,
        status: data.status as "pendiente" | "en_proceso" | "completado" | "cancelado",
        payment_status: data.payment_status as "pendiente" | "pagado"
      };
    } catch (error) {
      console.error("Error al actualizar arreglo:", error);
      throw error;
    }
  },

  async deleteArreglo(id: number): Promise<void> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando eliminación.");
      return Promise.resolve();
    }

    try {
      const { error } = await supabase
        .from('arreglos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error al eliminar arreglo:", error);
      throw error;
    }
  }
};
