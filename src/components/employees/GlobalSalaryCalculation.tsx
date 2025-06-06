
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Save } from "lucide-react";
import { Employee } from "@/types/employees";
import { useSalaryCalculations, SalaryCalculationRow } from "@/hooks/useSalaryCalculations";

interface GlobalSalaryCalculationProps {
  employees: Employee[];
}

export const GlobalSalaryCalculation = ({ employees }: GlobalSalaryCalculationProps) => {
  const {
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    salaryRows,
    isLoading,
    saveSalary,
    updateSalaryField,
    saveSalaryMutation
  } = useSalaryCalculations(employees);

  const [editedRows, setEditedRows] = useState<{ [key: number]: Partial<SalaryCalculationRow> }>({});

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleFieldChange = (empleado_id: number, field: keyof SalaryCalculationRow, value: string) => {
    const numericValue = value === '' ? 0 : parseFloat(value) || 0;
    
    setEditedRows(prev => ({
      ...prev,
      [empleado_id]: {
        ...prev[empleado_id],
        [field]: numericValue
      }
    }));
  };

  const getEffectiveValue = (row: SalaryCalculationRow, field: keyof SalaryCalculationRow): number => {
    const editedValue = editedRows[row.empleado_id]?.[field];
    return editedValue !== undefined ? editedValue as number : row[field] as number;
  };

  const calculateRowValues = (row: SalaryCalculationRow) => {
    const facturacion = getEffectiveValue(row, 'facturacion');
    const adelanto = getEffectiveValue(row, 'adelanto');
    const vacaciones = getEffectiveValue(row, 'vacaciones');
    const recepcion = getEffectiveValue(row, 'recepcion');
    const otros = getEffectiveValue(row, 'otros');
    const recibo = getEffectiveValue(row, 'recibo');

    const comision = facturacion * (row.empleado_position.toLowerCase().includes('manicur') ? 0.32 : 0.30);
    const total_efectivo = comision - adelanto + vacaciones + recepcion + otros - recibo;
    const total_completo = comision + vacaciones + recepcion + otros + recibo;
    const asegurado = total_completo < 500000 ? 500000 - total_completo : 0;

    return { comision, total_efectivo, total_completo, asegurado };
  };

  const handleSaveSalary = (row: SalaryCalculationRow) => {
    const editedData = editedRows[row.empleado_id] || {};
    const calculated = calculateRowValues(row);
    
    const updatedRow = {
      ...row,
      ...editedData,
      comision: calculated.comision,
      total_efectivo: calculated.total_efectivo,
      total_completo: calculated.total_completo,
      asegurado: calculated.asegurado
    };

    saveSalary(updatedRow);
    
    // Limpiar ediciones después de guardar
    setEditedRows(prev => {
      const updated = { ...prev };
      delete updated[row.empleado_id];
      return updated;
    });
  };

  const calculateColumnTotals = () => {
    return salaryRows.reduce((totals, row) => {
      const calculated = calculateRowValues(row);
      return {
        facturacion: totals.facturacion + getEffectiveValue(row, 'facturacion'),
        comision: totals.comision + calculated.comision,
        adelanto: totals.adelanto + getEffectiveValue(row, 'adelanto'),
        vacaciones: totals.vacaciones + getEffectiveValue(row, 'vacaciones'),
        recepcion: totals.recepcion + getEffectiveValue(row, 'recepcion'),
        otros: totals.otros + getEffectiveValue(row, 'otros'),
        recibo: totals.recibo + getEffectiveValue(row, 'recibo'),
        total_efectivo: totals.total_efectivo + calculated.total_efectivo,
        total_completo: totals.total_completo + calculated.total_completo,
        asegurado: totals.asegurado + calculated.asegurado
      };
    }, {
      facturacion: 0, comision: 0, adelanto: 0, vacaciones: 0,
      recepcion: 0, otros: 0, recibo: 0, total_efectivo: 0,
      total_completo: 0, asegurado: 0
    });
  };

  const totals = calculateColumnTotals();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p>Cargando cálculo de sueldos...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cálculo Global de Sueldos</CardTitle>
        <CardDescription>
          Vista consolidada para calcular sueldos de todos los empleados
        </CardDescription>
        
        <div className="flex gap-4 mt-4">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar mes" />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((month, index) => (
                <SelectItem key={index} value={(index + 1).toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px] sticky left-0 bg-background">Empleado</TableHead>
                <TableHead className="min-w-[120px]">Facturación</TableHead>
                <TableHead className="min-w-[120px] bg-violet-50">Comisión</TableHead>
                <TableHead className="min-w-[100px]">Adelanto</TableHead>
                <TableHead className="min-w-[100px]">Vacaciones</TableHead>
                <TableHead className="min-w-[100px]">Recepción</TableHead>
                <TableHead className="min-w-[100px]">Otros</TableHead>
                <TableHead className="min-w-[100px]">Recibo</TableHead>
                <TableHead className="min-w-[120px] bg-violet-50">Total Efectivo</TableHead>
                <TableHead className="min-w-[120px] bg-violet-50">Total Completo</TableHead>
                <TableHead className="min-w-[120px] bg-violet-50">Asegurado</TableHead>
                <TableHead className="min-w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryRows.map((row) => {
                const calculated = calculateRowValues(row);
                const hasChanges = editedRows[row.empleado_id] && Object.keys(editedRows[row.empleado_id]).length > 0;
                
                return (
                  <TableRow key={row.empleado_id} className={hasChanges ? "bg-yellow-50" : ""}>
                    <TableCell className="font-medium sticky left-0 bg-background min-w-[200px]">
                      <div>
                        <div className="font-medium text-sm">{row.empleado_name}</div>
                        <div className="text-xs text-gray-500">{row.empleado_position}</div>
                      </div>
                    </TableCell>
                    
                    <TableCell className="min-w-[120px]">
                      <Input
                        type="number"
                        value={getEffectiveValue(row, 'facturacion') || ''}
                        onChange={(e) => handleFieldChange(row.empleado_id, 'facturacion', e.target.value)}
                        className="w-full text-right"
                        placeholder="0"
                      />
                    </TableCell>
                    
                    <TableCell className="bg-violet-50 min-w-[120px]">
                      <span className="font-medium text-sm block text-right">{formatCurrency(calculated.comision)}</span>
                    </TableCell>
                    
                    <TableCell className="min-w-[100px]">
                      <Input
                        type="number"
                        value={getEffectiveValue(row, 'adelanto') || ''}
                        onChange={(e) => handleFieldChange(row.empleado_id, 'adelanto', e.target.value)}
                        className="w-full text-right"
                        placeholder="0"
                      />
                    </TableCell>
                    
                    <TableCell className="min-w-[100px]">
                      <Input
                        type="number"
                        value={getEffectiveValue(row, 'vacaciones') || ''}
                        onChange={(e) => handleFieldChange(row.empleado_id, 'vacaciones', e.target.value)}
                        className="w-full text-right"
                        placeholder="0"
                      />
                    </TableCell>
                    
                    <TableCell className="min-w-[100px]">
                      <Input
                        type="number"
                        value={getEffectiveValue(row, 'recepcion') || ''}
                        onChange={(e) => handleFieldChange(row.empleado_id, 'recepcion', e.target.value)}
                        className="w-full text-right"
                        placeholder="0"
                      />
                    </TableCell>
                    
                    <TableCell className="min-w-[100px]">
                      <Input
                        type="number"
                        value={getEffectiveValue(row, 'otros') || ''}
                        onChange={(e) => handleFieldChange(row.empleado_id, 'otros', e.target.value)}
                        className="w-full text-right"
                        placeholder="0"
                      />
                    </TableCell>
                    
                    <TableCell className="min-w-[100px]">
                      <Input
                        type="number"
                        value={getEffectiveValue(row, 'recibo') || ''}
                        onChange={(e) => handleFieldChange(row.empleado_id, 'recibo', e.target.value)}
                        className="w-full text-right"
                        placeholder="0"
                      />
                    </TableCell>
                    
                    <TableCell className="bg-violet-50 min-w-[120px]">
                      <span className="font-medium text-sm block text-right">{formatCurrency(calculated.total_efectivo)}</span>
                    </TableCell>
                    
                    <TableCell className="bg-violet-50 min-w-[120px]">
                      <span className="font-medium text-sm block text-right">{formatCurrency(calculated.total_completo)}</span>
                    </TableCell>
                    
                    <TableCell className="bg-violet-50 min-w-[120px]">
                      <span className="font-medium text-sm block text-right">{formatCurrency(calculated.asegurado)}</span>
                    </TableCell>
                    
                    <TableCell className="min-w-[100px]">
                      <Button
                        size="sm"
                        onClick={() => handleSaveSalary(row)}
                        disabled={saveSalaryMutation.isPending}
                        className="w-full"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              
              {/* Fila de totales */}
              <TableRow className="bg-gray-100 font-bold border-t-2">
                <TableCell className="sticky left-0 bg-gray-100">TOTALES</TableCell>
                <TableCell className="text-right text-sm">{formatCurrency(totals.facturacion)}</TableCell>
                <TableCell className="bg-violet-100 text-right text-sm">{formatCurrency(totals.comision)}</TableCell>
                <TableCell className="text-right text-sm">{formatCurrency(totals.adelanto)}</TableCell>
                <TableCell className="text-right text-sm">{formatCurrency(totals.vacaciones)}</TableCell>
                <TableCell className="text-right text-sm">{formatCurrency(totals.recepcion)}</TableCell>
                <TableCell className="text-right text-sm">{formatCurrency(totals.otros)}</TableCell>
                <TableCell className="text-right text-sm">{formatCurrency(totals.recibo)}</TableCell>
                <TableCell className="bg-violet-100 text-right text-sm">{formatCurrency(totals.total_efectivo)}</TableCell>
                <TableCell className="bg-violet-100 text-right text-sm">{formatCurrency(totals.total_completo)}</TableCell>
                <TableCell className="bg-violet-100 text-right text-sm">{formatCurrency(totals.asegurado)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
