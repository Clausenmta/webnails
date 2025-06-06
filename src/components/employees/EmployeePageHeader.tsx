
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";

interface EmployeePageHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddEmployee: () => void;
}

export const EmployeePageHeader = ({ 
  searchTerm, 
  onSearchChange, 
  onAddEmployee 
}: EmployeePageHeaderProps) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Empleados</h2>
        <p className="text-muted-foreground">
          Gestión del personal del salón
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar empleado..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-[300px]"
        />
        <Button
          onClick={onAddEmployee}
          className="bg-salon-600 hover:bg-salon-700"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar Empleado
        </Button>
      </div>
    </div>
  );
};
