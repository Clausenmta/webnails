
import { Button } from "@/components/ui/button";
import { BarChart, Download } from "lucide-react";

export default function ResultadosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Resultados Mensuales</h2>
          <p className="text-muted-foreground">
            Visualiza los resultados financieros del negocio
          </p>
        </div>
        <Button className="bg-salon-400 hover:bg-salon-500">
          <Download className="mr-2 h-4 w-4" />
          Exportar Informe
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/20">
        <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium">Sección en Construcción</h3>
        <p className="text-muted-foreground mt-1">
          Esta sección estará disponible próximamente
        </p>
      </div>
    </div>
  );
}
