
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Filter, FileSpreadsheet, ArrowDownUp, Import } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useArreglosManagement } from "@/hooks/useArreglosManagement";
import ArreglosTable from "@/components/arreglos/ArreglosTable";
import ArregloDialog from "@/components/arreglos/ArregloDialog";
import FilterDialog from "@/components/arreglos/FilterDialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ArregloViewControls from "@/components/arreglos/ArregloViewControls";
import { useAuth } from "@/contexts/AuthContext";
import ExcelImportDialog from "@/components/common/ExcelImportDialog";
import { UserRole } from "@/types/auth";

/**
 * ArreglosPage component
 * 
 * This component serves as the main interface for managing "arreglos" (repairs or services).
 * It displays a list of arreglos, allows users to search, filter, sort, add, edit, delete,
 * import, and export arreglos. It uses tabs to categorize arreglos by status.
 * 
 * State management and business logic are primarily handled by the `useArreglosManagement` hook.
 */
export default function ArreglosPage() {
  const {
    filteredArreglos,
    searchTerm,
    setSearchTerm,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    templateData,
    handleImportArreglos,
    validateArregloImport,
    vistaActiva,
    setVistaActiva,
    currentArreglo,
    setCurrentArreglo,
    cantidadFiltrosAplicados,
    sortConfig,
    setSortConfig,
    handleExportReport,
    deleteArregloMutation, // <- ya lo tienes del hook
  } = useArreglosManagement();

  const { isAuthorized } = useAuth();
  // Authorization check: Determine if the current user has permission to add new arreglos.
  // Users with 'superadmin' or 'employee' roles are allowed.
  const canAdd = isAuthorized('superadmin') || isAuthorized('employee');

  // Calculate total counts for each arreglo status category.
  // This is used for display in the tab badges.
  const arreglosTotals = {
    pendientes: filteredArreglos.filter(arreglo => arreglo.status === 'pendiente').length,
    enProceso: filteredArreglos.filter(arreglo => arreglo.status === 'en_proceso').length,
    completados: filteredArreglos.filter(arreglo => arreglo.status === 'completado').length,
    cancelados: filteredArreglos.filter(arreglo => arreglo.status === 'cancelado').length,
    total: filteredArreglos.length
  };

  /**
   * Handles changes in sorting configuration.
   * Toggles between ascending and descending order if the same key is clicked again.
   * @param key - The key of the column to sort by (e.g., 'client_name', 'status').
   */
  const handleSortChange = (key: any) => { // TODO: Define a more specific type for key if possible
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc"
    });
  };

  /**
   * Handles the click event for exporting arreglos.
   * It calls the `handleExportReport` function from the hook with the currently filtered arreglos.
   */
  const handleExportClick = () => {
    handleExportReport(filteredArreglos);
  };

  /**
   * Handles the click event for deleting an arreglo.
   * It shows a confirmation dialog and then calls the delete mutation if confirmed.
   * @param arreglo - The arreglo object to be deleted.
   */
  const handleDeleteClick = (arreglo: any) => { // TODO: Define a more specific type for arreglo
    // A simple confirmation dialog. For better UX, a custom modal component could be used.
    if (window.confirm("¿Seguro que quieres eliminar este arreglo?")) {
      deleteArregloMutation.mutate(arreglo.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Arreglos</h2>
          <p className="text-muted-foreground">
            Gestión de arreglos y reparaciones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar arreglo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-[300px]"
          />
          <Button
            variant="outline"
            onClick={() => setIsFilterDialogOpen(true)}
            className="gap-1"
          >
            <Filter className="h-4 w-4" />
            {cantidadFiltrosAplicados > 0 && (
              <Badge variant="secondary" className="ml-1">
                {cantidadFiltrosAplicados}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportClick}
            className="gap-1"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsImportDialogOpen(true)}
            className="gap-1"
          >
            <Import className="h-4 w-4" />
            <span className="hidden sm:inline">Importar</span>
          </Button>
          {/* Conditionally render the "Nuevo Arreglo" button based on user authorization */}
          {canAdd && (
            <Button
              onClick={() => {
                // Reset currentArreglo to null for a new entry
                setCurrentArreglo(null);
                setIsAddDialogOpen(true);
              }}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo Arreglo</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs for filtering arreglos by status. 'vistaActiva' controls the currently selected tab. */}
      <Tabs defaultValue="todos" value={vistaActiva} onValueChange={setVistaActiva}>
        {/* TabsList provides the clickable tab headers. */}
        <TabsList className="grid grid-cols-5 w-full md:w-auto">
          <TabsTrigger value="todos">
            Todos
            <Badge variant="secondary" className="ml-1">
              {arreglosTotals.total}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pendientes">
            Pendientes
            <Badge variant="secondary" className="ml-1">
              {arreglosTotals.pendientes}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="proceso">
            En Proceso
            <Badge variant="secondary" className="ml-1">
              {arreglosTotals.enProceso}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completados">
            Completados
            <Badge variant="secondary" className="ml-1">
              {arreglosTotals.completados}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="cancelados">
            Cancelados
            <Badge variant="secondary" className="ml-1">
              {arreglosTotals.cancelados}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <Card>
            <CardHeader>
              <CardTitle>Todos los Arreglos</CardTitle>
              <CardDescription>
                Lista completa de todos los arreglos. This view uses ArreglosTable directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* ArreglosTable displays the main data grid for all arreglos. */}
              <ArreglosTable
                arreglos={filteredArreglos} // Data is pre-filtered and sorted by the hook
                onViewClick={(arreglo) => {
                  setCurrentArreglo(arreglo); // Set the arreglo to be edited
                  setIsEditDialogOpen(true);    // Open the edit dialog
                }}
                onDeleteClick={handleDeleteClick} // Pass the delete handler
                sortConfig={sortConfig}
                onSortChange={handleSortChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
        {/* 
          The following TabsContent sections (pendientes, proceso, completados, cancelados) 
          use the ArregloViewControls component. This component is a wrapper around ArreglosTable 
          and is used here to display specific views of the data based on status.
          The actual filtering by status for these tabs is handled within the useArreglosManagement hook.
        */}
        <TabsContent value="pendientes">
          <ArregloViewControls
            title="Arreglos Pendientes"
            description="Arreglos que aún no han sido iniciados"
            arreglos={filteredArreglos} // Data is already filtered by the hook based on 'vistaActiva'
            onViewClick={(arreglo) => {
              setCurrentArreglo(arreglo);
              setIsEditDialogOpen(true);
            }}
            onDeleteClick={handleDeleteClick}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
          />
        </TabsContent>
        <TabsContent value="proceso">
          <ArregloViewControls
            title="Arreglos en Proceso"
            description="Arreglos que se están trabajando actualmente"
            arreglos={filteredArreglos}
            onViewClick={(arreglo) => {
              setCurrentArreglo(arreglo);
              setIsEditDialogOpen(true);
            }}
            onDeleteClick={handleDeleteClick}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
          />
        </TabsContent>
        <TabsContent value="completados">
          <ArregloViewControls
            title="Arreglos Completados"
            description="Arreglos que ya han sido finalizados"
            arreglos={filteredArreglos}
            onViewClick={(arreglo) => {
              setCurrentArreglo(arreglo);
              setIsEditDialogOpen(true);
            }}
            onDeleteClick={handleDeleteClick}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
          />
        </TabsContent>
        <TabsContent value="cancelados">
          <ArregloViewControls
            title="Arreglos Cancelados"
            description="Arreglos que han sido cancelados"
            arreglos={filteredArreglos}
            onViewClick={(arreglo) => {
              setCurrentArreglo(arreglo);
              setIsEditDialogOpen(true);
            }}
            onDeleteClick={handleDeleteClick}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog for adding a new arreglo. Rendered conditionally based on isAddDialogOpen state. */}
      {isAddDialogOpen && (
        <ArregloDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen} // Function to close the dialog
          arreglo={null} // Pass null for a new arreglo
        />
      )}

      {/* Dialog for editing an existing arreglo. Rendered conditionally. */}
      {isEditDialogOpen && currentArreglo && (
        <ArregloDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen} // Function to close the dialog
          arreglo={currentArreglo} // Pass the currently selected arreglo for editing
        />
      )}

      {/* Dialog for filtering arreglos. Rendered conditionally. */}
      <FilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
      />

      {/* Dialog for importing arreglos from an Excel file. Rendered conditionally. */}
      <ExcelImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)} // Function to close the dialog
        onImport={handleImportArreglos} // Function from the hook to process imported data
        templateData={templateData} // Template data for the Excel file (headers)
        templateFilename="Arreglos_Plantilla.xlsx" // Suggested filename for the template
        validationFunction={validateArregloImport} // Function from the hook to validate imported rows
      />
    </div>
  );
}
