
import { useState } from "react";
import { Arreglo } from "@/services/arreglosService";

export function useArreglosDialogs() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [currentArreglo, setCurrentArreglo] = useState<Arreglo | null>(null);

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isFilterDialogOpen,
    setIsFilterDialogOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    currentArreglo,
    setCurrentArreglo,
  };
}
