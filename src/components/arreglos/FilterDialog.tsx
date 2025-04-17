
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useArreglosManagement } from "@/hooks/useArreglosManagement";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FilterDialog({ open, onOpenChange }: FilterDialogProps) {
  const {
    filtros,
    setFiltros,
    handleApplyFilters,
    handleResetFilters,
    arreglos,
    fechaDesdeDate,
    setFechaDesdeDate,
    fechaHastaDate,
    setFechaHastaDate
  } = useArreglosManagement();

  // Get unique values for filter lists
  const getUniqueEstados = () => {
    const estados = arreglos.map(arreglo => arreglo.status);
    return [...new Set(estados)];
  };

  const getUniqueManicuristasOriginal = () => {
    const manicuristas = arreglos.map(arreglo => arreglo.created_by);
    return [...new Set(manicuristas)];
  };

  const getUniqueManicuristasArreglo = () => {
    const manicuristas = arreglos
      .filter(arreglo => arreglo.assigned_to)
      .map(arreglo => arreglo.assigned_to as string);
    return [...new Set(manicuristas)];
  };

  const estados = getUniqueEstados();
  const manicuristasOriginal = getUniqueManicuristasOriginal();
  const manicuristasArreglo = getUniqueManicuristasArreglo();

  // Handle checkbox changes
  const handleEstadoChange = (estado: string, checked: boolean) => {
    if (checked) {
      setFiltros(prev => ({
        ...prev,
        estados: [...prev.estados, estado]
      }));
    } else {
      setFiltros(prev => ({
        ...prev,
        estados: prev.estados.filter(e => e !== estado)
      }));
    }
  };

  const handleManicuristaOriginalChange = (manicurista: string, checked: boolean) => {
    if (checked) {
      setFiltros(prev => ({
        ...prev,
        manicuristasOriginal: [...prev.manicuristasOriginal, manicurista]
      }));
    } else {
      setFiltros(prev => ({
        ...prev,
        manicuristasOriginal: prev.manicuristasOriginal.filter(m => m !== manicurista)
      }));
    }
  };

  const handleManicuristaArregloChange = (manicurista: string, checked: boolean) => {
    if (checked) {
      setFiltros(prev => ({
        ...prev,
        manicuristasArreglo: [...prev.manicuristasArreglo, manicurista]
      }));
    } else {
      setFiltros(prev => ({
        ...prev,
        manicuristasArreglo: prev.manicuristasArreglo.filter(m => m !== manicurista)
      }));
    }
  };

  // Handle date changes
  useEffect(() => {
    if (fechaDesdeDate) {
      setFiltros(prev => ({
        ...prev,
        fechaDesde: format(fechaDesdeDate, 'yyyy-MM-dd')
      }));
    }
  }, [fechaDesdeDate, setFiltros]);

  useEffect(() => {
    if (fechaHastaDate) {
      setFiltros(prev => ({
        ...prev,
        fechaHasta: format(fechaHastaDate, 'yyyy-MM-dd')
      }));
    }
  }, [fechaHastaDate, setFiltros]);

  // Handle price input changes
  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Filtrar Arreglos</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estados */}
          <div>
            <h3 className="text-lg font-medium mb-2">Estado</h3>
            <div className="grid grid-cols-2 gap-2">
              {estados.map(estado => (
                <div key={estado} className="flex items-center space-x-2">
                  <Checkbox
                    id={`estado-${estado}`}
                    checked={filtros.estados.includes(estado)}
                    onCheckedChange={(checked) => handleEstadoChange(estado, checked as boolean)}
                  />
                  <Label htmlFor={`estado-${estado}`}>{estado}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Manicuristas Original */}
          <div>
            <h3 className="text-lg font-medium mb-2">Manicurista Original</h3>
            <div className="grid grid-cols-2 gap-2">
              {manicuristasOriginal.map(manicurista => (
                <div key={manicurista} className="flex items-center space-x-2">
                  <Checkbox
                    id={`manicurista-original-${manicurista}`}
                    checked={filtros.manicuristasOriginal.includes(manicurista)}
                    onCheckedChange={(checked) => handleManicuristaOriginalChange(manicurista, checked as boolean)}
                  />
                  <Label htmlFor={`manicurista-original-${manicurista}`}>{manicurista}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Manicuristas Arreglo */}
          {manicuristasArreglo.length > 0 && (
            <>
              <div>
                <h3 className="text-lg font-medium mb-2">Manicurista de Arreglo</h3>
                <div className="grid grid-cols-2 gap-2">
                  {manicuristasArreglo.map(manicurista => (
                    <div key={manicurista} className="flex items-center space-x-2">
                      <Checkbox
                        id={`manicurista-arreglo-${manicurista}`}
                        checked={filtros.manicuristasArreglo.includes(manicurista)}
                        onCheckedChange={(checked) => handleManicuristaArregloChange(manicurista, checked as boolean)}
                      />
                      <Label htmlFor={`manicurista-arreglo-${manicurista}`}>{manicurista}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Fechas */}
          <div>
            <h3 className="text-lg font-medium mb-2">Rango de Fechas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fechaDesde">Desde</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaDesdeDate ? format(fechaDesdeDate, 'dd/MM/yyyy') : 'Seleccionar'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fechaDesdeDate}
                      onSelect={setFechaDesdeDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="fechaHasta">Hasta</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaHastaDate ? format(fechaHastaDate, 'dd/MM/yyyy') : 'Seleccionar'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fechaHastaDate}
                      onSelect={setFechaHastaDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <Separator />

          {/* Precio */}
          <div>
            <h3 className="text-lg font-medium mb-2">Precio</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="precioMinimo">Precio Mínimo</Label>
                <Input
                  id="precioMinimo"
                  name="precioMinimo"
                  type="number"
                  value={filtros.precioMinimo}
                  onChange={handlePrecioChange}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="precioMaximo">Precio Máximo</Label>
                <Input
                  id="precioMaximo"
                  name="precioMaximo"
                  type="number"
                  value={filtros.precioMaximo}
                  onChange={handlePrecioChange}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={handleResetFilters}>
            Restablecer
          </Button>
          <Button onClick={handleApplyFilters}>
            Aplicar Filtros
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
