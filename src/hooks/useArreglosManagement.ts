
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { arreglosService, Arreglo, NewArreglo } from "@/services/arreglosService";
import { toast } from "sonner";
import { format } from "date-fns";

export function useArreglosManagement() {
  const queryClient = useQueryClient();
  
  // Estados para diálogos y gestión
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [currentArreglo, setCurrentArreglo] = useState<Arreglo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [vistaActiva, setVistaActiva] = useState("todos");
  
  // Estados para filtros
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
  
  // Calendario
  const [fechaComandaDate, setFechaComandaDate] = useState<Date | undefined>(undefined);
  const [fechaArregloDate, setFechaArregloDate] = useState<Date | undefined>(undefined);
  const [fechaDesdeDate, setFechaDesdeDate] = useState<Date | undefined>(undefined);
  const [fechaHastaDate, setFechaHastaDate] = useState<Date | undefined>(undefined);
  
  // Otros estados
  const [mismaManicura, setMismaManicura] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "fecha" as keyof Arreglo,
    direction: "desc" as "asc" | "desc"
  });
  
  // Query para obtener arreglos
  const { data: arreglos = [], isLoading } = useQuery({
    queryKey: ['arreglos'],
    queryFn: arreglosService.fetchArreglos,
    meta: {
      onError: (error: any) => {
        console.error("Error al obtener arreglos:", error);
        toast.error(`Error al cargar arreglos: ${error.message}`);
      }
    }
  });

  // Mutaciones
  const addArregloMutation = useMutation({
    mutationFn: arreglosService.addArreglo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arreglos'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Arreglo registrado correctamente");
    },
    onError: (error: any) => {
      console.error("Error al registrar el arreglo:", error);
      toast.error(`Error al registrar el arreglo: ${error.message}`);
    }
  });

  const updateArregloMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number, updates: Partial<NewArreglo> }) => 
      arreglosService.updateArreglo(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arreglos'] });
      setIsEditDialogOpen(false);
      resetForm();
      toast.success("Arreglo actualizado correctamente");
    },
    onError: (error: any) => {
      console.error("Error al actualizar el arreglo:", error);
      toast.error(`Error al actualizar el arreglo: ${error.message}`);
    }
  });

  const deleteArregloMutation = useMutation({
    mutationFn: (id: number) => arreglosService.deleteArreglo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arreglos'] });
      toast.success("Arreglo eliminado correctamente");
    },
    onError: (error: any) => {
      console.error("Error al eliminar el arreglo:", error);
      toast.error(`Error al eliminar el arreglo: ${error.message}`);
    }
  });

  // Filtrar arreglos según criterios
  const filteredArreglos = arreglos.filter(arreglo => {
    // Basic search filter
    const matchesSearch = 
      arreglo.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arreglo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      arreglo.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (arreglo.assigned_to && arreglo.assigned_to.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (arreglo.notes && arreglo.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    
    // Applied filters
    if (filtrosAplicados.estados.length > 0 && 
        !filtrosAplicados.estados.includes(arreglo.status)) {
      return false;
    }
    
    if (filtrosAplicados.manicuristasOriginal.length > 0 && 
        !filtrosAplicados.manicuristasOriginal.includes(arreglo.created_by)) {
      return false;
    }
    
    if (filtrosAplicados.manicuristasArreglo.length > 0 && 
        arreglo.assigned_to &&
        !filtrosAplicados.manicuristasArreglo.includes(arreglo.assigned_to)) {
      return false;
    }
    
    if (filtrosAplicados.fechaDesde) {
      const fechaArreglo = new Date(arreglo.date);
      const fechaDesde = new Date(filtrosAplicados.fechaDesde);
      if (fechaArreglo < fechaDesde) return false;
    }
    
    if (filtrosAplicados.fechaHasta) {
      const fechaArreglo = new Date(arreglo.date);
      const fechaHasta = new Date(filtrosAplicados.fechaHasta);
      if (fechaArreglo > fechaHasta) return false;
    }
    
    if (filtrosAplicados.precioMinimo && arreglo.price < parseInt(filtrosAplicados.precioMinimo)) {
      return false;
    }
    
    if (filtrosAplicados.precioMaximo && arreglo.price > parseInt(filtrosAplicados.precioMaximo)) {
      return false;
    }

    // Vista activa filter
    if (vistaActiva === "pendientes" && arreglo.status !== "pendiente") return false;
    if (vistaActiva === "proceso" && arreglo.status !== "en_proceso") return false;
    if (vistaActiva === "completados" && arreglo.status !== "completado") return false;
    if (vistaActiva === "cancelados" && arreglo.status !== "cancelado") return false;
    
    return true;
  });

  // Sort arreglos based on sortConfig
  const sortedArreglos = [...filteredArreglos].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Reset form fields
  const resetForm = () => {
    setCurrentArreglo(null);
    setFechaComandaDate(undefined);
    setFechaArregloDate(undefined);
    setMismaManicura(false);
  };

  // Handle applying filters
  const handleApplyFilters = () => {
    setFiltrosAplicados({...filtros});
    setIsFilterDialogOpen(false);
    toast.success("Filtros aplicados");
  };

  // Handle resetting filters
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
    setIsFilterDialogOpen(false);
    toast.success("Filtros restablecidos");
  };

  // Export functions
  const handleExportReport = () => {
    toast.success("Reporte de arreglos exportado correctamente");
    
    // Simulación de descarga de archivo
    const dummyContent = "Reporte de Arreglos\n\n" + 
      sortedArreglos.map(arreglo => 
        `${arreglo.date} - ${arreglo.client_name} - ${arreglo.description} - $${arreglo.price.toLocaleString()}`
      ).join('\n');
    
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Arreglos_${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return {
    // Estado y datos
    arreglos,
    filteredArreglos: sortedArreglos,
    isLoading,
    
    // Estado de diálogos
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    currentArreglo,
    setCurrentArreglo,
    
    // Filtros
    searchTerm,
    setSearchTerm,
    filtros,
    setFiltros,
    filtrosAplicados,
    cantidadFiltrosAplicados,
    
    // Vista
    vistaActiva, 
    setVistaActiva,
    
    // Mutaciones
    addArregloMutation,
    updateArregloMutation,
    deleteArregloMutation,
    
    // Fecha y Calendar
    fechaComandaDate,
    setFechaComandaDate,
    fechaArregloDate,
    setFechaArregloDate,
    fechaDesdeDate,
    setFechaDesdeDate,
    fechaHastaDate,
    setFechaHastaDate,
    
    // Otros
    mismaManicura,
    setMismaManicura,
    sortConfig,
    setSortConfig,
    
    // Funciones
    handleApplyFilters,
    handleResetFilters,
    handleExportReport,
    resetForm
  };
}
