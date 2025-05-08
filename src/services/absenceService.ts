
import { supabase } from "@/lib/supabase";
import { TipoAusenciaEnum } from "./absenceTypeService";

export interface Absence {
  id: number;
  employee_id: number;
  tipo_ausencia: TipoAusenciaEnum;
  fecha_inicio: string;
  fecha_fin: string;
  observaciones?: string;
  created_at: string;
  created_by: string;
  employee_name?: string;
}

export interface AbsenceCreate {
  employee_id: number;
  tipo_ausencia: TipoAusenciaEnum;
  fecha_inicio: string;
  fecha_fin: string;
  observaciones?: string;
  created_by: string;
}

export const absenceService = {
  // Fetch all absences
  async fetchAbsences(): Promise<Absence[]> {
    try {
      const { data, error } = await supabase
        .from('ausencias_empleados')
        .select(`
          id,
          employee_id,
          tipo_ausencia,
          fecha_inicio,
          fecha_fin,
          observaciones,
          created_at,
          created_by
        `);

      if (error) {
        console.error("Error fetching absences:", error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("Error in fetchAbsences:", error);
      throw error;
    }
  },

  // Add a new absence
  async addAbsence(absence: AbsenceCreate): Promise<Absence> {
    try {
      const { data, error } = await supabase
        .from('ausencias_empleados')
        .insert(absence as any)
        .select()
        .single();

      if (error) {
        console.error("Error adding absence:", error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error in addAbsence:", error);
      throw error;
    }
  },

  // Update an existing absence
  async updateAbsence(id: number, updates: Partial<AbsenceCreate>): Promise<Absence> {
    try {
      const { data, error } = await supabase
        .from('ausencias_empleados')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Error updating absence:", error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error in updateAbsence:", error);
      throw error;
    }
  },

  // Delete an absence
  async deleteAbsence(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('ausencias_empleados')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting absence:", error);
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Error in deleteAbsence:", error);
      throw error;
    }
  },

  // Get absences for a specific employee
  async getEmployeeAbsences(employeeId: number): Promise<Absence[]> {
    try {
      const { data, error } = await supabase
        .from('ausencias_empleados')
        .select()
        .eq('employee_id', employeeId);

      if (error) {
        console.error("Error fetching employee absences:", error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("Error in getEmployeeAbsences:", error);
      throw error;
    }
  }
};
