
import { useState } from "react";
import { useArreglosDialogs } from "./arreglos/useArreglosDialogs";
import { useArreglosFilters } from "./arreglos/useArreglosFilters";
import { useArreglosData } from "./arreglos/useArreglosData";
import { useArreglosImportExport } from "./arreglos/useArreglosImportExport";
import { toast } from "sonner";

/**
 * Custom hook for managing "arreglos" (repairs/services).
 * 
 * This hook centralizes the logic for data fetching, filtering, sorting,
 * dialog management (add/edit/filter), import/export operations, and state
 * related to the arreglos feature. It composes several other custom hooks
 * (`useArreglosDialogs`, `useArreglosFilters`, `useArreglosData`, `useArreglosImportExport`)
 * to achieve its functionality.
 * 
 * The main responsibilities include:
 * - Providing the list of arreglos, filtered and sorted according to user interactions.
 * - Managing the state of various dialogs (add, edit, filter, import).
 * - Handling data mutations (add, update, delete arreglos - though delete is handled in ArreglosPage directly via mutation from this hook).
 * - Processing data imports and exports.
 */
export function useArreglosManagement() {
  // Composing other hooks for specific functionalities
  const dialogs = useArreglosDialogs(); // Manages dialog states (open/close, current arreglo for edit)
  const filters = useArreglosFilters(); // Manages filter states (search term, specific filter criteria, active tab view)
  const data = useArreglosData(); // Manages CRUD operations and fetching of arreglo data
  const importExport = useArreglosImportExport(); // Manages Excel import/export logic
  
  // State for 'mismaManicura' (same manicurist). Its purpose and usage are currently unclear in the codebase.
  // TODO: Investigate or remove if this state is not being used.
  const [mismaManicura, setMismaManicura] = useState(false);

  // Apply filters to the raw arreglos data.
  // This derived state recalculates whenever `data.arreglos` or any filter criteria from `filters` hook changes.
  const filteredArreglos = data.arreglos.filter(arreglo => {
    // 1. Search term filter: Checks multiple fields for a match.
    const matchesSearch = 
      arreglo.client_name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      arreglo.description.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      arreglo.status.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (arreglo.assigned_to && arreglo.assigned_to.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (arreglo.notes && arreglo.notes.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      (arreglo.created_by && arreglo.created_by.toLowerCase().includes(filters.searchTerm.toLowerCase()));

    if (!matchesSearch) return false; // If search term doesn't match, exclude the item.
    
    // 2. Status filter: If status filters are applied, the arreglo must match one of them.
    if (filters.filtrosAplicados.estados.length > 0 && 
        !filters.filtrosAplicados.estados.includes(arreglo.status)) {
      return false;
    }
    
    // 3. Original manicurist filter: If specified, arreglo's creator must match.
    if (filters.filtrosAplicados.manicuristasOriginal.length > 0 && 
        !filters.filtrosAplicados.manicuristasOriginal.includes(arreglo.created_by)) {
      return false;
    }
    
    // 4. Assigned manicurist filter: If specified and an arreglo is assigned, the assigned person must match.
    if (filters.filtrosAplicados.manicuristasArreglo.length > 0 && 
        arreglo.assigned_to && // Check if assigned_to exists
        !filters.filtrosAplicados.manicuristasArreglo.includes(arreglo.assigned_to)) {
      return false;
    }
    
    // 5. Date range filter (from): If specified, arreglo date must be on or after this date.
    if (filters.filtrosAplicados.fechaDesde) {
      const fechaArreglo = new Date(arreglo.date);
      const fechaDesde = new Date(filters.filtrosAplicados.fechaDesde);
      // Normalize dates to avoid time component issues by setting hours to 0.
      fechaArreglo.setHours(0, 0, 0, 0);
      fechaDesde.setHours(0, 0, 0, 0);
      if (fechaArreglo < fechaDesde) return false;
    }
    
    // 6. Date range filter (to): If specified, arreglo date must be on or before this date.
    if (filters.filtrosAplicados.fechaHasta) {
      const fechaArreglo = new Date(arreglo.date);
      const fechaHasta = new Date(filters.filtrosAplicados.fechaHasta);
      // Normalize dates
      fechaArreglo.setHours(0, 0, 0, 0);
      fechaHasta.setHours(0, 0, 0, 0);
      if (fechaArreglo > fechaHasta) return false;
    }
    
    // 7. Minimum price filter: If specified, arreglo price must be greater or equal.
    if (filters.filtrosAplicados.precioMinimo && arreglo.price < parseInt(filters.filtrosAplicados.precioMinimo)) {
      return false;
    }
    
    // 8. Maximum price filter: If specified, arreglo price must be lesser or equal.
    if (filters.filtrosAplicados.precioMaximo && arreglo.price > parseInt(filters.filtrosAplicados.precioMaximo)) {
      return false;
    }

    // 9. Tab-based status filter: Filters based on the active tab in the UI (e.g., "pendientes", "proceso").
    // This ensures that the ArregloViewControls component receives data already filtered for its specific tab.
    if (filters.vistaActiva === "pendientes" && arreglo.status !== "pendiente") return false;
    if (filters.vistaActiva === "proceso" && arreglo.status !== "en_proceso") return false;
    if (filters.vistaActiva === "completados" && arreglo.status !== "completado") return false;
    if (filters.vistaActiva === "cancelados" && arreglo.status !== "cancelado") return false;
    
    // If all active filters pass, include the arreglo.
    return true;
  });

  // Sort the `filteredArreglos` based on the current `sortConfig` (key and direction).
  // This creates a new sorted array without mutating `filteredArreglos`.
  const sortedArreglos = [...filteredArreglos].sort((a, b) => {
    // Access the sort key dynamically. 
    // TODO: Add type safety for `filters.sortConfig.key` to ensure it's a valid key of an arreglo.
    if (a[filters.sortConfig.key] < b[filters.sortConfig.key]) {
      return filters.sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[filters.sortConfig.key] > b[filters.sortConfig.key]) {
      return filters.sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0; // Return 0 if values are equal, maintaining their relative order.
  });

  /**
   * Handles the import of arreglos from an array of data (typically from an Excel sheet).
   * Iterates over the imported items and uses the `addArregloMutation` to add each one.
   * @param importData - An array of arreglo objects to be imported. 
   *                     TODO: Define a specific type for items in importData.
   */
  const handleImportArreglos = async (importData: any[]) => {
    try {
      for (const item of importData) {
        // Call the mutation to add a new arreglo.
        await data.addArregloMutation.mutateAsync({
          ...item, // Spread the properties from the imported item
          // Default/override values for imported arreglos:
          date: new Date().toLocaleDateString(), // Set current date. Consider if date should come from import.
          // TODO: Replace "admin" with the actual current authenticated user's identifier.
          created_by: "admin" 
        });
      }
      toast.success('Arreglos importados correctamente'); // Success notification
    } catch (error) {
      console.error('Error importing arreglos:', error);
      toast.error('Error al importar arreglos'); // Error notification
    }
  };

  // Expose all states, setters, and functions from the composed hooks,
  // along with the derived `sortedArreglos` (which is named `filteredArreglos` in the return for consumer simplicity),
  // and other specific logic defined in this hook.
  return {
    ...dialogs, // Includes isAddDialogOpen, setIsAddDialogOpen, etc.
    ...filters, // Includes searchTerm, setSearchTerm, sortConfig, setSortConfig, etc.
    ...data,    // Includes arreglos, isLoading, addArregloMutation, etc.
    ...importExport, // Includes handleExportReport, templateData, validateArregloImport
    filteredArreglos: sortedArreglos, // Provide the final, sorted and filtered list to the UI.
    mismaManicura, // State for 'mismaManicura'
    setMismaManicura, // Setter for 'mismaManicura'
    handleImportArreglos // Function to handle the import process
  };
}
