
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { employeeService } from "@/services/employeeService";
import { useQueryClient } from "@tanstack/react-query";

interface EmployeeStatusToggleProps {
  employeeId: number;
  currentStatus: "active" | "inactive";
  onStatusChange?: () => void;
}

export function EmployeeStatusToggle({ 
  employeeId, 
  currentStatus, 
  onStatusChange 
}: EmployeeStatusToggleProps) {
  const queryClient = useQueryClient();
  
  const handleToggleStatus = async () => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await employeeService.updateEmployee(employeeId, { status: newStatus });
      
      // Call the provided callback if it exists
      if (onStatusChange) {
        onStatusChange();
      } else {
        // Otherwise, invalidate the employees query directly
        queryClient.invalidateQueries({ queryKey: ['employees'] });
      }
      
      toast.success(`Estado actualizado a ${newStatus === "active" ? "Activo" : "Inactivo"}`);
    } catch (error) {
      console.error('Error toggling employee status:', error);
      toast.error('Error al actualizar el estado del empleado');
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleStatus}
      className={`flex items-center gap-2 ${
        currentStatus === "active" ? "text-green-600" : "text-gray-500"
      }`}
    >
      {currentStatus === "active" ? (
        <Check className="h-4 w-4" />
      ) : (
        <X className="h-4 w-4" />
      )}
      {currentStatus === "active" ? "Activo" : "Inactivo"}
    </Button>
  );
}
