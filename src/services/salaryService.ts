
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";

// Interfaz para Sueldos
export interface Salary {
  id: string;
  empleado_id: number;
  mes: number;
  anio: number;
  facturacion: number;
  comision: number;
  adelanto: number;
  vacaciones: number;
  recepcion: number;
  otros: number;
  recibo: number;
  total_efectivo: number;
  total_completo: number;
  asegurado: number;
  created_at: string;
  created_by: string;
}

export type NewSalary = Omit<Salary, 'id' | 'created_at'>;

export const salaryService = {
  async fetchSalaries(mes: number, anio: number): Promise<Salary[]> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Usando datos de muestra.");
      return Promise.resolve([]);
    }

    try {
      const { data, error } = await supabase
        .from('sueldos')
        .select('*')
        .eq('mes', mes)
        .eq('anio', anio)
        .order('empleado_id', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error("Error al obtener sueldos:", error);
      return [];
    }
  },

  async fetchEmployeeSalaryHistory(empleado_id: number): Promise<Salary[]> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Usando datos de muestra.");
      return Promise.resolve([]);
    }

    try {
      const { data, error } = await supabase
        .from('sueldos')
        .select('*')
        .eq('empleado_id', empleado_id)
        .order('anio', { ascending: false })
        .order('mes', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error("Error al obtener historial de sueldos:", error);
      return [];
    }
  },

  async upsertSalary(salaryData: NewSalary): Promise<Salary> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando inserción.");
      const mockSalary: Salary = {
        ...salaryData,
        id: Math.random().toString(),
        created_at: new Date().toISOString()
      };
      toast.success("Sueldo guardado exitosamente");
      return Promise.resolve(mockSalary);
    }

    try {
      const { data, error } = await supabase
        .from('sueldos')
        .upsert([salaryData], {
          onConflict: 'empleado_id,mes,anio'
        })
        .select()
        .single();
      
      if (error) {
        toast.error("Error al guardar sueldo: " + error.message);
        throw error;
      }
      
      toast.success("Sueldo guardado exitosamente");
      return data;
    } catch (error) {
      console.error("Error al guardar sueldo:", error);
      throw error;
    }
  },

  async deleteSalary(id: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando eliminación.");
      toast.success("Sueldo eliminado exitosamente");
      return Promise.resolve();
    }

    try {
      const { error } = await supabase
        .from('sueldos')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast.error("Error al eliminar sueldo: " + error.message);
        throw error;
      }

      toast.success("Sueldo eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar sueldo:", error);
      throw error;
    }
  }
};
