
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface StockFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  locationFilter: string;
  setLocationFilter: (v: string) => void;
  stockCategories: string[];
  stockLocations: string[];
}

const StockFilters: React.FC<StockFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  locationFilter,
  setLocationFilter,
  stockCategories,
  stockLocations,
}) => (
  <div className="flex flex-col gap-2 md:flex-row md:items-end md:gap-4 my-2">
    <div className="relative w-full md:w-1/3">
      <Input
        type="text"
        placeholder="Buscar producto, marca o proveedor..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="pl-10"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
    </div>
    <div className="w-full md:w-1/4">
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-full">
          <Filter className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Filtrar por categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-categories">Todas las categorías</SelectItem>
          {stockCategories.map(category => (
            <SelectItem key={category} value={category}>{category}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="w-full md:w-1/4">
      <Select value={locationFilter} onValueChange={setLocationFilter}>
        <SelectTrigger className="w-full">
          <Filter className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Filtrar por ubicación" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-locations">Todas las ubicaciones</SelectItem>
          {stockLocations.map(location => (
            <SelectItem key={location} value={location}>{location}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default StockFilters;
