
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
    handleExportReport
  } = useArreglosManagement();

  const { isAuthorized } = useAuth();
  const canAdd = isAuthorized('admin') || isAuthorized('superadmin');

  const arreglosTotals = {
    pendientes: filteredArreglos.filter(arreglo => arreglo.status === 'pendiente').length,
    enProceso: filteredArreglos.filter(arreglo => arreglo.status === 'en_proceso').length,
    completados: filteredArreglos.filter(arreglo => arreglo.status === 'completado').length,
    cancelados: filteredArreglos.filter(arreglo => arreglo.status === 'cancelado').length,
    total: filteredArreglos.length
  };

  const handleSortChange = (key: any) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc"
    });
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
            onClick={handleExportReport}
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
          {canAdd && (
            <Button
              onClick={() => {
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

      <Tabs defaultValue="todos" value={vistaActiva} onValueChange={setVistaActiva}>
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
                Lista completa de todos los arreglos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ArreglosTable
                arreglos={filteredArreglos}
                onViewClick={(arreglo) => {
                  setCurrentArreglo(arreglo);
                  setIsEditDialogOpen(true);
                }}
                sortConfig={sortConfig}
                onSortChange={handleSortChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pendientes">
          <ArregloViewControls
            title="Arreglos Pendientes"
            description="Arreglos que aún no han sido iniciados"
            arreglos={filteredArreglos}
            onViewClick={(arreglo) => {
              setCurrentArreglo(arreglo);
              setIsEditDialogOpen(true);
            }}
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
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
          />
        </TabsContent>
      </Tabs>

      {isAddDialogOpen && (
        <ArregloDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          arreglo={null}
        />
      )}

      {isEditDialogOpen && currentArreglo && (
        <ArregloDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          arreglo={currentArreglo}
        />
      )}

      <FilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
      />

      <ExcelImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportArreglos}
        templateData={templateData}
        templateFilename="Arreglos_Plantilla.xlsx"
        validationFunction={validateArregloImport}
      />
    </div>
  );
}
