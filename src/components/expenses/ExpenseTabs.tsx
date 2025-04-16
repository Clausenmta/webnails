
import { Expense } from "@/types/expenses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExpenseList } from "./ExpenseList";
import { ExpenseCategories } from "./ExpenseCategories";
import { UpcomingExpenses } from "./UpcomingExpenses";

interface ExpenseTabsProps {
  isSuperAdmin: boolean;
  expenses: Expense[];
  filteredExpenses: Expense[];
  onViewExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
}

export function ExpenseTabs({ 
  isSuperAdmin, 
  expenses, 
  filteredExpenses,
  onViewExpense, 
  onDeleteExpense 
}: ExpenseTabsProps) {
  if (isSuperAdmin) {
    return (
      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Listado de Gastos</TabsTrigger>
          <TabsTrigger value="categories">Gastos por Categoría</TabsTrigger>
          <TabsTrigger value="upcoming">Próximos Vencimientos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <ExpenseList 
            expenses={filteredExpenses} 
            onViewExpense={onViewExpense} 
            onDeleteExpense={onDeleteExpense} 
          />
        </TabsContent>
        
        <TabsContent value="categories">
          <ExpenseCategories expenses={expenses} />
        </TabsContent>
        
        <TabsContent value="upcoming">
          <UpcomingExpenses expenses={expenses} />
        </TabsContent>
      </Tabs>
    );
  }
  
  return (
    <ExpenseList 
      expenses={filteredExpenses} 
      onViewExpense={onViewExpense} 
      onDeleteExpense={onDeleteExpense} 
    />
  );
}
