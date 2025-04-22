
import { Expense } from "@/types/expenses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseList } from "./ExpenseList";
import { ExpenseCategories } from "./ExpenseCategories";
import { UpcomingExpenses } from "./UpcomingExpenses";
import { ExpensesFilters, ExpensesFiltersState } from "./ExpensesFilters";

interface ExpenseTabsProps {
  isSuperAdmin: boolean;
  expenses: Expense[];
  filteredExpenses: Expense[];
  filteredExpensesPrevMonth: Expense[];
  filters: ExpensesFiltersState;
  setFilters: (f: ExpensesFiltersState) => void;
  uniqueProviders: string[];
  uniqueUsers: string[];
  onViewExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
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
  onViewExpense,
  onDeleteExpense,
}: ExpenseTabsProps) {
  if (isSuperAdmin) {
    return (
      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Listado de Gastos</TabsTrigger>
          <TabsTrigger value="categories">Gastos por Categoría</TabsTrigger>
          <TabsTrigger value="upcoming">Próximos Vencimientos</TabsTrigger>
        </TabsList>

        <ExpensesFilters
          filters={filters}
          setFilters={setFilters}
          uniqueProviders={uniqueProviders}
          uniqueUsers={uniqueUsers}
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
          <UpcomingExpenses expenses={expenses} />
        </TabsContent>
      </Tabs>
    );
  }

  // Para usuarios NO super admin, solo el listado y filtros
  return (
    <>
      <ExpensesFilters
        filters={filters}
        setFilters={setFilters}
        uniqueProviders={uniqueProviders}
        uniqueUsers={uniqueUsers}
      />
      <ExpenseList
        expenses={filteredExpenses}
        onViewExpense={onViewExpense}
        onDeleteExpense={onDeleteExpense}
      />
    </>
  );
}

