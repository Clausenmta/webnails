import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Eye, 
  PlusCircle, 
  Download, 
  Clock, 
  Calendar, 
  AlertTriangle,
  Trash2
} from "lucide-react";
import { format, addDays, isAfter, isBefore } from "date-fns";
import { es } from "date-fns/locale";

interface Expense {
  id: number;
  date: string; // "DD/MM/YYYY"
  concept: string;
  amount: number;
  category: string;
  createdBy: string;
  details?: string;
  dueDate?: string; // "DD/MM/YYYY" - opcional para gastos con vencimiento
  provider?: string; // opcional para gastos con vencimiento
  status?: "pending" | "paid"; // opcional para gastos con vencimiento
}

// Esta es una página de ejemplo simplificada para la gestión de gastos con permisos por rol
export default function GastosPage() {
  const { user, isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  
  // Datos de gastos (inicializado como un array vacío)
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Estados para diálogos
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isViewExpenseOpen, setIsViewExpenseOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  
  // Estado para nuevo gasto
  const [newExpense, setNewExpense] = useState<Omit<Expense, 'id'>>({
    date: format(new Date(), 'dd/MM/yyyy'),
    concept: "",
    amount: 0,
    category: "Insumos",
    createdBy: user?.username || "",
    details: "",
    dueDate: "",
    provider: ""
  });

  // Estado para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Actualizar createdBy cuando cambia el usuario
  useEffect(() => {
    if (user) {
      setNewExpense(prev => ({ ...prev, createdBy: user.username }));
    }
  }, [user]);

  // Categorías de gastos
  const expenseCategories = ["Fijos", "Proveedores", "Insumos", "Servicios", "Marketing", "Personal", "Otros"];
  
  // Gastos por categoría (para el mes actual)
  const expensesByCategory = expenseCategories.map(category => {
    const total = expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      category,
      amount: total
    };
  });
  
  // Gastos próximos a vencer
  const upcomingExpenses = expenses
    .filter(expense => expense.dueDate && expense.status === "pending")
    .sort((a, b) => {
      // Convertir fechas de vencimiento para comparación
      const dateA = a.dueDate ? a.dueDate.split('/').reverse().join('-') : '';
      const dateB = b.dueDate ? b.dueDate.split('/').reverse().join('-') : '';
      return dateA.localeCompare(dateB);
    });

  // Filtrar gastos según el rol del usuario
  const filteredExpenses = isSuperAdmin 
    ? expenses 
    : expenses.filter(expense => 
        expense.createdBy === user?.username || 
        (expense.category !== "Fijos" && expense.category !== "Proveedores")
      );

  const handleAddExpense = () => {
    const id = Math.max(0, ...expenses.map(e => e.id)) + 1;
    const newExpenseRecord = { 
      ...newExpense, 
      id,
      // If the category is Fijos or Proveedores, ensure it has a "pending" status by default
      status: (newExpense.category === "Fijos" || newExpense.category === "Proveedores") 
        ? "pending" as const 
        : undefined
    };
    
    setExpenses([newExpenseRecord, ...expenses]);
    
    // Resetear el formulario
    setNewExpense({
      date: format(new Date(), 'dd/MM/yyyy'),
      concept: "",
      amount: 0,
      category: "Insumos",
      createdBy: user?.username || "",
      details: "",
      dueDate: "",
      provider: ""
    });
    
    setIsAddExpenseOpen(false);
    toast.success("Gasto registrado correctamente");
  };

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
      setExpenses(expenses.filter(expense => expense.id !== expenseToDelete.id));
      setIsDeleteDialogOpen(false);
      setExpenseToDelete(null);
      toast.success("Gasto eliminado correctamente");
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
            {/* Contenido existente del listado de gastos */}
            <Card>
              <CardHeader>
                <CardTitle>Listado de Gastos</CardTitle>
                <CardDescription>
                  {isSuperAdmin 
                    ? "Visualización completa de todos los gastos registrados" 
                    : "Gastos registrados por recepción"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left">Fecha</th>
                        <th className="py-3 px-4 text-left">Concepto</th>
                        <th className="py-3 px-4 text-left">Categoría</th>
                        <th className="py-3 px-4 text-right">Monto</th>
                        {isSuperAdmin && <th className="py-3 px-4 text-left">Registrado por</th>}
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map(expense => (
                        <tr key={expense.id} className="border-b">
                          <td className="py-3 px-4">{expense.date}</td>
                          <td className="py-3 px-4">{expense.concept}</td>
                          <td className="py-3 px-4">{expense.category}</td>
                          <td className="py-3 px-4 text-right">${expense.amount.toLocaleString()}</td>
                          {isSuperAdmin && <td className="py-3 px-4">{expense.createdBy}</td>}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewExpense(expense)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                              {isSuperAdmin && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteExpense(expense)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Eliminar
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Categoría (Mes Actual)</CardTitle>
                <CardDescription>
                  Desglose de gastos agrupados por categoría
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left">Categoría</th>
                        <th className="py-3 px-4 text-right">Monto Total</th>
                        <th className="py-3 px-4 text-right">% del Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expensesByCategory
                        .filter(cat => cat.amount > 0)
                        .sort((a, b) => b.amount - a.amount)
                        .map((category, index) => {
                          const totalExpenses = expensesByCategory.reduce((total, cat) => total + cat.amount, 0);
                          const percentage = totalExpenses > 0 
                            ? ((category.amount / totalExpenses) * 100).toFixed(1) 
                            : "0.0";
                          
                          return (
                            <tr key={index} className="border-b">
                              <td className="py-3 px-4">{category.category}</td>
                              <td className="py-3 px-4 text-right">${category.amount.toLocaleString()}</td>
                              <td className="py-3 px-4 text-right">{percentage}%</td>
                            </tr>
                          );
                        })}
                        <tr className="font-bold bg-muted/30">
                          <td className="py-3 px-4">TOTAL</td>
                          <td className="py-3 px-4 text-right">
                            ${expensesByCategory.reduce((total, cat) => total + cat.amount, 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">100%</td>
                        </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Gastos Próximos a Vencer</CardTitle>
                <CardDescription>
                  Pagos pendientes ordenados por fecha de vencimiento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left">Concepto</th>
                        <th className="py-3 px-4 text-left">Proveedor</th>
                        <th className="py-3 px-4 text-right">Monto</th>
                        <th className="py-3 px-4 text-center">Vencimiento</th>
                        <th className="py-3 px-4 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingExpenses.map(expense => {
                        // Convertir fecha de vencimiento a objeto Date
                        const parts = expense.dueDate ? expense.dueDate.split('/') : [];
                        const dueDate = parts.length === 3 
                          ? new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])) 
                          : new Date();
                        
                        // Calcular si está próximo a vencer (menos de 7 días)
                        const today = new Date();
                        const isCloseToDue = isBefore(dueDate, addDays(today, 7));
                        const isPastDue = isBefore(dueDate, today);
                        
                        return (
                          <tr key={expense.id} className={`border-b ${isPastDue ? 'bg-red-50' : (isCloseToDue ? 'bg-amber-50' : '')}`}>
                            <td className="py-3 px-4">{expense.concept}</td>
                            <td className="py-3 px-4">{expense.provider || "-"}</td>
                            <td className="py-3 px-4 text-right">${expense.amount.toLocaleString()}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center">
                                {expense.dueDate}
                                {isPastDue && (
                                  <AlertTriangle className="ml-2 h-4 w-4 text-red-500" />
                                )}
                                {!isPastDue && isCloseToDue && (
                                  <Clock className="ml-2 h-4 w-4 text-amber-500" />
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                expense.status === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {expense.status === 'paid' ? 'Pagado' : 'Pendiente'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {upcomingExpenses.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No hay gastos próximos a vencer
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Listado de Gastos</CardTitle>
            <CardDescription>
              Gastos registrados por recepción
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left">Fecha</th>
                    <th className="py-3 px-4 text-left">Concepto</th>
                    <th className="py-3 px-4 text-left">Categoría</th>
                    <th className="py-3 px-4 text-right">Monto</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map(expense => (
                    <tr key={expense.id} className="border-b">
                      <td className="py-3 px-4">{expense.date}</td>
                      <td className="py-3 px-4">{expense.concept}</td>
                      <td className="py-3 px-4">{expense.category}</td>
                      <td className="py-3 px-4 text-right">${expense.amount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewExpense(expense)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
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
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select 
                  value={newExpense.category} 
                  onValueChange={(value) => setNewExpense({...newExpense, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="concept">Concepto</Label>
              <Input
                id="concept"
                value={newExpense.concept}
                onChange={(e) => setNewExpense({...newExpense, concept: e.target.value})}
                placeholder="Descripción breve del gasto"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                value={newExpense.amount || ""}
                onChange={(e) => setNewExpense({...newExpense, amount: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="details">Detalles (opcional)</Label>
              <Textarea
                id="details"
                value={newExpense.details || ""}
                onChange={(e) => setNewExpense({...newExpense, details: e.target.value})}
                placeholder="Detalles adicionales del gasto"
              />
            </div>
            
            {(newExpense.category === "Fijos" || newExpense.category === "Proveedores") && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                    <Input
                      id="dueDate"
                      value={newExpense.dueDate || ""}
                      onChange={(e) => setNewExpense({...newExpense, dueDate: e.target.value})}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider">Proveedor</Label>
                    <Input
                      id="provider"
                      value={newExpense.provider || ""}
                      onChange={(e) => setNewExpense({...newExpense, provider: e.target.value})}
                      placeholder="Nombre del proveedor"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddExpense}
              disabled={!newExpense.concept || !newExpense.amount}
              className="bg-salon-400 hover:bg-salon-500"
            >
              Registrar Gasto
            </Button>
          </DialogFooter>
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
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Fecha</p>
                  <p>{currentExpense.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Categoría</p>
                  <p>{currentExpense.category}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">Monto</p>
                <p className="text-lg font-bold">${currentExpense.amount.toLocaleString()}</p>
              </div>
              
              {currentExpense.details && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Detalles</p>
                  <p className="text-sm whitespace-pre-wrap border p-2 rounded-md">{currentExpense.details}</p>
                </div>
              )}
              
              {currentExpense.dueDate && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Fecha de Vencimiento</p>
                    <p>{currentExpense.dueDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Proveedor</p>
                    <p>{currentExpense.provider || '-'}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Registrado por: <span className="font-medium">{currentExpense.createdBy}</span>
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsViewExpenseOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
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
