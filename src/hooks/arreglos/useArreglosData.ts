
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { arreglosService, Arreglo, NewArreglo } from "@/services/arreglosService";
import { toast } from "sonner";
import { format } from "date-fns";

export function useArreglosData() {
  const queryClient = useQueryClient();

  const { data: arreglos = [], isLoading } = useQuery({
    queryKey: ['arreglos'],
    queryFn: arreglosService.fetchArreglos,
    meta: {
      onError: (error: any) => {
        console.error("Error al obtener arreglos:", error);
        toast.error(`Error al cargar arreglos: ${error.message}`);
      }
    }
  });

  const addArregloMutation = useMutation({
    mutationFn: arreglosService.addArreglo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arreglos'] });
      toast.success("Arreglo registrado correctamente");
    },
    onError: (error: any) => {
      console.error("Error al registrar el arreglo:", error);
      toast.error(`Error al registrar el arreglo: ${error.message}`);
    }
  });

  const updateArregloMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number, updates: Partial<NewArreglo> }) => 
      arreglosService.updateArreglo(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arreglos'] });
      toast.success("Arreglo actualizado correctamente");
    },
    onError: (error: any) => {
      console.error("Error al actualizar el arreglo:", error);
      toast.error(`Error al actualizar el arreglo: ${error.message}`);
    }
  });

  const deleteArregloMutation = useMutation({
    mutationFn: (id: number) => arreglosService.deleteArreglo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arreglos'] });
      toast.success("Arreglo eliminado correctamente");
    },
    onError: (error: any) => {
      console.error("Error al eliminar el arreglo:", error);
      toast.error(`Error al eliminar el arreglo: ${error.message}`);
    }
  });

  return {
    arreglos,
    isLoading,
    addArregloMutation,
    updateArregloMutation,
    deleteArregloMutation
  };
}
