
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Arreglo } from "@/services/arreglosService";
import { Badge } from "@/components/ui/badge";

interface ArreglosTableProps {
  arreglos: Arreglo[];
  onViewClick: (arreglo: Arreglo) => void;
  sortConfig: {
    key: keyof Arreglo;
    direction: "asc" | "desc";
  };
  onSortChange: (key: keyof Arreglo) => void;
}

export default function ArreglosTable({
  arreglos,
  onViewClick,
  sortConfig,
  onSortChange
}: ArreglosTableProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pendiente': return 'secondary';
      case 'en_proceso': return 'default';
      case 'completado': return 'success';
      case 'cancelado': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Button
              variant="ghost"
              onClick={() => onSortChange('client_name')}
              className="flex items-center gap-1"
            >
              Cliente
              {sortConfig.key === 'client_name' && (
                <ArrowUpDown className="h-4 w-4" />
              )}
            </Button>
          </TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Comanda Original</TableHead>
          <TableHead>Arreglado Por</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Precio</TableHead>
          <TableHead>F. Comanda</TableHead>
          <TableHead>F. Arreglo</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {arreglos.map((arreglo) => (
          <TableRow key={arreglo.id}>
            <TableCell className="font-medium">{arreglo.client_name}</TableCell>
            <TableCell>{arreglo.description}</TableCell>
            <TableCell>{arreglo.created_by}</TableCell>
            <TableCell>{arreglo.assigned_to}</TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(arreglo.status)}>
                {arreglo.status}
              </Badge>
            </TableCell>
            <TableCell>${arreglo.price}</TableCell>
            <TableCell>{arreglo.date}</TableCell>
            <TableCell>{arreglo.repair_date}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewClick(arreglo)}
              >
                Ver detalles
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
