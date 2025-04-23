
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { paymentMethods } from "@/types/expenses";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
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
  // Select month/year
  const selectMonth = (date: Date) => {
    setFilters({ ...filters, date });
  };

  const handleChange = (field: keyof ExpensesFiltersState, value: string) => {
    setFilters({ ...filters, [field]: value });
  };

  return (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Fecha (mes/año) */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start">
            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
            {filters.date ? format(filters.date, "MMMM yyyy") : "Mes/Año"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <Calendar
            mode="single"
            selected={filters.date}
            onSelect={date => date && selectMonth(new Date(date.getFullYear(), date.getMonth(), 1))}
            fromYear={2020}
            toYear={2100}
            initialFocus
            className="p-3 pointer-events-auto"
            // Show just months
            captionLayout="dropdown-buttons"
            showOutsideDays={false}
          />
        </PopoverContent>
      </Popover>
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
