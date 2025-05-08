
import { supabase } from "@/lib/supabase";

export interface AbsenceType {
  id: number;
  nombre: string;
}

export const absenceTypeService = {
  async fetchAbsenceTypes(): Promise<AbsenceType[]> {
    try {
      const { data, error } = await supabase
        .from('tipo_ausencia_opciones')
        .select('id, nombre')
        .order('nombre');
      
      if (error) {
        console.error("Error fetching absence types:", error);
        throw new Error(error.message);
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in fetchAbsenceTypes:", error);
      throw error;
    }
  }
};
