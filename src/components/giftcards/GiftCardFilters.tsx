
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const currentYear = new Date().getFullYear();
  const availableYears = [
    (currentYear - 2).toString(),
    (currentYear - 1).toString(),
    currentYear.toString(),
    (currentYear + 1).toString()
  ];

  const currentMonth = selectedMonth ? monthNames[selectedMonth.getMonth()] : monthNames[new Date().getMonth()];
  const currentSelectedYear = selectedMonth ? selectedMonth.getFullYear().toString() : currentYear.toString();

  const handleMonthChange = (month: string) => {
    const monthIndex = monthNames.indexOf(month);
    const currentDate = selectedMonth || new Date();
    const newDate = new Date(currentDate.getFullYear(), monthIndex, 1);
    setSelectedMonth(newDate);
  };

  const handleYearChange = (year: string) => {
    const currentDate = selectedMonth || new Date();
    const newDate = new Date(parseInt(year), currentDate.getMonth(), 1);
    setSelectedMonth(newDate);
  };

  return (
    <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
      {/* Mes */}
      <Select value={currentMonth} onValueChange={handleMonthChange}>
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
      <Select value={currentSelectedYear} onValueChange={handleYearChange}>
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
    </div>
  );
}
