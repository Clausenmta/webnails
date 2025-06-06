
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { paymentMethods } from "@/types/expenses";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseCategory } from "@/services/categoryService";

interface ExpensesFiltersProps {
  filters: ExpensesFiltersState;
  setFilters: (filters: ExpensesFiltersState) => void;
  uniqueProviders: string[];
  uniqueUsers: string[];
  availableCategories: ExpenseCategory[];
}

export interface ExpensesFiltersState {
  date: Date; // Always the *first* day of current selected month
  concept: string;
  category: string;
  provider: string;
  payment_method: string;
  created_by: string;
}

export function ExpensesFilters({ 
  filters, 
  setFilters, 
  uniqueProviders, 
  uniqueUsers,
  availableCategories
}: ExpensesFiltersProps) {
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const currentYear = new Date().getFullYear();
  const availableYears = [
    (currentYear - 2).toString(),
    (currentYear - 1).toString(),
    currentYear.toString(),
    (currentYear + 1).toString()
  ];

  const selectedMonth = monthNames[filters.date.getMonth()];
  const selectedYear = filters.date.getFullYear().toString();

  const handleMonthChange = (month: string) => {
    const monthIndex = monthNames.indexOf(month);
    const newDate = new Date(filters.date.getFullYear(), monthIndex, 1);
    setFilters({ ...filters, date: newDate });
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(parseInt(year), filters.date.getMonth(), 1);
    setFilters({ ...filters, date: newDate });
  };

  const handleChange = (field: keyof ExpensesFiltersState, value: string) => {
    setFilters({ ...filters, [field]: value });
  };

  return (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3">
      {/* Mes */}
      <Select value={selectedMonth} onValueChange={handleMonthChange}>
        <SelectTrigger>
          <SelectValue placeholder="Mes" />
        </SelectTrigger>
        <SelectContent>
          {monthNames.map((month) => (
            <SelectItem key={month} value={month}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Año */}
      <Select value={selectedYear} onValueChange={handleYearChange}>
        <SelectTrigger>
          <SelectValue placeholder="Año" />
        </SelectTrigger>
        <SelectContent>
          {availableYears.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Concepto */}
      <Input
        placeholder="Concepto"
        value={filters.concept}
        onChange={e => handleChange("concept", e.target.value)}
        className=""
      />
      {/* Categoría */}
      <select
        className="border rounded px-2 py-2"
        value={filters.category}
        onChange={e => handleChange("category", e.target.value)}
      >
        <option value="">Todas las categorías</option>
        {availableCategories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
      </select>
      {/* Proveedor */}
      <select
        className="border rounded px-2 py-2"
        value={filters.provider}
        onChange={e => handleChange("provider", e.target.value)}
      >
        <option value="">Todos los proveedores</option>
        {uniqueProviders.map(prov => <option key={prov} value={prov}>{prov}</option>)}
      </select>
      {/* Medio de Pago */}
      <select
        className="border rounded px-2 py-2"
        value={filters.payment_method}
        onChange={e => handleChange("payment_method", e.target.value)}
      >
        <option value="">Todos los medios</option>
        {paymentMethods.map(pm => <option key={pm} value={pm}>{pm}</option>)}
      </select>
      {/* Registrado por */}
      <select
        className="border rounded px-2 py-2"
        value={filters.created_by}
        onChange={e => handleChange("created_by", e.target.value)}
      >
        <option value="">Todos</option>
        {uniqueUsers.map(user => <option key={user} value={user}>{user}</option>)}
      </select>
    </div>
  );
}
