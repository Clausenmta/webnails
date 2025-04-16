
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

// Interfaz para Empleados
export interface Employee {
  id: number;
  created_at: string;
  name: string;
  email: string;
  position: string;
  hire_date: string;
  salary: number;
  phone?: string;
  address?: string;
  status: "active" | "inactive";
  schedule?: any; // Json
  skills?: string[];
  performance_rating?: number;
  created_by: string;
}

export type NewEmployee = Omit<Employee, 'id' | 'created_at'>;

// Posiciones disponibles para empleados
export const employeePositions = [
  "Estilista",
  "Manicurista",
  "Recepcionista",
  "Asistente",
  "Gerente",
  "Administrativo"
];

// Datos de muestra para cuando Supabase no está configurado
const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 1,
    created_at: new Date().toISOString(),
    name: "Empleado de Ejemplo",
    email: "empleado@example.com",
    position: "Estilista",
    hire_date: "01/01/2025",
    salary: 45000,
    phone: "11-1234-5678",
    status: "active",
    created_by: "admin"
  }
];

export const employeeService = {
  async fetchEmployees(): Promise<Employee[]> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Usando datos de muestra.");
      return Promise.resolve(MOCK_EMPLOYEES);
    }

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error al obtener empleados:", error);
      return [];
    }
  },

  async addEmployee(newEmployee: NewEmployee): Promise<Employee> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando inserción.");
      const mockEmployee: Employee = {
        ...newEmployee,
        id: Math.floor(Math.random() * 1000) + 10,
        created_at: new Date().toISOString()
      };
      return Promise.resolve(mockEmployee);
    }

    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([newEmployee])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error al agregar empleado:", error);
      throw error;
    }
  },

  async updateEmployee(id: number, updates: Partial<NewEmployee>): Promise<Employee> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando actualización.");
      const mockEmployee: Employee = {
        ...MOCK_EMPLOYEES[0],
        ...updates,
        id
      };
      return Promise.resolve(mockEmployee);
    }

    try {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error al actualizar empleado:", error);
      throw error;
    }
  },

  async deleteEmployee(id: number): Promise<void> {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase no está configurado. Simulando eliminación.");
      return Promise.resolve();
    }

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error al eliminar empleado:", error);
      throw error;
    }
  }
};
