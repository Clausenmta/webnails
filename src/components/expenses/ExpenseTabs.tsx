
import { Expense } from "@/types/expenses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseList } from "./ExpenseList";
import { ExpenseCategories } from "./ExpenseCategories";
import { UpcomingExpenses } from "./UpcomingExpenses";
import { ExpensesFilters, ExpensesFiltersState } from "./ExpensesFilters";
import { ExpenseCategory } from "@/services/categoryService";

interface ExpenseTabsProps {
  isSuperAdmin: boolean;
  expenses: Expense[];
  filteredExpenses: Expense[];
  filteredExpensesPrevMonth: Expense[];
  filters: ExpensesFiltersState;
  setFilters: (f: ExpensesFiltersState) => void;
  uniqueProviders: string[];
  uniqueUsers: string[];
  availableCategories: ExpenseCategory[];
  onViewExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onMarkAsPaid?: (expenseId: number) => void;
}

export function ExpenseTabs({
  isSuperAdmin,
  expenses,
  filteredExpenses,
  filteredExpensesPrevMonth,
  filters,
  setFilters,
  uniqueProviders,
  uniqueUsers,
  availableCategories,
  onViewExpense,
  onDeleteExpense,
  onMarkAsPaid,
}: ExpenseTabsProps) {
  if (isSuperAdmin) {
    return (
      <div className="space-y-4">
        <Tabs defaultValue="list">
          <TabsList className="mb-4 flex w-full overflow-x-auto">
            <TabsTrigger value="list" className="whitespace-nowrap">Listado de Gastos</TabsTrigger>
            <TabsTrigger value="categories" className="whitespace-nowrap">Gastos por Categoría</TabsTrigger>
            <TabsTrigger value="upcoming" className="whitespace-nowrap">Próximos Vencimientos</TabsTrigger>
          </TabsList>

          <ExpensesFilters
            filters={filters}
            setFilters={setFilters}
            uniqueProviders={uniqueProviders}
            uniqueUsers={uniqueUsers}
            availableCategories={availableCategories}
          />

          <TabsContent value="list">
            <ExpenseList
              expenses={filteredExpenses}
              onViewExpense={onViewExpense}
              onDeleteExpense={onDeleteExpense}
            />
          </TabsContent>

          <TabsContent value="categories">
            <ExpenseCategories
              filteredExpenses={filteredExpenses}
              prevMonthExpenses={filteredExpensesPrevMonth}
            />
          </TabsContent>

          <TabsContent value="upcoming">
            <UpcomingExpenses 
              expenses={expenses} 
              onMarkAsPaid={onMarkAsPaid}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Para usuarios NO super admin, solo el listado y filtros
  return (
    <div className="space-y-4">
      <ExpensesFilters
        filters={filters}
        setFilters={setFilters}
        uniqueProviders={uniqueProviders}
        uniqueUsers={uniqueUsers}
        availableCategories={availableCategories}
      />
      <ExpenseList
        expenses={filteredExpenses}
        onViewExpense={onViewExpense}
        onDeleteExpense={onDeleteExpense}
      />
    </div>
  );
}
