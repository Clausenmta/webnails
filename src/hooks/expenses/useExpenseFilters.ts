
import { useState, useMemo } from "react";
import { Expense } from "@/types/expenses";
import { ExpensesFiltersState } from "@/components/expenses/ExpensesFilters";

export function useExpenseFilters(expenses: Expense[]) {
  const [filters, setFilters] = useState<ExpensesFiltersState>(() => {
    const now = new Date();
    return {
      date: new Date(now.getFullYear(), now.getMonth(), 1),
      concept: "",
      category: "",
      provider: "",
      payment_method: "",
      created_by: ""
    }
  });

  const uniqueProviders = useMemo(() => {
    const providers = expenses.map(e => e.provider).filter(Boolean);
    return Array.from(new Set(providers as string[]));
  }, [expenses]);

  const uniqueUsers = useMemo(() => {
    const users = expenses.map(e => e.created_by).filter(Boolean);
    return Array.from(new Set(users));
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      if (filters.date) {
        const [day, month, year] = expense.date.split("/");
        const expDate = new Date(Number(year), Number(month) - 1);
        if (
          expDate.getMonth() !== filters.date.getMonth() ||
          expDate.getFullYear() !== filters.date.getFullYear()
        ) return false;
      }
      if (filters.concept && !expense.concept?.toLowerCase().includes(filters.concept.toLowerCase())) return false;
      if (filters.category && expense.category !== filters.category) return false;
      if (filters.provider && expense.provider !== filters.provider) return false;
      if (filters.payment_method && expense.payment_method !== filters.payment_method) return false;
      if (filters.created_by && expense.created_by !== filters.created_by) return false;
      return true;
    });
  }, [expenses, filters]);

  const filteredExpensesPrevMonth = useMemo(() => {
    return expenses.filter(expense => {
      if (filters.date) {
        const d = filters.date;
        const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
        const [day, month, year] = expense.date.split("/");
        const expDate = new Date(Number(year), Number(month) - 1);
        return (
          expDate.getMonth() === prev.getMonth() &&
          expDate.getFullYear() === prev.getFullYear() &&
          (!filters.category || expense.category === filters.category)
        );
      }
      return false;
    });
  }, [expenses, filters]);

  return {
    filters,
    setFilters,
    uniqueProviders,
    uniqueUsers,
    filteredExpenses,
    filteredExpensesPrevMonth
  };
}
