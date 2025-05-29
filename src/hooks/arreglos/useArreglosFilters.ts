
import { useState } from "react";
import { Arreglo } from "@/services/arreglosService";

export function useArreglosFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [vistaActiva, setVistaActiva] = useState("todos");
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
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
    precioMaximo: "",
    mesSeleccionado: null as string | null // Nuevo filtro para mes/año
  });

  const [filtrosAplicados, setFiltrosAplicados] = useState({...filtros});
  const [cantidadFiltrosAplicados, setCantidadFiltrosAplicados] = useState(0);

  // Calendar dates
  const [fechaComandaDate, setFechaComandaDate] = useState<Date | undefined>(undefined);
  const [fechaArregloDate, setFechaArregloDate] = useState<Date | undefined>(undefined);
  const [fechaDesdeDate, setFechaDesdeDate] = useState<Date | undefined>(undefined);
  const [fechaHastaDate, setFechaHastaDate] = useState<Date | undefined>(undefined);
  const [mesSeleccionadoDate, setMesSeleccionadoDate] = useState<Date | undefined>(undefined);

  const handleApplyFilters = () => {
    setFiltrosAplicados({...filtros});
    setIsFilterDialogOpen(false);
    
    // Count applied filters
    let count = 0;
    if (filtros.estados.length > 0) count++;
    if (filtros.manicuristasOriginal.length > 0) count++;
    if (filtros.manicuristasArreglo.length > 0) count++;
    if (filtros.fechaDesde) count++;
    if (filtros.fechaHasta) count++;
    if (filtros.precioMinimo) count++;
    if (filtros.precioMaximo) count++;
    if (filtros.mesSeleccionado) count++;
    setCantidadFiltrosAplicados(count);
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
      precioMaximo: "",
      mesSeleccionado: null
    };
    
    setFiltros(emptyFilters);
    setFechaDesdeDate(undefined);
    setFechaHastaDate(undefined);
    setMesSeleccionadoDate(undefined);
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
    mesSeleccionadoDate,
    setMesSeleccionadoDate,
    handleApplyFilters,
    handleResetFilters,
    isFilterDialogOpen,
    setIsFilterDialogOpen
  };
}
