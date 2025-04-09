
import { Button } from "@/components/ui/button";
import { Plus, Wrench } from "lucide-react";

export default function ArreglosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Arreglos</h2>
          <p className="text-muted-foreground">
            Gestiona los servicios que requieren arreglo
          </p>
        </div>
        <Button className="bg-salon-400 hover:bg-salon-500">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Arreglo
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/20">
        <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium">Sección en Construcción</h3>
        <p className="text-muted-foreground mt-1">
          Esta sección estará disponible próximamente
        </p>
      </div>
    </div>
  );
}
