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

  const [newGiftCard, setNewGiftCard] = useState<Partial<NewGiftCard>>({
    status: "active",
    purchase_date: new Date().toISOString().split('T')[0]
  });

  const [editGiftCard, setEditGiftCard] = useState<Partial<NewGiftCard>>({});
  const [isRedeemed, setIsRedeemed] = useState<boolean>(false);
  const [newCardIsRedeemed, setNewCardIsRedeemed] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      setSelectedGiftCard(null);
      setEditGiftCard({});
      setIsRedeemed(false);
    };
  }, [setSelectedGiftCard]);

  useEffect(() => {
    if (newGiftCard.purchase_date) {
      const expiryDate = updateExpiryDate(newGiftCard.purchase_date);
      setNewGiftCard(prev => ({
        ...prev,
        expiry_date: expiryDate
      }));
    }
  }, [newGiftCard.purchase_date, updateExpiryDate]);

  useEffect(() => {
    if (editGiftCard.purchase_date && !editGiftCard.expiry_date) {
      const expiryDate = updateExpiryDate(editGiftCard.purchase_date);
      setEditGiftCard(prev => ({
        ...prev,
        expiry_date: expiryDate
      }));
    }
    
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
    
    setIsRedeemed(!!editGiftCard.redeemed_date || editGiftCard.status === "redeemed");
  }, [editGiftCard.purchase_date, editGiftCard.expiry_date, editGiftCard.redeemed_date, updateExpiryDate, updateStatusFromDates]);

  useEffect(() => {
    if (isRedeemed && !editGiftCard.redeemed_date) {
      setEditGiftCard(prev => ({
        ...prev,
        redeemed_date: new Date().toISOString().split('T')[0],
        status: "redeemed"
      }));
    } else if (!isRedeemed && editGiftCard.redeemed_date) {
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

  const handleNewGiftCardChange = (field: keyof GiftCard, value: any) => {
    setNewGiftCard(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditGiftCardChange = (field: keyof GiftCard, value: any) => {
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

      const expiryDate = newGiftCard.expiry_date || updateExpiryDate(newGiftCard.purchase_date || new Date().toISOString().split('T')[0]);

      const status = updateStatusFromDates(
        newGiftCard.purchase_date || new Date().toISOString().split('T')[0],
        expiryDate,
        newGiftCard.redeemed_date
      );

      addGiftCardMutation.mutate({
        ...newGiftCard,
        status,
        purchase_date: newGiftCard.purchase_date || new Date().toISOString().split('T')[0],
        expiry_date: expiryDate,
        created_by: "admin"
      });

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

  const handleViewDetails = (card: GiftCard) => {
    safeAction(() => {
      try {
        setSelectedGiftCard(card);
        setIsViewDetailsDialogOpen(true);
      } catch (error) {
        console.error("Error al ver detalles:", error);
        toast.error("No se pudieron cargar los detalles. Intente nuevamente.");
      }
    });
  };

  const handleEdit = (card: GiftCard) => {
    safeAction(() => {
      try {
        setSelectedGiftCard(card);
        setEditGiftCard(card);
        setIsRedeemed(card.status === "redeemed" || !!card.redeemed_date);
        setIsEditDialogOpen(true);
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

  const handleDelete = (card: GiftCard) => {
    safeAction(() => {
      try {
        setSelectedGiftCard(card);
        setIsDeleteDialogOpen(true);
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

  const handleMarkAsRedeemed = (card: GiftCard) => {
    safeAction(() => {
      try {
        setSelectedGiftCard(card);
        setIsConfirmRedeemDialogOpen(true);
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

  useEffect(() => {
    if (isEditDialogOpen && selectedGiftCard) {
      setIsRedeemed(selectedGiftCard.status === "redeemed" || !!selectedGiftCard.redeemed_date);
    }
  }, [isEditDialogOpen, selectedGiftCard]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <Dialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => handleDialogOpenChange(open, setIsDeleteDialogOpen, () => setSelectedGiftCard(null))}
      >
        <DialogContent className="sm:max-w-[450px] bg-white">
          <DialogHeader>
            <DialogTitle>Eliminar Gift Card</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar esta gift card? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {selectedGiftCard && (
            <div className="py-4">
              <div className="p-4 border rounded-md mb-4">
                <p><span className="font-medium">Código:</span> {selectedGiftCard.code}</p>
                <p><span className="font-medium">Monto:</span> ${selectedGiftCard.amount.toLocaleString()}</p>
                <p><span className="font-medium">Cliente:</span> {selectedGiftCard.customer_name || '-'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={!dialogsEnabled}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          handleDialogOpenChange(open, setIsAddDialogOpen);
          if (!open) {
            setNewGiftCard({
              status: "active",
              purchase_date: new Date().toISOString().split('T')[0]
            });
            setNewCardIsRedeemed(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[550px] bg-white">
          <DialogHeader>
            <DialogTitle>Nueva Gift Card</DialogTitle>
            <DialogDescription>
              Complete la información para crear una nueva gift card.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="giftCardNumber">Código Gift Card</Label>
                <Input
                  id="giftCardNumber"
                  placeholder="GC-001"
                  value={newGiftCard.code || ""}
                  onChange={(e) => handleNewGiftCardChange("code", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="giftCardAmount">Monto</Label>
                <Input
                  id="giftCardAmount"
                  type="number"
                  placeholder="2000"
                  value={newGiftCard.amount || ""}
                  onChange={(e) => handleNewGiftCardChange("amount", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nombre Cliente</Label>
                <Input
                  id="customerName"
                  placeholder="Nombre del cliente"
                  value={newGiftCard.customer_name || ""}
                  onChange={(e) => handleNewGiftCardChange("customer_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email Cliente</Label>
                <Input
                  id="customerEmail"
                  placeholder="cliente@ejemplo.com"
                  value={newGiftCard.customer_email || ""}
                  onChange={(e) => handleNewGiftCardChange("customer_email", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Fecha de Compra</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={newGiftCard.purchase_date || ""}
                  onChange={(e) => handleNewGiftCardChange("purchase_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Fecha de Vencimiento</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={newGiftCard.expiry_date || ""}
                  onChange={(e) => handleNewGiftCardChange("expiry_date", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="branch">Sucursal</Label>
              <Select
                value={newGiftCard.branch || ""}
                onValueChange={(value) => handleNewGiftCardChange("branch", value)}
              >
                <SelectTrigger id="branch">
                  <SelectValue placeholder="Seleccionar sucursal" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {branchOptions.map((branch) => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="isRedeemedNew" 
                checked={newCardIsRedeemed}
                onCheckedChange={(checked) => setNewCardIsRedeemed(checked === true)}
              />
              <Label htmlFor="isRedeemedNew">Ya fue canjeada</Label>
            </div>
            {newCardIsRedeemed && (
              <div className="space-y-2">
                <Label htmlFor="redeemedDateNew">Fecha de Canje</Label>
                <Input
                  id="redeemedDateNew"
                  type="date"
                  value={newGiftCard.redeemed_date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleNewGiftCardChange("redeemed_date", e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                placeholder="Notas adicionales"
                value={newGiftCard.notes || ""}
                onChange={(e) => handleNewGiftCardChange("notes", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-salon-400 hover:bg-salon-500"
              onClick={handleCreateGiftCard}
              disabled={!dialogsEnabled}
            >
              Crear Gift Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isViewDetailsDialogOpen} 
        onOpenChange={(open) => handleDialogOpenChange(open, setIsViewDetailsDialogOpen, () => setSelectedGiftCard(null))}
      >
        <DialogContent className="sm:max-w-[550px] bg-white">
          <DialogHeader>
            <DialogTitle>Detalles de Gift Card</DialogTitle>
            <DialogDescription>
              Información completa de la gift card seleccionada.
            </DialogDescription>
          </DialogHeader>
          {selectedGiftCard && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Código:</p>
                  <p className="text-lg font-bold">{selectedGiftCard.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Monto:</p>
                  <p className="text-lg">${selectedGiftCard.amount.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Estado:</p>
                  <div className="mt-1">{renderStatusBadge(selectedGiftCard.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Sucursal:</p>
                  <p>{selectedGiftCard.branch || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Cliente:</p>
                  <p>{selectedGiftCard.customer_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Email:</p>
                  <p>{selectedGiftCard.customer_email || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Fecha de Compra:</p>
                  <p>{selectedGiftCard.purchase_date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Fecha de Vencimiento:</p>
                  <p>{selectedGiftCard.expiry_date}</p>
                </div>
              </div>
              {selectedGiftCard.redeemed_date && (
                <div>
                  <p className="text-sm font-medium mb-1">Fecha de Canje:</p>
                  <p>{selectedGiftCard.redeemed_date}</p>
                </div>
              )}
              {selectedGiftCard.notes && (
                <div>
                  <p className="text-sm font-medium mb-1">Notas:</p>
                  <p>{selectedGiftCard.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewDetailsDialogOpen(false)}
            >
              Cerrar
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setIsViewDetailsDialogOpen(false);
                handleEdit(selectedGiftCard!);
              }}
              disabled={!dialogsEnabled}
            >
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => handleDialogOpenChange(open, setIsEditDialogOpen, () => {
          setSelectedGiftCard(null);
          setEditGiftCard({});
          setIsRedeemed(false);
        })}
      >
        <DialogContent className="sm:max-w-[550px] bg-white">
          <DialogHeader>
            <DialogTitle>Editar Gift Card</DialogTitle>
            <DialogDescription>
              Modifique la información de la gift card seleccionada.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editGiftCardNumber">Código Gift Card</Label>
                <Input
                  id="editGiftCardNumber"
                  placeholder="GC-001"
                  value={editGiftCard.code || ""}
                  onChange={(e) => handleEditGiftCardChange("code", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editGiftCardAmount">Monto</Label>
                <Input
                  id="editGiftCardAmount"
                  type="number"
                  placeholder="2000"
                  value={editGiftCard.amount || ""}
                  onChange={(e) => handleEditGiftCardChange("amount", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editCustomerName">Nombre Cliente</Label>
                <Input
                  id="editCustomerName"
                  placeholder="Nombre del cliente"
                  value={editGiftCard.customer_name || ""}
                  onChange={(e) => handleEditGiftCardChange("customer_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editCustomerEmail">Email Cliente</Label>
                <Input
                  id="editCustomerEmail"
                  placeholder="cliente@ejemplo.com"
                  value={editGiftCard.customer_email || ""}
                  onChange={(e) => handleEditGiftCardChange("customer_email", e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editPurchaseDate">Fecha de Compra</Label>
                <Input
                  id="editPurchaseDate"
                  type="date"
                  value={editGiftCard.purchase_date || ""}
                  onChange={(e) => handleEditGiftCardChange("purchase_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editExpiryDate">Fecha de Vencimiento</Label>
                <Input
                  id="editExpiryDate"
                  type="date"
                  value={editGiftCard.expiry_date || ""}
                  onChange={(e) => handleEditGiftCardChange("expiry_date", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editBranch">Sucursal</Label>
              <Select
                value={editGiftCard.branch || ""}
                onValueChange={(value) => handleEditGiftCardChange("branch", value)}
              >
                <SelectTrigger id="editBranch">
                  <SelectValue placeholder="Seleccionar sucursal" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {branchOptions.map((branch) => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="isRedeemed" 
                checked={isRedeemed}
                onCheckedChange={(checked) => setIsRedeemed(checked === true)}
              />
              <Label htmlFor="isRedeemed">Ya fue canjeada</Label>
            </div>
            {isRedeemed && (
              <div className="space-y-2">
                <Label htmlFor="redeemedDate">Fecha de Canje</Label>
                <Input
                  id="redeemedDate"
                  type="date"
                  value={editGiftCard.redeemed_date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleEditGiftCardChange("redeemed_date", e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="editNotes">Notas</Label>
              <Input
                id="editNotes"
                placeholder="Notas adicionales"
                value={editGiftCard.notes || ""}
                onChange={(e) => handleEditGiftCardChange("notes", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={!dialogsEnabled}
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isConfirmRedeemDialogOpen} 
        onOpenChange={(open) => handleDialogOpenChange(open, setIsConfirmRedeemDialogOpen, () => setSelectedGiftCard(null))}
      >
        <DialogContent className="sm:max-w-[450px] bg-white">
          <DialogHeader>
            <DialogTitle>Marcar como Canjeada</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea marcar esta gift card como canjeada?
            </DialogDescription>
          </DialogHeader>
          {selectedGiftCard && (
            <div className="py-4">
              <div className="p-4 border rounded-md mb-4">
                <p><span className="font-medium">Código:</span> {selectedGiftCard.code}</p>
                <p><span className="font-medium">Monto:</span> ${selectedGiftCard.amount.toLocaleString()}</p>
                <p><span className="font-medium">Cliente:</span> {selectedGiftCard.customer_name || '-'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmRedeemDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmRedeem}
              disabled={!dialogsEnabled}
            >
              Confirmar Canje
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={isImportDialogOpen} 
        onOpenChange={(open) => {
          handleDialogOpenChange(open, setIsImportDialogOpen);
          if (!open) {
            resetImportState();
          }
        }}
      >
        <DialogContent className="sm:max-w-[550px] bg-white">
          <DialogHeader>
            <DialogTitle>Importar Gift Cards</DialogTitle>
            <DialogDescription>
              Importe gift cards desde un archivo Excel.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {importStatus === "idle" && (
              <>
                <div className="border-2 border-dashed rounded-md p-6 text-center">
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".xlsx, .xls"
                    className="hidden"
                    id="file-upload"
                  />
                  <Label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-lg font-medium">Cargar archivo Excel</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Haga clic para seleccionar un archivo o arrástrelo aquí
                    </p>
                  </Label>
                </div>
                <div>
                  <Button
                    variant="outline"
                    onClick={downloadExcelTemplate}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Plantilla
                  </Button>
                </div>
              </>
            )}

            {importStatus === "processing" && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="mb-2">Procesando archivo...</p>
                  <Progress value={importProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">{importProgress}% completado</p>
                </div>
              </div>
            )}

            {(importStatus === "success" || importStatus === "error") && (
              <div className="space-y-4">
                <Alert variant={importStatus === "success" ? "default" : "destructive"}>
                  <AlertDescription>
                    {importStatus === "success" 
                      ? `Se han importado ${importResults.successful} de ${importResults.total} gift cards correctamente.`
                      : `Error: No se pudieron importar algunas gift cards.`}
                  </AlertDescription>
                </Alert>
                
                {importResults.successful > 0 && (
                  <div className="p-3 bg-green-50 rounded-md">
                    <p className="flex items-center text-green-600">
                      <Check className="mr-2 h-4 w-4" />
                      {importResults.successful} gift cards importadas correctamente
                    </p>
                  </div>
                )}
                
                {importResults.failed > 0 && (
                  <div className="p-3 bg-red-50 rounded-md">
                    <p className="text-red-600 mb-2">{importResults.failed} gift cards con errores:</p>
                    <ul className="list-disc pl-5 text-sm">
                      {importErrors.slice(0, 5).map((error, i) => (
                        <li key={i} className="text-red-600">{error}</li>
                      ))}
                      {importErrors.length > 5 && (
                        <li className="text-red-600">... y {importErrors.length - 5} errores más</li>
                      )}
                    </ul>
                  </div>
                )}
                
                <div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetImportState();
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="w-full"
                  >
                    Intentar de Nuevo
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsImportDialogOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
