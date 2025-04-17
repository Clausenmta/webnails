
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  giftCardService, 
  GiftCard, 
  NewGiftCard, 
  calculateExpiryDate,
  determineStatus
} from "@/services/giftCardService";
import { toast } from "sonner";

export function useGiftCardManagement() {
  const queryClient = useQueryClient();
  
  // Estados para diálogos y gestión
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConfirmRedeemDialogOpen, setIsConfirmRedeemDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedGiftCard, setSelectedGiftCard] = useState<GiftCard | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "redeemed" | "expired" | "all">("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [dialogsEnabled, setDialogsEnabled] = useState(true);
  
  // Estado para importación
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [importResults, setImportResults] = useState<{ total: number; successful: number; failed: number }>({
    total: 0,
    successful: 0,
    failed: 0
  });
  const [importErrors, setImportErrors] = useState<string[]>([]);
  
  // Query para obtener gift cards
  const { data: giftCards = [], isLoading } = useQuery({
    queryKey: ['giftCards'],
    queryFn: giftCardService.fetchGiftCards,
    meta: {
      onError: (error: any) => {
        console.error("Error al obtener gift cards:", error);
        toast.error(`Error al cargar tarjetas de regalo: ${error.message}`);
      }
    }
  });

  // Mutaciones
  const addGiftCardMutation = useMutation({
    mutationFn: giftCardService.addGiftCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
      setIsAddDialogOpen(false);
      toast.success("Tarjeta de regalo creada correctamente");
    },
    onError: (error: any) => {
      console.error("Error al crear la tarjeta de regalo:", error);
      toast.error(`Error al crear la tarjeta de regalo: ${error.message}`);
    }
  });

  const updateGiftCardMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number, updates: Partial<NewGiftCard> }) => 
      giftCardService.updateGiftCard(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
      setIsEditDialogOpen(false);
      toast.success("Tarjeta de regalo actualizada correctamente");
    },
    onError: (error: any) => {
      console.error("Error al actualizar la tarjeta de regalo:", error);
      toast.error(`Error al actualizar la tarjeta de regalo: ${error.message}`);
    }
  });

  const deleteGiftCardMutation = useMutation({
    mutationFn: (id: number) => giftCardService.deleteGiftCard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
      setIsDeleteDialogOpen(false);
      toast.success("Tarjeta de regalo eliminada correctamente");
    },
    onError: (error: any) => {
      console.error("Error al eliminar la tarjeta de regalo:", error);
      toast.error(`Error al eliminar la tarjeta de regalo: ${error.message}`);
    }
  });

  // Funciones para manejo de diálogos
  const safeAction = (action: () => void) => {
    if (!dialogsEnabled) return;
    
    setDialogsEnabled(false);
    
    try {
      action();
    } finally {
      // Re-habilitar acciones después de un breve tiempo
      setTimeout(() => {
        setDialogsEnabled(true);
      }, 500);
    }
  };

  const closeAllDialogs = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsViewDetailsDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsConfirmRedeemDialogOpen(false);
    setIsImportDialogOpen(false);
    
    setTimeout(() => {
      setSelectedGiftCard(null);
    }, 300);
  };

  const handleDialogOpenChange = (open: boolean, setOpenFn: React.Dispatch<React.SetStateAction<boolean>>, cleanup?: () => void) => {
    if (!open) {
      setOpenFn(false);
      
      if (cleanup) {
        setTimeout(() => {
          cleanup();
        }, 300);
      }
    } else if (dialogsEnabled) {
      setOpenFn(open);
    }
  };

  // Resetear estado importación
  const resetImportState = () => {
    setImportStatus("idle");
    setImportProgress(0);
    setImportErrors([]);
    setImportResults({ total: 0, successful: 0, failed: 0 });
  };

  // Función para calcular automáticamente la fecha de vencimiento
  const updateExpiryDate = (purchaseDate: string): string => {
    return calculateExpiryDate(purchaseDate);
  };

  // Función para determinar el estado basado en fechas
  const updateStatusFromDates = (purchaseDate: string, expiryDate: string, redeemedDate?: string): GiftCard["status"] => {
    return determineStatus(purchaseDate, expiryDate, redeemedDate);
  };

  return {
    // Estado y datos
    giftCards,
    isLoading,
    
    // Estado de diálogos
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isViewDetailsDialogOpen,
    setIsViewDetailsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isConfirmRedeemDialogOpen,
    setIsConfirmRedeemDialogOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    selectedGiftCard,
    setSelectedGiftCard,
    
    // Filtros
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    branchFilter,
    setBranchFilter,
    
    // Mutaciones
    addGiftCardMutation,
    updateGiftCardMutation,
    deleteGiftCardMutation,
    
    // Importación
    importProgress,
    setImportProgress,
    importStatus,
    setImportStatus,
    importResults,
    setImportResults,
    importErrors,
    setImportErrors,
    
    // Funciones de utilidad
    safeAction,
    closeAllDialogs,
    handleDialogOpenChange,
    resetImportState,
    updateExpiryDate,
    updateStatusFromDates,
    
    // Otros
    dialogsEnabled
  };
}
