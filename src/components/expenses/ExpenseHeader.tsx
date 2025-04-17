
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, PlusCircle } from "lucide-react";

interface ExpenseHeaderProps {
  isSuperAdmin: boolean;
  onAddExpense: () => void;
  onExportReport: () => void;
}

export function ExpenseHeader({ isSuperAdmin, onAddExpense, onExportReport }: ExpenseHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gastos</h2>
        <p className="text-muted-foreground">
          {isSuperAdmin 
            ? "Gestión completa de gastos del salón" 
            : "Registro de gastos e insumos"}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button 
          className="bg-salon-400 hover:bg-salon-500"
          onClick={onAddExpense}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Gasto
        </Button>
        {isSuperAdmin && (
          <Button 
            variant="outline"
            onClick={onExportReport}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        )}
      </div>
    </div>
  );
}
