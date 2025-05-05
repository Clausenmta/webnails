
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AbsenceHeaderProps {
  onAddAbsence: () => void;
}

export function AbsenceHeader({ onAddAbsence }: AbsenceHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ausencias</h2>
        <p className="text-muted-foreground">
          Gestión de ausencias de empleados
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={onAddAbsence}
          className="bg-salon-600 hover:bg-salon-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Registrar Ausencia
        </Button>
      </div>
    </div>
  );
}
