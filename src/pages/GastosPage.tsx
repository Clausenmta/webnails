
import { ExpenseHeader } from "@/components/expenses/ExpenseHeader";
import { ExpenseDialogs } from "@/components/expenses/ExpenseDialogs";
import { ExpenseTabs } from "@/components/expenses/ExpenseTabs";
import { useExpenseManagement } from "@/hooks/useExpenseManagement";

export default function GastosPage() {
  const {
    // Estado y datos
    expenses,
    filteredExpenses,
    isSuperAdmin,
    
    // Estado de diálogos
    isAddExpenseOpen,
    setIsAddExpenseOpen,
    isViewExpenseOpen,
    setIsViewExpenseOpen,
    currentExpense,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    expenseToDelete,
    
    // Mutaciones
    addExpenseMutation,
    
    // Manejadores de eventos
    handleViewExpense,
    handleDeleteExpense,
    confirmDeleteExpense,
    handleExportReport
  } = useExpenseManagement();

  return (
    <div className="space-y-6">
      <ExpenseHeader 
        isSuperAdmin={isSuperAdmin}
        onAddExpense={() => setIsAddExpenseOpen(true)}
        onExportReport={handleExportReport}
      />

      <ExpenseTabs 
        isSuperAdmin={isSuperAdmin}
        expenses={expenses}
        filteredExpenses={filteredExpenses}
        onViewExpense={handleViewExpense}
        onDeleteExpense={handleDeleteExpense}
      />

      <ExpenseDialogs 
        isAddExpenseOpen={isAddExpenseOpen}
        setIsAddExpenseOpen={setIsAddExpenseOpen}
        addExpenseMutation={addExpenseMutation}
        isViewExpenseOpen={isViewExpenseOpen}
        setIsViewExpenseOpen={setIsViewExpenseOpen}
        currentExpense={currentExpense}
        isDeleteDialogOpen={isDeleteDialogOpen}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        expenseToDelete={expenseToDelete}
        confirmDeleteExpense={confirmDeleteExpense}
      />
    </div>
  );
}
