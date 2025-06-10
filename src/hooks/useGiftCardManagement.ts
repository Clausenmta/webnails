
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
import { format } from "date-fns";
import { exportReport } from "@/utils/reportExport";

export function useGiftCardManagement() {
  const queryClient = useQueryClient();
  
  // Estados para diálogos y gestión
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedGiftCard, setSelectedGiftCard] = useState<GiftCard | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"active" | "redeemed" | "expired" | "all">("all");
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(undefined);
  
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

  // Helper function to check if date is in selected month/year
  const isDateInSelectedMonth = (dateString: string, selectedMonth: Date) => {
    const [year, month] = dateString.split('-');
    const cardDate = new Date(parseInt(year), parseInt(month) - 1);
    return cardDate.getMonth() === selectedMonth.getMonth() && 
           cardDate.getFullYear() === selectedMonth.getFullYear();
  };

  // Apply filters to gift cards
  const filteredGiftCards = giftCards.filter(card => {
    // Search filter
    const matchesSearch = 
      card.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (card.customer_name && card.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (card.service && card.service.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (card.notes && card.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    
    // Status filter
    if (statusFilter !== "all" && card.status !== statusFilter) {
      return false;
    }
    
    // Month filter
    if (selectedMonth) {
      if (!isDateInSelectedMonth(card.purchase_date, selectedMonth)) {
        return false;
      }
    }
    
    return true;
  });

  // Mutaciones
  const addGiftCardMutation = useMutation({
    mutationFn: (newGiftCard: NewGiftCard) => {
      console.log("Adding gift card:", newGiftCard);
      return giftCardService.addGiftCard(newGiftCard);
    },
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
    mutationFn: ({ id, updates }: { id: number, updates: Partial<NewGiftCard> }) => {
      console.log("Updating gift card:", id, updates);
      return giftCardService.updateGiftCard(id, updates);
    },
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
    mutationFn: (id: number) => {
      console.log("Deleting gift card:", id);
      return giftCardService.deleteGiftCard(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftCards'] });
      setIsDeleteDialogOpen(false);
      setSelectedGiftCard(null);
      toast.success("Tarjeta de regalo eliminada correctamente");
    },
    onError: (error: any) => {
      console.error("Error al eliminar la tarjeta de regalo:", error);
      toast.error(`Error al eliminar la tarjeta de regalo: ${error.message}`);
    }
  });

  const updateExpiryDate = (purchaseDate: string): string => {
    return calculateExpiryDate(purchaseDate);
  };

  const handleExportToExcel = () => {
    const formattedGiftCards = filteredGiftCards.map(card => ({
      Código: card.code,
      Monto: card.amount,
      Cliente: card.customer_name || '',
      Servicio: card.service || '',
      Fecha_Compra: card.purchase_date,
      Fecha_Vencimiento: card.expiry_date,
      Estado: card.status === 'active' ? 'Activa' : card.status === 'redeemed' ? 'Canjeada' : 'Vencida',
      Fecha_Canje: card.redeemed_date || '',
      Notas: card.notes || '',
      Creado_Por: card.created_by
    }));

    exportReport(formattedGiftCards, {
      filename: `Tarjetas_Regalo_${format(new Date(), 'yyyy-MM-dd')}`,
      format: 'excel'
    });
  };

  // Debug: log dialog states
  useEffect(() => {
    console.log("Dialog states:", {
      isAddDialogOpen,
      isEditDialogOpen,
      isViewDetailsDialogOpen,
      isDeleteDialogOpen,
      selectedGiftCard
    });
  }, [isAddDialogOpen, isEditDialogOpen, isViewDetailsDialogOpen, isDeleteDialogOpen, selectedGiftCard]);

  return {
    giftCards: filteredGiftCards,
    isLoading,
    
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isViewDetailsDialogOpen,
    setIsViewDetailsDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    selectedGiftCard,
    setSelectedGiftCard,
    
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedMonth,
    setSelectedMonth,
    
    addGiftCardMutation,
    updateGiftCardMutation,
    deleteGiftCardMutation,
    
    updateExpiryDate,
    handleExportToExcel
  };
}
