
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ArreglosTable from "./ArreglosTable";
import { Arreglo } from "@/services/arreglosService";

interface ArregloViewControlsProps {
  title: string;
  description: string;
  arreglos: Arreglo[];
  onViewClick: (arreglo: Arreglo) => void;
  onDeleteClick?: (arreglo: Arreglo) => void; // <-- AGREGADO
  sortConfig: {
    key: keyof Arreglo;
    direction: "asc" | "desc";
  };
  onSortChange: (key: keyof Arreglo) => void;
}

export default function ArregloViewControls({
  title,
  description,
  arreglos,
  onViewClick,
  onDeleteClick,
  sortConfig,
  onSortChange
}: ArregloViewControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ArreglosTable
          arreglos={arreglos}
          onViewClick={onViewClick}
          onDeleteClick={onDeleteClick} // <-- PASA EL HANDLER!
          sortConfig={sortConfig}
          onSortChange={onSortChange}
        />
      </CardContent>
    </Card>
  );
}
