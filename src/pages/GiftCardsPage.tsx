import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  CreditCard,
  Download,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  FileText,
  FileSpreadsheet,
  Upload,
  GiftIcon,
  Building,
  Check
} from "lucide-react";
import { BadgeInfo, BadgeCheck, BadgeAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import * as XLSX from 'xlsx';
import { exportReport } from "@/utils/reportExport";
import { useGiftCardManagement } from "@/hooks/useGiftCardManagement";
import { GiftCard, NewGiftCard } from "@/services/giftCardService";

const branchOptions = ["Fisherton", "Alto Rosario", "Moreno", "Tucuman"];

export default function GiftCardsPage() {
  const {
    giftCards,
    isLoading,
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
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    addGiftCardMutation,
    updateGiftCardMutation,
    deleteGiftCardMutation,
    importProgress,
    setImportProgress,
    importStatus,
    setImportStatus,
    importResults,
    setImportResults,
    importErrors,
    setImportErrors,
    safeAction,
    handleDialogOpenChange,
    resetImportState,
    dialogsEnabled,
    branchFilter,
    setBranchFilter,
    updateExpiryDate,
    updateStatusFromDates
  } = useGiftCardManagement();

  // Definir newGiftCard como una versión parcial de NewGiftCard con branch
  interface GiftCardFormState extends Partial<NewGiftCard> {
    branch?: string;
  }

  const [newGiftCard, setNewGiftCard] = useState<GiftCardFormState>({
    status: "active",
    purchase_date: new Date().toISOString().split('T')[0]
  });

  const [editGiftCard, setEditGiftCard] = useState<GiftCardFormState>({});
  const [isRedeemed, setIsRedeemed] = useState<boolean>(false);
  const [newCardIsRedeemed, setNewCardIsRedeemed] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clean up effect to prevent memory leaks
  useEffect(() => {
    return () => {
      setSelectedGiftCard(null);
      setEditGiftCard({});
      setIsRedeemed(false);
    };
  }, [setSelectedGiftCard]);

  // Effect for setting expiry date on new gift card
  useEffect(() => {
    if (newGiftCard.purchase_date) {
      const expiryDate = updateExpiryDate(newGiftCard.purchase_date);
      setNewGiftCard(prev => ({
        ...prev,
        expiry_date: expiryDate
      }));
    }
  }, [newGiftCard.purchase_date, updateExpiryDate]);

  // Effects for edit gift card - modified to avoid infinite loops
  useEffect(() => {
    if (editGiftCard.purchase_date && !editGiftCard.expiry_date) {
      const expiryDate = updateExpiryDate(editGiftCard.purchase_date);
      setEditGiftCard(prev => ({
        ...prev,
        expiry_date: expiryDate
      }));
    }
  }, [editGiftCard.purchase_date, updateExpiryDate]);
  
  // Separate effect for status updates to avoid loops
  useEffect(() => {
    if (editGiftCard.purchase_date && editGiftCard.expiry_date) {
      const status = updateStatusFromDates(
        editGiftCard.purchase_date,
        editGiftCard.expiry_date,
        editGiftCard.redeemed_date
      );
      
      setEditGiftCard(prev => ({
        ...prev,
        status
      }));
    }
  }, [editGiftCard.purchase_date, editGiftCard.expiry_date, editGiftCard.redeemed_date, updateStatusFromDates]);
  
  // Effect for handling the isRedeemed checkbox state - modified to avoid infinite loops
  useEffect(() => {
    // Only update if this is an actual change to prevent loops
    const currentIsRedeemed = !!editGiftCard.redeemed_date || editGiftCard.status === "redeemed";
    if (isRedeemed !== currentIsRedeemed) {
      setIsRedeemed(currentIsRedeemed);
    }
  }, [editGiftCard.redeemed_date, editGiftCard.status]);

  // Effect for updating redeemed date based on checkbox - modified to avoid loops
  useEffect(() => {
    const hasRedeemedDate = !!editGiftCard.redeemed_date;
    const shouldHaveRedeemedDate = isRedeemed;
    
    if (shouldHaveRedeemedDate && !hasRedeemedDate) {
      setEditGiftCard(prev => ({
        ...prev,
        redeemed_date: new Date().toISOString().split('T')[0],
        status: "redeemed"
      }));
    } else if (!shouldHaveRedeemedDate && hasRedeemedDate) {
      const { redeemed_date, ...rest } = editGiftCard;
      const status = updateStatusFromDates(
        editGiftCard.purchase_date || "",
        editGiftCard.expiry_date || "",
        undefined
      );
      
      setEditGiftCard({
        ...rest,
        status
      });
    }
  }, [isRedeemed, updateStatusFromDates]);

  // Effect for handling the newCardIsRedeemed checkbox state
  useEffect(() => {
    if (newCardIsRedeemed && !newGiftCard.redeemed_date) {
      setNewGiftCard(prev => ({
        ...prev,
        redeemed_date: new Date().toISOString().split('T')[0],
        status: "redeemed"
      }));
    } else if (!newCardIsRedeemed && newGiftCard.redeemed_date) {
      const { redeemed_date, ...rest } = newGiftCard;
      const status = updateStatusFromDates(
        newGiftCard.purchase_date || "",
        newGiftCard.expiry_date || "",
        undefined
      );
      
      setNewGiftCard({
        ...rest,
        status
      });
    }
  }, [newCardIsRedeemed, updateStatusFromDates]);

  const handleNewGiftCardChange = (field: keyof (GiftCard & {branch?: string}), value: any) => {
    setNewGiftCard(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditGiftCardChange = (field: keyof (GiftCard & {branch?: string}), value: any) => {
    setEditGiftCard(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportPDF = () => {
    try {
      exportReport(giftCards, {
        filename: "gift-cards",
        format: "pdf"
      });
    } catch (error) {
      console.error("Error al exportar a PDF:", error);
      toast.error("No se pudo exportar a PDF. Intente nuevamente.");
    }
  };

  const handleExportExcel = () => {
    try {
      exportReport(giftCards, {
        filename: "gift-cards",
        format: "excel"
      });
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      toast.error("No se pudo exportar a Excel. Intente nuevamente.");
    }
  };

  const handleCreateGiftCard = () => {
    if (!dialogsEnabled) return;
    
    try {
      if (!newGiftCard.code || !newGiftCard.amount) {
        toast.error("Por favor complete todos los campos requeridos.");
        return;
      }

      // Usar la fecha de vencimiento calculada o calcular una nueva
      const expiryDate = newGiftCard.expiry_date || updateExpiryDate(newGiftCard.purchase_date || new Date().toISOString().split('T')[0]);

      // Determinar estado
      const status = updateStatusFromDates(
        newGiftCard.purchase_date || new Date().toISOString().split('T')[0],
        expiryDate,
        newGiftCard.redeemed_date
      );

      // Crear un objeto que cumpla explícitamente con los requisitos de NewGiftCard
      const giftCardToAdd: NewGiftCard = {
        code: newGiftCard.code, // Esta propiedad es requerida
        amount: newGiftCard.amount, // Esta propiedad es requerida
        status: status,
        purchase_date: newGiftCard.purchase_date || new Date().toISOString().split('T')[0],
        expiry_date: expiryDate,
        created_by: "admin",
        branch: newGiftCard.branch,
        ...(newGiftCard.customer_name && { customer_name: newGiftCard.customer_name }),
        ...(newGiftCard.customer_email && { customer_email: newGiftCard.customer_email }),
        ...(newGiftCard.redeemed_date && { redeemed_date: newGiftCard.redeemed_date }),
        ...(newGiftCard.notes && { notes: newGiftCard.notes })
      };

      addGiftCardMutation.mutate(giftCardToAdd);

      // Limpiar el formulario
      setNewGiftCard({
        status: "active",
        purchase_date: new Date().toISOString().split('T')[0]
      });
      setNewCardIsRedeemed(false);
    } catch (error) {
      console.error("Error al crear gift card:", error);
      toast.error("Ocurrió un error al crear la gift card. Intente nuevamente.");
    }
  };

  // Updated to fix dialog handling
  const handleViewDetails = (card: GiftCard) => {
    safeAction(() => {
      try {
        // First, set the selected card data
        setSelectedGiftCard(card);
        // Then open the dialog in the next tick to prevent render conflicts
        setTimeout(() => {
          setIsViewDetailsDialogOpen(true);
        }, 0);
      } catch (error) {
        console.error("Error al ver detalles:", error);
        toast.error("No se pudieron cargar los detalles. Intente nuevamente.");
      }
    });
  };

  // Updated to fix dialog handling
  const handleEdit = (card: GiftCard) => {
    safeAction(() => {
      try {
        // First, set the card data
        setSelectedGiftCard(card);
        setEditGiftCard(card);
        setIsRedeemed(card.status === "redeemed" || !!card.redeemed_date);
        
        // Then open the dialog in the next tick
        setTimeout(() => {
          setIsEditDialogOpen(true);
        }, 0);
      } catch (error) {
        console.error("Error al editar:", error);
        toast.error("No se pudo abrir el editor. Intente nuevamente.");
      }
    });
  };

  const handleSaveEdit = () => {
    if (!dialogsEnabled || !selectedGiftCard) return;
    
    try {
      if (!editGiftCard.code || !editGiftCard.amount) {
        toast.error("Por favor complete todos los campos requeridos.");
        return;
      }

      if (!editGiftCard.status) {
        editGiftCard.status = updateStatusFromDates(
          editGiftCard.purchase_date || selectedGiftCard.purchase_date,
          editGiftCard.expiry_date || selectedGiftCard.expiry_date,
          editGiftCard.redeemed_date
        );
      }

      updateGiftCardMutation.mutate({
        id: selectedGiftCard.id,
        updates: editGiftCard
      });
    } catch (error) {
      console.error("Error al guardar edición:", error);
      toast.error("Ocurrió un error al actualizar la gift card. Intente nuevamente.");
    }
  };

  // Updated to fix dialog handling
  const handleDelete = (card: GiftCard) => {
    safeAction(() => {
      try {
        // First, set the card data
        setSelectedGiftCard(card);
        // Then open the dialog in the next tick
        setTimeout(() => {
          setIsDeleteDialogOpen(true);
        }, 0);
      } catch (error) {
        console.error("Error al preparar eliminación:", error);
        toast.error("No se pudo preparar la eliminación. Intente nuevamente.");
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!dialogsEnabled || !selectedGiftCard) return;
    
    try {
      deleteGiftCardMutation.mutate(selectedGiftCard.id);
    } catch (error) {
      console.error("Error al eliminar gift card:", error);
      toast.error("Ocurrió un error al eliminar la gift card. Intente nuevamente.");
    }
  };

  // Updated to fix dialog handling
  const handleMarkAsRedeemed = (card: GiftCard) => {
    safeAction(() => {
      try {
        // First, set the card data
        setSelectedGiftCard(card);
        // Then open the dialog in the next tick
        setTimeout(() => {
          setIsConfirmRedeemDialogOpen(true);
        }, 0);
      } catch (error) {
        console.error("Error al preparar canje:", error);
        toast.error("No se pudo preparar el canje. Intente nuevamente.");
      }
    });
  };

  const handleConfirmRedeem = () => {
    if (!dialogsEnabled || !selectedGiftCard) return;
    
    try {
      updateGiftCardMutation.mutate({
        id: selectedGiftCard.id,
        updates: {
          status: "redeemed",
          redeemed_date: new Date().toISOString().split('T')[0]
        }
      });
      setIsConfirmRedeemDialogOpen(false);
    } catch (error) {
      console.error("Error al canjear gift card:", error);
      toast.error("Ocurrió un error al canjear la gift card. Intente nuevamente.");
    }
  };

  // Effect for keeping isRedeemed in sync with selectedGiftCard - modified to fix loops
  useEffect(() => {
    if (isEditDialogOpen && selectedGiftCard) {
      // Use this effect only when the dialog opens
      setIsRedeemed(selectedGiftCard.status === "redeemed" || !!selectedGiftCard.redeemed_date);
    }
  }, [isEditDialogOpen, selectedGiftCard]);

  // Effect for adding dialog - checking for purchase date
  useEffect(() => {
    if (isAddDialogOpen && newGiftCard.purchase_date && !newGiftCard.expiry_date) {
      const expiryDate = updateExpiryDate(newGiftCard.purchase_date);
      setNewGiftCard(prev => ({
        ...prev,
        expiry_date: expiryDate
      }));
    }
  }, [isAddDialogOpen, newGiftCard.purchase_date, updateExpiryDate]);

  const filteredGiftCards = giftCards.filter(card => {
    const matchesSearch = (card.code?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (card.customer_name && card.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         false);

    const matchesStatus = statusFilter === "all" || card.status === statusFilter;
    const matchesBranch = branchFilter === "all" || card.branch === branchFilter;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  const renderStatusBadge = (status: GiftCard['status']) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            <BadgeInfo className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "redeemed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            <BadgeCheck className="w-3 h-3 mr-1" />
            Canjeada
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            <BadgeAlert className="w-3 h-3 mr-1" />
            Vencida
          </Badge>
        );
      default:
        return null;
    }
  };

  const validateGiftCardData = (data: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data.code) errors.push(`Falta el código de gift card en la fila ${data.__rowNum__ + 1}`);
    if (!data.amount) errors.push(`Falta el monto en la fila ${data.__rowNum__ + 1}`);
    if (!data.purchase_date) errors.push(`Falta la fecha de compra en la fila ${data.__rowNum__ + 1}`);
    
    if (data.status && !["active", "redeemed", "expired"].includes(data.status)) {
      errors.push(`Estado inválido "${data.status}" en la fila ${data.__rowNum__ + 1}. Debe ser "active", "redeemed" o "expired"`);
    }
    
    try {
      if (data.purchase_date) new Date(data.purchase_date);
      if (data.expiry_date) new Date(data.expiry_date);
      if (data.redeemed_date) new Date(data.redeemed_date);
    } catch (e) {
      errors.push(`Formato de fecha inválido en la fila ${data.__rowNum__ + 1}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const processExcelFile = (file: File) => {
    try {
      setImportStatus("processing");
      setImportProgress(10);
      setImportErrors([]);
      
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          setImportProgress(30);
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
          
          setImportProgress(50);
          
          if (jsonData.length === 0) {
            setImportStatus("error");
            setImportErrors(["El archivo no contiene datos"]);
            return;
          }
          
          const newGiftCards: NewGiftCard[] = [];
          const errors: string[] = [];
          
          jsonData.forEach((row, index) => {
            setImportProgress(50 + Math.floor((index / jsonData.length) * 40));
            
            const { isValid, errors: rowErrors } = validateGiftCardData(row);
            
            if (isValid) {
              const purchaseDate = new Date(row.purchase_date);
              let expiryDate = row.expiry_date ? new Date(row.expiry_date) : new Date(purchaseDate);
              if (!row.expiry_date) {
                expiryDate.setDate(expiryDate.getDate() + 30);
              }
              
              const newGiftCard: NewGiftCard = {
                code: row.code,
                amount: row.amount,
                status: row.status || "active",
                customer_name: row.customer_name,
                customer_email: row.customer_email,
                purchase_date: row.purchase_date,
                expiry_date: row.expiry_date || expiryDate.toISOString().split('T')[0],
                redeemed_date: row.redeemed_date,
                created_by: "admin",
                notes: row.notes
              };
              
              newGiftCards.push(newGiftCard);
            } else {
              errors.push(...rowErrors);
            }
          });
          
          setImportProgress(95);
          
          setImportResults({
            total: jsonData.length,
            successful: newGiftCards.length,
            failed: jsonData.length - newGiftCards.length
          });
          
          setImportErrors(errors);
          
          if (newGiftCards.length > 0) {
            Promise.all(newGiftCards.map(card => addGiftCardMutation.mutateAsync(card)))
              .then(() => {
                setImportStatus("success");
                setImportProgress(100);
                toast.success(`Se importaron ${newGiftCards.length} gift cards correctamente`);
              })
              .catch(error => {
                setImportStatus("error");
                setImportProgress(100);
                setImportErrors(prev => [...prev, `Error al guardar: ${error.message}`]);
                toast.error(`Error al guardar gift cards: ${error.message}`);
              });
          } else {
            setImportStatus("error");
            setImportProgress(100);
            toast.error("No se pudo importar ninguna gift card. Revise los errores.");
          }
        } catch (error: any) {
          console.error("Error al procesar el archivo Excel:", error);
          setImportStatus("error");
          setImportErrors(["Error al procesar el archivo Excel. Verifique el formato."]);
          
          toast.error("No se pudo procesar el archivo Excel. Verifique el formato.");
        }
      };
      
      reader.onerror = () => {
        setImportStatus("error");
        setImportErrors(["Error al leer el archivo"]);
        
        toast.error("No se pudo leer el archivo.");
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      setImportStatus("error");
      setImportProgress(0);
      setImportErrors(["Error inesperado al procesar el archivo"]);
      
      toast.error("Error inesperado al procesar el archivo.");
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (file) {
        processExcelFile(file);
      }
    } catch (error) {
      console.error("Error al seleccionar archivo:", error);
      toast.error("No se pudo seleccionar el archivo. Intente nuevamente.");
    }
  };

  const downloadExcelTemplate = () => {
    try {
      const workbook = XLSX.utils.book_new();
      
      const headers = [
        "code", "amount", "status", "customer_name", "customer_email", "purchase_date", "expiry_date"
      ];
      
      const sampleData = [
        {
          code: "GC-SAMPLE-001",
          amount: 2000,
          status: "active",
          customer_name: "Nombre Cliente",
          customer_email: "cliente@example.com",
          purchase_date: "2025-04-10",
          expiry_date: "2025-05-10"
        },
        {
          code: "GC-SAMPLE-002",
          amount: 3000,
          status: "redeemed",
          customer_name: "Otro Cliente",
          customer_email: "otro@example.com",
          purchase_date: "2025-04-10",
          expiry_date: "2025-05-10"
        }
      ];
      
      const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
      
      XLSX.utils.book_append_sheet(workbook, worksheet, "Gift Cards");
      
      XLSX.writeFile(workbook, "plantilla_gift_cards.xlsx");
      
      toast.success("La plantilla de Excel para importar gift cards ha sido descargada");
    } catch (error) {
      console.error("Error al descargar plantilla:", error);
      toast.error("No se pudo descargar la plantilla. Intente nuevamente.");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Main render for the Gift Cards page
  return (
    <div className="space-y-6">
      {/* Page header section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gift Cards</h2>
          <p className="text-muted-foreground">
            Gestiona todas las gift cards de tu negocio
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button 
            className="bg-salon-400 hover:bg-salon-500"
            onClick={() => {
              if (dialogsEnabled) {
                setIsAddDialogOpen(true);
              }
            }}
            disabled={!dialogsEnabled}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Gift Card
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={!dialogsEnabled}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50 bg-white">
              <DropdownMenuLabel>Formato de exportación</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Exportar como PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                <span>Exportar como Excel</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="outline"
            onClick={() => {
              if (dialogsEnabled) {
                setIsImportDialogOpen(true);
              }
            }}
            disabled={!dialogsEnabled}
          >
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
        </div>
      </div>

      {/* Main card with gift cards list */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Listado de Gift Cards</CardTitle>
              <CardDescription>
                {filteredGiftCards.length} gift cards encontradas
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-8 max-w-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 z-50 bg-white">
                  <DropdownMenuLabel>Filtros</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <div className="space-y-2 mb-2">
                      <Label>Estado</Label>
                      <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as "active" | "redeemed" | "expired" | "all")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="active">Pendiente</SelectItem>
                          <SelectItem value="redeemed">Canjeada</SelectItem>
                          <SelectItem value="expired">Vencida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sucursal</Label>
                      <Select
                        value={branchFilter}
                        onValueChange={(value) => setBranchFilter(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las sucursales" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="all">Todas las sucursales</SelectItem>
                          {branchOptions.map((branch) => (
                            <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código Gift Card</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Sucursal</TableHead>
                  <TableHead>F. Compra</TableHead>
                  <TableHead>F. Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGiftCards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <GiftIcon className="h-8 w-8 mb-2" />
                        <p>No se encontraron gift cards</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGiftCards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell className="font-medium">{card.code}</TableCell>
                      <TableCell>${card.amount.toLocaleString()}</TableCell>
                      <TableCell>{card.customer_name || '-'}</TableCell>
                      <TableCell>{card.branch || '-'}</TableCell>
                      <TableCell>{card.purchase_date}</TableCell>
                      <TableCell>{card.expiry_date}</TableCell>
                      <TableCell>{renderStatusBadge(card.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={!dialogsEnabled}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="z-50 bg-white">
                            <DropdownMenuItem onClick={() => handleViewDetails(card)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Ver Detalles</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(card)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            {card.status === "active" && (
                              <DropdownMenuItem onClick={() => handleMarkAsRedeemed(card)}>
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>Marcar como Canjeada</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete(card)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => handleDialogOpenChange(open, setIsDeleteDialogOpen, () => setSelectedGiftCard(null))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Gift Card</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar la gift card {selectedGiftCard?.code}?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteGiftCardMutation.isPending}
            >
              {deleteGiftCardMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redeem Dialog */}
      <Dialog 
        open={isConfirmRedeemDialogOpen} 
        onOpenChange={(open) => handleDialogOpenChange(open, setIsConfirmRedeemDialogOpen, () => setSelectedGiftCard(null))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como Canjeada</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas marcar la gift card {selectedGiftCard?.code} como canjeada?
              Esta acción registrará la fecha actual como fecha de canje.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmRedeemDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmRedeem}
              disabled={updateGiftCardMutation.isPending}
            >
              {updateGiftCardMutation.isPending ? 'Procesando...' : 'Confirmar Canje'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog 
        open={isViewDetailsDialogOpen} 
        onOpenChange={(open) => handleDialogOpenChange(open, setIsViewDetailsDialogOpen, () => setSelectedGiftCard(null))}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalles de Gift Card</DialogTitle>
            <DialogDescription>
              Información completa de la gift card
            </DialogDescription>
          </DialogHeader>
          
          {selectedGiftCard && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Código</Label>
                <div className="col-span-3 font-medium">{selectedGiftCard.code}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Monto</Label>
                <div className="col-span-3">${selectedGiftCard.amount.toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Estado</Label>
                <div className="col-span-3">{renderStatusBadge(selectedGiftCard.status)}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Cliente</Label>
                <div className="col-span-3">{selectedGiftCard.customer_name || '-'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Email</Label>
                <div className="col-span-3">{selectedGiftCard.customer_email || '-'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Sucursal</Label>
                <div className="col-span-3">{selectedGiftCard.branch || '-'}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">F. Compra</Label>
                <div className="col-span-3">{selectedGiftCard.purchase_date}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">F. Vencimiento</Label>
                <div className="col-span-3">{selectedGiftCard.expiry_date}</div>
              </div>
              {selectedGiftCard.redeemed_date && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">F. Canje</Label>
                  <div className="col-span-3">{selectedGiftCard.redeemed_date}</div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Creado por</Label>
                <div className="col-span-3">{selectedGiftCard.created_by}</div>
              </div>
              {selectedGiftCard.notes && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right">Notas</Label>
                  <div className="col-span-3">{selectedGiftCard.notes}</div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDetailsDialogOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => {
              setIsViewDetailsDialogOpen(false);
              setTimeout(() => {
                if (selectedGiftCard) {
                  handleEdit(selectedGiftCard);
                }
              }, 300);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => handleDialogOpenChange(open, setIsAddDialogOpen, () => {
          setNewGiftCard({
            status: "active",
            purchase_date: new Date().toISOString().split('T')[0]
          });
          setNewCardIsRedeemed(false);
        })}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nueva Gift Card</DialogTitle>
            <DialogDescription>
              Completa los datos para crear una nueva gift card
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Código *
              </Label>
              <Input
                id="code"
                value={newGiftCard.code || ''}
                onChange={(e) => handleNewGiftCardChange('code', e.target.value)}
                className="col-span-3"
                placeholder="GC-12345"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Monto *
              </Label>
              <Input
                id="amount"
                type="number"
                value={newGiftCard.amount || ''}
                onChange={(e) => handleNewGiftCardChange('amount', Number(e.target.value))}
                className="col-span-3"
                placeholder="2000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="branch" className="text-right">
                Sucursal
              </Label>
              <Select
                value={newGiftCard.branch || ''}
                onValueChange={(value) => handleNewGiftCardChange('branch', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar sucursal" />
                </SelectTrigger>
                <SelectContent>
                  {branchOptions.map((branch) => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer_name" className="text-right">
                Cliente
              </Label>
              <Input
                id="customer_name"
                value={newGiftCard.customer_name || ''}
                onChange={(e) => handleNewGiftCardChange('customer_name', e.target.value)}
                className="col-span-3"
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer_email" className="text-right">
                Email
              </Label>
              <Input
                id="customer_email"
                type="email"
                value={newGiftCard.customer_email || ''}
                onChange={(e) => handleNewGiftCardChange('customer_email', e.target.value)}
                className="col-span-3"
                placeholder="cliente@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purchase_date" className="text-right">
                F. Compra
              </Label>
              <Input
                id="purchase_date"
                type="date"
                value={newGiftCard.purchase_date || ''}
                onChange={(e) => handleNewGiftCardChange('purchase_date', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiry_date" className="text-right">
                F. Vencimiento
              </Label>
              <Input
                id="expiry_date"
                type="date"
                value={newGiftCard.expiry_date || ''}
                onChange={(e) => handleNewGiftCardChange('expiry_date', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label htmlFor="is_redeemed" className="text-right">
                  Canjeada
                </Label>
              </div>
              <div className="flex items-center space-x-2 col-span-3">
                <Checkbox 
                  id="is_redeemed" 
                  checked={newCardIsRedeemed}
                  onCheckedChange={(checked) => setNewCardIsRedeemed(checked === true)}
                />
                <label
                  htmlFor="is_redeemed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Marcar como canjeada
                </label>
              </div>
            </div>
            {newCardIsRedeemed && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="redeemed_date" className="text-right">
                  F. Canje
                </Label>
                <Input
                  id="redeemed_date"
                  type="date"
                  value={newGiftCard.redeemed_date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleNewGiftCardChange('redeemed_date', e.target.value)}
                  className="col-span-3"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="notes" className="text-right">
                Notas
              </Label>
              <textarea
                id="notes"
                value={newGiftCard.notes || ''}
                onChange={(e) => handleNewGiftCardChange('notes', e.target.value)}
                className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Información adicional"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateGiftCard}
              disabled={addGiftCardMutation.isPending}
            >
              {addGiftCardMutation.isPending ? 'Creando...' : 'Crear Gift Card'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => handleDialogOpenChange(open, setIsEditDialogOpen, () => {
          setSelectedGiftCard(null);
          setEditGiftCard({});
          setIsRedeemed(false);
        })}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Gift Card</DialogTitle>
            <DialogDescription>
              Modifica los datos de la gift card
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-code" className="text-right">
                Código *
              </Label>
              <Input
                id="edit-code"
                value={editGiftCard.code || ''}
                onChange={(e) => handleEditGiftCardChange('code', e.target.value)}
                className="col-span-3"
                placeholder="GC-12345"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-amount" className="text-right">
                Monto *
              </Label>
              <Input
                id="edit-amount"
                type="number"
                value={editGiftCard.amount || ''}
                onChange={(e) => handleEditGiftCardChange('amount', Number(e.target.value))}
                className="col-span-3"
                placeholder="2000"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-branch" className="text-right">
                Sucursal
              </Label>
              <Select
                value={editGiftCard.branch || ''}
                onValueChange={(value) => handleEditGiftCardChange('branch', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar sucursal" />
                </SelectTrigger>
                <SelectContent>
                  {branchOptions.map((branch) => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-customer_name" className="text-right">
                Cliente
              </Label>
              <Input
                id="edit-customer_name"
                value={editGiftCard.customer_name || ''}
                onChange={(e) => handleEditGiftCardChange('customer_name', e.target.value)}
                className="col-span-3"
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-customer_email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-customer_email"
                type="email"
                value={editGiftCard.customer_email || ''}
                onChange={(e) => handleEditGiftCardChange('customer_email', e.target.value)}
                className="col-span-3"
                placeholder="cliente@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-purchase_date" className="text-right">
                F. Compra
              </Label>
              <Input
                id="edit-purchase_date"
                type="date"
                value={editGiftCard.purchase_date || ''}
                onChange={(e) => handleEditGiftCardChange('purchase_date', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-expiry_date" className="text-right">
                F. Vencimiento
              </Label>
              <Input
                id="edit-expiry_date"
                type="date"
                value={editGiftCard.expiry_date || ''}
                onChange={(e) => handleEditGiftCardChange('expiry_date', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label htmlFor="edit-is_redeemed" className="text-right">
                  Canjeada
                </Label>
              </div>
              <div className="flex items-center space-x-2 col-span-3">
                <Checkbox 
                  id="edit-is_redeemed" 
                  checked={isRedeemed}
                  onCheckedChange={(checked) => setIsRedeemed(checked === true)}
                />
                <label
                  htmlFor="edit-is_redeemed"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Marcar como canjeada
                </label>
              </div>
            </div>
            {isRedeemed && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-redeemed_date" className="text-right">
                  F. Canje
                </Label>
                <Input
                  id="edit-redeemed_date"
                  type="date"
                  value={editGiftCard.redeemed_date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleEditGiftCardChange('redeemed_date', e.target.value)}
                  className="col-span-3"
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="edit-notes" className="text-right">
                Notas
              </Label>
              <textarea
                id="edit-notes"
                value={editGiftCard.notes || ''}
                onChange={(e) => handleEditGiftCardChange('notes', e.target.value)}
                className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Información adicional"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={updateGiftCardMutation.isPending}
            >
              {updateGiftCardMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog 
        open={isImportDialogOpen} 
        onOpenChange={(open) => handleDialogOpenChange(open, setIsImportDialogOpen, resetImportState)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Importar Gift Cards</DialogTitle>
            <DialogDescription>
              Importa gift cards desde un archivo Excel
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {importStatus === "idle" && (
              <>
                <div className="flex flex-col items-center justify-center gap-4 p-4 border-2 border-dashed rounded-md">
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                  <div className="flex flex-col items-center text-center">
                    <p className="text-sm text-muted-foreground">
                      Selecciona un archivo Excel para importar gift cards
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Formatos soportados: .xlsx, .xls
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Seleccionar Archivo
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    ¿No tienes una plantilla?
                  </p>
                  <Button
                    variant="link"
                    onClick={downloadExcelTemplate}
                    className="p-0 h-auto"
                  >
                    Descargar plantilla
                  </Button>
                </div>
              </>
            )}
            
            {importStatus === "processing" && (
              <div className="space-y-4">
                <div className="flex items-center justify-center p-4">
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Procesando archivo...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} className="w-full" />
                  </div>
                </div>
              </div>
            )}
            
            {importStatus === "success" && (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    Importación completada correctamente
                  </AlertDescription>
                </Alert>
                
                <div className="rounded-md border p-4">
                  <h4 className="text-sm font-medium mb-2">Resumen de importación</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-medium">{importResults.total}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Exitosos</p>
                      <p className="font-medium text-green-600">{importResults.successful}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fallidos</p>
                      <p className="font-medium text-red-600">{importResults.failed}</p>
                    </div>
                  </div>
                </div>
                
                {importErrors.length > 0 && (
                  <div className="rounded-md border border-red-200 p-4">
                    <h4 className="text-sm font-medium mb-2 text-red-600">Errores encontrados</h4>
                    <ul className="text-sm space-y-1 max-h-[200px] overflow-y-auto">
                      {importErrors.map((error, index) => (
                        <li key={index} className="text-red-600">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {importStatus === "error" && (
              <div className="space-y-4">
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-600">
                    Error al importar gift cards
                  </AlertDescription>
                </Alert>
                
                {importErrors.length > 0 && (
                  <div className="rounded-md border border-red-200 p-4">
                    <h4 className="text-sm font-medium mb-2 text-red-600">Errores encontrados</h4>
                    <ul className="text-sm space-y-1 max-h-[200px] overflow-y-auto">
                      {importErrors.map((error, index) => (
                        <li key={index} className="text-red-600">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-md">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetImportState();
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Intentar nuevamente
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                  />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {importStatus === "idle" && (
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Cancelar
              </Button>
            )}
            
            {(importStatus === "success" || importStatus === "error") && (
              <Button onClick={() => setIsImportDialogOpen(false)}>
                Cerrar
              </Button>
            )}
            
            {importStatus === "processing" && (
              <Button disabled>
                Procesando...
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
