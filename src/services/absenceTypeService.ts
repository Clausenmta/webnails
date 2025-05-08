
import { supabase } from "@/lib/supabase";
import { Database } from "@/integrations/supabase/types";

// Define the enum type from the database
export type TipoAusenciaEnum = Database["public"]["Enums"]["tipo_ausencia_enum"];

export interface AbsenceType {
  id: number;
  nombre: TipoAusenciaEnum;
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
