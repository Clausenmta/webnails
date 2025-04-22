
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Arreglo } from "@/services/arreglosService";
import { Badge } from "@/components/ui/badge";

interface ArreglosTableProps {
  arreglos: Arreglo[];
  onViewClick: (arreglo: Arreglo) => void;
  onEditClick?: (arreglo: Arreglo) => void; // Nuevo handler (puedes pasarlo opcional)
  onDeleteClick?: (arreglo: Arreglo) => void;
  sortConfig: {
    key: keyof Arreglo;
    direction: "asc" | "desc";
  };
  onSortChange: (key: keyof Arreglo) => void;
}

export default function ArreglosTable({
  arreglos,
  onViewClick,
  onEditClick,
  onDeleteClick,
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
                <span>
                  <span className="sr-only">Ordenar</span>
                  {/* Puedes mostrar el ícono de orden aquí si lo deseas */}
                </span>
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
            <TableCell>{arreglo.repair_date || '-'}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {/* Ver detalles */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewClick(arreglo)}
                  title="Ver detalles"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Ver detalles</span>
                </Button>

                {/* Editar */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => (onEditClick ? onEditClick(arreglo) : onViewClick(arreglo))}
                  title="Editar"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>

                {/* Eliminar */}
                {onDeleteClick && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteClick(arreglo)}
                    title="Eliminar"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
