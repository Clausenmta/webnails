
import { ExpenseHeader } from "@/components/expenses/ExpenseHeader";
import { ExpenseDialogs } from "@/components/expenses/ExpenseDialogs";
import { ExpenseTabs } from "@/components/expenses/ExpenseTabs";
import { useExpenseManagement } from "@/hooks/useExpenseManagement";

export default function GastosPage() {
  const {
    expenses,
    filteredExpenses,
    filteredExpensesPrevMonth,
    filters,
    setFilters,
    uniqueProviders,
    uniqueUsers,
    isSuperAdmin,
    availableCategories,
    isAddExpenseOpen,
    setIsAddExpenseOpen,
    isViewExpenseOpen,
    setIsViewExpenseOpen,
    currentExpense,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    expenseToDelete,
    addExpenseMutation,
    handleViewExpense,
    handleDeleteExpense,
    confirmDeleteExpense,
    handleMarkAsPaid,
    handleExportReport
  } = useExpenseManagement();

  return (
    <div className="space-y-6 max-w-full min-w-0">
      <ExpenseHeader 
        isSuperAdmin={isSuperAdmin}
        onAddExpense={() => setIsAddExpenseOpen(true)}
        onExportReport={handleExportReport}
      />

      <ExpenseTabs 
        isSuperAdmin={isSuperAdmin}
        expenses={expenses}
        filteredExpenses={filteredExpenses}
        filteredExpensesPrevMonth={filteredExpensesPrevMonth}
        filters={filters}
        setFilters={setFilters}
        uniqueProviders={uniqueProviders}
        uniqueUsers={uniqueUsers}
        availableCategories={availableCategories}
        onViewExpense={handleViewExpense}
        onDeleteExpense={handleDeleteExpense}
        onMarkAsPaid={handleMarkAsPaid}
      />

      <ExpenseDialogs 
        isAddExpenseOpen={isAddExpenseOpen}
        setIsAddExpenseOpen={setIsAddExpenseOpen}
        addExpenseMutation={addExpenseMutation}
        availableCategories={availableCategories}
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
