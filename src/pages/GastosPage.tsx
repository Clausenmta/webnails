
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseDetail } from "@/components/expenses/ExpenseDetail";
import { ExpenseCategories } from "@/components/expenses/ExpenseCategories";
import { UpcomingExpenses } from "@/components/expenses/UpcomingExpenses";
import { expenseService } from "@/services/expenseService";
import { Expense } from "@/types/expenses";

export default function GastosPage() {
  const { user, isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  const queryClient = useQueryClient();
  
  // Estados para diálogos
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isViewExpenseOpen, setIsViewExpenseOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Query para obtener gastos
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: expenseService.fetchExpenses
  });

  // Mutación para agregar gastos
  const addExpenseMutation = useMutation({
    mutationFn: expenseService.addExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsAddExpenseOpen(false);
      toast.success("Gasto registrado correctamente");
    },
    onError: (error) => {
      toast.error("Error al registrar el gasto: " + error.message);
    }
  });

  // Mutación para eliminar gastos
  const deleteExpenseMutation = useMutation({
    mutationFn: (id: number) => expenseService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
      toast.success("Gasto eliminado correctamente");
    },
    onError: (error) => {
      toast.error("Error al eliminar el gasto: " + error.message);
    }
  });

  // Filtrar gastos según el rol del usuario
  const filteredExpenses = isSuperAdmin 
    ? expenses 
    : expenses.filter(expense => 
        expense.created_by === user?.username || 
        (expense.category !== "Fijos" && expense.category !== "Proveedores")
      );

  const handleViewExpense = (expense: Expense) => {
    setCurrentExpense(expense);
    setIsViewExpenseOpen(true);
  };

  // Función para manejar la eliminación de gastos
  const handleDeleteExpense = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteDialogOpen(true);
  };

  // Función para confirmar la eliminación
  const confirmDeleteExpense = () => {
    if (expenseToDelete) {
      deleteExpenseMutation.mutate(expenseToDelete.id);
    }
  };

  const handleExportReport = () => {
    toast.success("Reporte de gastos exportado correctamente");
    
    // Simulación de descarga de archivo
    const dummyContent = "Reporte de Gastos\n\n" + 
      filteredExpenses.map(expense => 
        `${expense.date} - ${expense.concept} - $${expense.amount.toLocaleString()}`
      ).join('\n');
    
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Gastos_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
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
            onClick={() => setIsAddExpenseOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Registrar Gasto
          </Button>
          {isSuperAdmin && (
            <Button 
              variant="outline"
              onClick={handleExportReport}
            >
              <FileText className="mr-2 h-4 w-4" />
              Exportar Reporte
            </Button>
          )}
        </div>
      </div>

      {isSuperAdmin && (
        <Tabs defaultValue="list">
          <TabsList className="mb-4">
            <TabsTrigger value="list">Listado de Gastos</TabsTrigger>
            <TabsTrigger value="categories">Gastos por Categoría</TabsTrigger>
            <TabsTrigger value="upcoming">Próximos Vencimientos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list">
            <ExpenseList 
              expenses={filteredExpenses} 
              onViewExpense={handleViewExpense} 
              onDeleteExpense={handleDeleteExpense} 
            />
          </TabsContent>
          
          <TabsContent value="categories">
            <ExpenseCategories expenses={expenses} />
          </TabsContent>
          
          <TabsContent value="upcoming">
            <UpcomingExpenses expenses={expenses} />
          </TabsContent>
        </Tabs>
      )}

      {!isSuperAdmin && (
        <ExpenseList 
          expenses={filteredExpenses} 
          onViewExpense={handleViewExpense} 
          onDeleteExpense={handleDeleteExpense} 
        />
      )}

      {/* Dialog para registrar gasto */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
            <DialogDescription>
              Completa los detalles del gasto para registrarlo
            </DialogDescription>
          </DialogHeader>
          
          <ExpenseForm 
            onSubmit={addExpenseMutation.mutate} 
            isSubmitting={addExpenseMutation.isPending} 
            onCancel={() => setIsAddExpenseOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Dialog para ver detalle de gasto */}
      <Dialog open={isViewExpenseOpen} onOpenChange={setIsViewExpenseOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalle del Gasto</DialogTitle>
            <DialogDescription>
              {currentExpense?.concept}
            </DialogDescription>
          </DialogHeader>
          
          {currentExpense && (
            <ExpenseDetail 
              expense={currentExpense} 
              onClose={() => setIsViewExpenseOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar gasto */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este gasto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El gasto será eliminado permanentemente de la base de datos.
              {expenseToDelete && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p><strong>Concepto:</strong> {expenseToDelete.concept}</p>
                  <p><strong>Monto:</strong> ${expenseToDelete.amount.toLocaleString()}</p>
                  <p><strong>Fecha:</strong> {expenseToDelete.date}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteExpense}
              className="bg-red-500 hover:bg-red-600"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
