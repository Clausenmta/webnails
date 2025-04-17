
import { useState } from "react";
import { useArreglosDialogs } from "./arreglos/useArreglosDialogs";
import { useArreglosFilters } from "./arreglos/useArreglosFilters";
import { useArreglosData } from "./arreglos/useArreglosData";
import { useArreglosImportExport } from "./arreglos/useArreglosImportExport";

export function useArreglosManagement() {
  const dialogs = useArreglosDialogs();
  const filters = useArreglosFilters();
  const data = useArreglosData();
  const importExport = useArreglosImportExport();
  
  const [mismaManicura, setMismaManicura] = useState(false);

  // Apply filters to arreglos
  const filteredArreglos = data.arreglos.filter(arreglo => {
    const matchesSearch = 
      arreglo.client_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      arreglo.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      arreglo.status.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (arreglo.assigned_to && arreglo.assigned_to.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (arreglo.notes && arreglo.notes.toLowerCase().includes(filters.searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    
    if (filters.filtrosAplicados.estados.length > 0 && 
        !filters.filtrosAplicados.estados.includes(arreglo.status)) {
      return false;
    }
    
    if (filters.filtrosAplicados.manicuristasOriginal.length > 0 && 
        !filters.filtrosAplicados.manicuristasOriginal.includes(arreglo.created_by)) {
      return false;
    }
    
    if (filters.filtrosAplicados.manicuristasArreglo.length > 0 && 
        arreglo.assigned_to &&
        !filters.filtrosAplicados.manicuristasArreglo.includes(arreglo.assigned_to)) {
      return false;
    }
    
    if (filters.filtrosAplicados.fechaDesde) {
      const fechaArreglo = new Date(arreglo.date);
      const fechaDesde = new Date(filters.filtrosAplicados.fechaDesde);
      if (fechaArreglo < fechaDesde) return false;
    }
    
    if (filters.filtrosAplicados.fechaHasta) {
      const fechaArreglo = new Date(arreglo.date);
      const fechaHasta = new Date(filters.filtrosAplicados.fechaHasta);
      if (fechaArreglo > fechaHasta) return false;
    }
    
    if (filters.filtrosAplicados.precioMinimo && arreglo.price < parseInt(filters.filtrosAplicados.precioMinimo)) {
      return false;
    }
    
    if (filters.filtrosAplicados.precioMaximo && arreglo.price > parseInt(filters.filtrosAplicados.precioMaximo)) {
      return false;
    }

    if (filters.vistaActiva === "pendientes" && arreglo.status !== "pendiente") return false;
    if (filters.vistaActiva === "proceso" && arreglo.status !== "en_proceso") return false;
    if (filters.vistaActiva === "completados" && arreglo.status !== "completado") return false;
    if (filters.vistaActiva === "cancelados" && arreglo.status !== "cancelado") return false;
    
    return true;
  });

  // Sort arreglos based on sortConfig
  const sortedArreglos = [...filteredArreglos].sort((a, b) => {
    if (a[filters.sortConfig.key] < b[filters.sortConfig.key]) {
      return filters.sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[filters.sortConfig.key] > b[filters.sortConfig.key]) {
      return filters.sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Handle import function
  const handleImportArreglos = async (data: any[]) => {
    try {
      for (const item of data) {
        await data.addArregloMutation.mutateAsync({
          ...item,
          date: new Date().toLocaleDateString(),
          created_by: "admin" // This should be the current user
        });
      }
    } catch (error) {
      console.error('Error importing arreglos:', error);
      toast.error('Error al importar arreglos');
    }
  };

  return {
    ...dialogs,
    ...filters,
    ...data,
    ...importExport,
    filteredArreglos: sortedArreglos,
    mismaManicura,
    setMismaManicura,
    handleImportArreglos
  };
}
