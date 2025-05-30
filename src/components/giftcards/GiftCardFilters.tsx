
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface GiftCardFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: "active" | "redeemed" | "expired" | "all";
  setStatusFilter: (status: "active" | "redeemed" | "expired" | "all") => void;
  selectedMonth: Date | undefined;
  setSelectedMonth: (date: Date | undefined) => void;
}

export function GiftCardFilters({ 
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  selectedMonth,
  setSelectedMonth
}: GiftCardFiltersProps) {
  const selectMonth = (date: Date | undefined) => {
    setSelectedMonth(date);
  };

  const clearMonthFilter = () => {
    setSelectedMonth(undefined);
  };

  return (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
      {/* Búsqueda */}
      <Input
        placeholder="Buscar gift cards..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className=""
      />
      
      {/* Estado */}
      <select
        className="border rounded px-2 py-2"
        value={statusFilter}
        onChange={e => setStatusFilter(e.target.value as "active" | "redeemed" | "expired" | "all")}
      >
        <option value="all">Todos los estados</option>
        <option value="active">Activa</option>
        <option value="redeemed">Canjeada</option>
        <option value="expired">Vencida</option>
      </select>
      
      {/* Filtro por Mes */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start">
            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
            {selectedMonth ? format(selectedMonth, "MMMM yyyy") : "Filtrar por mes"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <Calendar
            mode="single"
            selected={selectedMonth}
            onSelect={date => date && selectMonth(new Date(date.getFullYear(), date.getMonth(), 1))}
            fromYear={2020}
            toYear={2100}
            initialFocus
            className="p-3 pointer-events-auto"
            captionLayout="dropdown-buttons"
            showOutsideDays={false}
          />
        </PopoverContent>
      </Popover>
      
      {/* Limpiar filtro de mes */}
      {selectedMonth && (
        <Button variant="outline" onClick={clearMonthFilter}>
          Limpiar mes
        </Button>
      )}
    </div>
  );
}
