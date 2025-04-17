
import { supabase, getActiveSession } from "@/lib/supabase";
import { toast } from "sonner";

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

export const arreglosService = {
  async fetchArreglos(): Promise<Arreglo[]> {
    try {
      await getActiveSession();
      
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
      handleSupabaseError(error, "obtener arreglos");
      return MOCK_ARREGLOS;
    }
  },

  async addArreglo(newArreglo: NewArreglo): Promise<Arreglo> {
    try {
      const session = await getActiveSession();
      if (!session) {
        throw new Error("Debe iniciar sesión para realizar esta operación");
      }
      
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
      handleSupabaseError(error, "agregar arreglo");
      throw error;
    }
  },

  async updateArreglo(id: number, updates: Partial<NewArreglo>): Promise<Arreglo> {
    try {
      const session = await getActiveSession();
      if (!session) {
        throw new Error("Debe iniciar sesión para realizar esta operación");
      }
      
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
      handleSupabaseError(error, "actualizar arreglo");
      throw error;
    }
  },

  async deleteArreglo(id: number): Promise<void> {
    try {
      const session = await getActiveSession();
      if (!session) {
        throw new Error("Debe iniciar sesión para realizar esta operación");
      }
      
      const { error } = await supabase
        .from('arreglos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error, "eliminar arreglo");
      throw error;
    }
  }
};
