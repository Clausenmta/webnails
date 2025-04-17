
import { useState } from "react";
import { Arreglo } from "@/services/arreglosService";

export function useArreglosFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [vistaActiva, setVistaActiva] = useState("todos");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Arreglo;
    direction: "asc" | "desc";
  }>({
    key: "date",
    direction: "desc"
  });

  const [filtros, setFiltros] = useState({
    estados: [] as string[],
    manicuristasOriginal: [] as string[],
    manicuristasArreglo: [] as string[],
    fechaDesde: null as string | null,
    fechaHasta: null as string | null,
    descuenta: "",
    precioMinimo: "",
    precioMaximo: ""
  });

  const [filtrosAplicados, setFiltrosAplicados] = useState({...filtros});
  const [cantidadFiltrosAplicados, setCantidadFiltrosAplicados] = useState(0);

  // Calendar dates
  const [fechaComandaDate, setFechaComandaDate] = useState<Date | undefined>(undefined);
  const [fechaArregloDate, setFechaArregloDate] = useState<Date | undefined>(undefined);
  const [fechaDesdeDate, setFechaDesdeDate] = useState<Date | undefined>(undefined);
  const [fechaHastaDate, setFechaHastaDate] = useState<Date | undefined>(undefined);

  const handleApplyFilters = () => {
    setFiltrosAplicados({...filtros});
    setIsFilterDialogOpen(false);
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      estados: [],
      manicuristasOriginal: [],
      manicuristasArreglo: [],
      fechaDesde: null,
      fechaHasta: null,
      descuenta: "",
      precioMinimo: "",
      precioMaximo: ""
    };
    
    setFiltros(emptyFilters);
    setFechaDesdeDate(undefined);
    setFechaHastaDate(undefined);
    setFiltrosAplicados(emptyFilters);
    setCantidadFiltrosAplicados(0);
  };

  return {
    searchTerm,
    setSearchTerm,
    vistaActiva,
    setVistaActiva,
    sortConfig,
    setSortConfig,
    filtros,
    setFiltros,
    filtrosAplicados,
    cantidadFiltrosAplicados,
    fechaComandaDate,
    setFechaComandaDate,
    fechaArregloDate,
    setFechaArregloDate,
    fechaDesdeDate,
    setFechaDesdeDate,
    fechaHastaDate,
    setFechaHastaDate,
    handleApplyFilters,
    handleResetFilters
  };
}
