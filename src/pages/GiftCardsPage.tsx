
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
  GiftIcon
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
    dialogsEnabled
  } = useGiftCardManagement();

  const [newGiftCard, setNewGiftCard] = useState<Partial<NewGiftCard>>({
    status: "active",
    purchase_date: new Date().toISOString().split('T')[0]
  });

  const [editGiftCard, setEditGiftCard] = useState<Partial<NewGiftCard>>({});
  const [branchFilter, setBranchFilter] = useState<string>("all");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Efecto para limpiar el estado después de cada operación
  useEffect(() => {
    return () => {
      // Limpiar el estado al desmontar el componente
      setSelectedGiftCard(null);
      setEditGiftCard({});
    };
  }, [setSelectedGiftCard]);

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
      // Usar la función exportReport del utility
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
      // Usar la función exportReport del utility
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

      const purchaseDate = new Date(newGiftCard.purchase_date || new Date());
      const expiryDate = new Date(purchaseDate);
      expiryDate.setDate(expiryDate.getDate() + 30);

      addGiftCardMutation.mutate({
        ...newGiftCard,
        status: newGiftCard.status || "active",
        purchase_date: newGiftCard.purchase_date || new Date().toISOString().split('T')[0],
        expiry_date: newGiftCard.expiry_date || expiryDate.toISOString().split('T')[0],
        created_by: "admin" // Se debería obtener del usuario logueado
      } as NewGiftCard);

      // Limpiar el formulario
      setNewGiftCard({
        status: "active",
        purchase_date: new Date().toISOString().split('T')[0]
      });
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

  // Filtros y renderizado
  const filteredGiftCards = giftCards.filter(card => {
    const matchesSearch = (card.code?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (card.customer_name && card.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         false);

    const matchesStatus = statusFilter === "all" || card.status === statusFilter;

    return matchesSearch && matchesStatus;
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
                created_by: "admin", // Se debería obtener del usuario logueado
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
            // Agregar cada gift card a la base de datos
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
                  <TableHead>F. Compra</TableHead>
                  <TableHead>F. Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGiftCards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">
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

      {/* Diálogos */}
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
        onOpenChange={(open) => handleDialogOpenChange(open, setIsAddDialogOpen)}
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
                  <p className="text-sm font-medium mb-1">Cliente:</p>
                  <p className="text-lg">{selectedGiftCard.customer_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Email:</p>
                  <p className="text-lg">{selectedGiftCard.customer_email || '-'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Estado:</p>
                  <div className="text-lg">{renderStatusBadge(selectedGiftCard.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Creada por:</p>
                  <p className="text-lg">{selectedGiftCard.created_by}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Fecha de compra:</p>
                  <p className="text-lg">{selectedGiftCard.purchase_date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Fecha de vencimiento:</p>
                  <p className="text-lg">{selectedGiftCard.expiry_date}</p>
                </div>
              </div>
              
              {selectedGiftCard.redeemed_date && (
                <div>
                  <p className="text-sm font-medium mb-1">Fecha de canje:</p>
                  <p className="text-lg">{selectedGiftCard.redeemed_date}</p>
                </div>
              )}
              
              {selectedGiftCard.notes && (
                <div>
                  <p className="text-sm font-medium mb-1">Notas:</p>
                  <p className="text-lg">{selectedGiftCard.notes}</p>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => handleDialogOpenChange(open, setIsEditDialogOpen, () => {
          setSelectedGiftCard(null);
          setEditGiftCard({});
        })}
      >
        <DialogContent className="sm:max-w-[550px] bg-white">
          <DialogHeader>
            <DialogTitle>Editar Gift Card</DialogTitle>
            <DialogDescription>
              Modifique la información de la gift card seleccionada.
            </DialogDescription>
          </DialogHeader>
          {selectedGiftCard && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editGiftCardCode">Código Gift Card</Label>
                  <Input
                    id="editGiftCardCode"
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
                <Label htmlFor="editStatus">Estado</Label>
                <Select
                  value={editGiftCard.status}
                  onValueChange={(value) => handleEditGiftCardChange("status", value)}
                >
                  <SelectTrigger id="editStatus">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Pendiente</SelectItem>
                    <SelectItem value="redeemed">Canjeada</SelectItem>
                    <SelectItem value="expired">Vencida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editGiftCard.status === "redeemed" && (
                <div className="space-y-2">
                  <Label htmlFor="editRedeemedDate">Fecha de Canje</Label>
                  <Input
                    id="editRedeemedDate"
                    type="date"
                    value={editGiftCard.redeemed_date || ""}
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
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-salon-400 hover:bg-salon-500"
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
                <p><span className="font-medium">Fecha actual:</span> {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmRedeemDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-salon-400 hover:bg-salon-500"
              onClick={handleConfirmRedeem}
              disabled={!dialogsEnabled}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog 
        open={isImportDialogOpen} 
        onOpenChange={(open) => handleDialogOpenChange(open, setIsImportDialogOpen, () => {
          if (importStatus !== "processing") {
            resetImportState();
          }
        })}
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
                <div className="space-y-2">
                  <Label htmlFor="importFile">Archivo Excel</Label>
                  <Input
                    id="importFile"
                    type="file"
                    accept=".xlsx, .xls"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={downloadExcelTemplate}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar plantilla
                  </Button>
                </div>
              </>
            )}
            
            {importStatus === "processing" && (
              <div className="space-y-4">
                <p className="text-center">Procesando archivo...</p>
                <Progress value={importProgress} className="w-full" />
              </div>
            )}
            
            {importStatus === "success" && (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-300">
                  <BadgeCheck className="h-4 w-4 text-green-700" />
                  <AlertDescription className="text-green-700">
                    Se importaron <strong>{importResults.successful}</strong> gift cards correctamente.
                  </AlertDescription>
                </Alert>
                
                <div className="p-4 border rounded-md">
                  <h4 className="text-sm font-medium mb-2">Resumen de importación</h4>
                  <p>Total: {importResults.total}</p>
                  <p>Importadas: {importResults.successful}</p>
                  <p>Errores: {importResults.failed}</p>
                </div>
              </div>
            )}
            
            {importStatus === "error" && (
              <div className="space-y-4">
                <Alert className="bg-red-50 border-red-300">
                  <BadgeAlert className="h-4 w-4 text-red-700" />
                  <AlertDescription className="text-red-700">
                    Ocurrieron errores durante la importación.
                  </AlertDescription>
                </Alert>
                
                {importErrors.length > 0 && (
                  <div className="p-4 border rounded-md max-h-48 overflow-y-auto">
                    <h4 className="text-sm font-medium mb-2">Errores encontrados:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {importErrors.map((error, index) => (
                        <li key={index} className="text-sm text-red-600">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            {importStatus === "idle" ? (
              <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Cancelar
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => {
                  if (importStatus === "processing") {
                    return;
                  }
                  if (importStatus === "success") {
                    setIsImportDialogOpen(false);
                    resetImportState();
                  } else {
                    resetImportState();
                  }
                }}
                disabled={importStatus === "processing" || !dialogsEnabled}
              >
                {importStatus === "success" ? "Cerrar" : "Volver"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
