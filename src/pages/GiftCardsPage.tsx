import { useState, useRef } from "react";
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
  DialogTrigger,
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
  Upload
} from "lucide-react";
import { BadgeInfo, BadgeCheck, BadgeAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import * as XLSX from 'xlsx';

type GiftCardStatus = "Pendiente" | "Canjeada" | "Vencida";
type GiftCardType = "Física" | "Virtual";
type Branch = "Fisherton" | "Alto Rosario" | "Moreno" | "Tucumán";

interface GiftCard {
  id: string;
  number: string;
  type: GiftCardType;
  service: string;
  branch: Branch;
  issueDate: string;
  receivedDate: string | null;
  expirationDate: string;
  status: GiftCardStatus;
}

export default function GiftCardsPage() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([
    {
      id: "1",
      number: "GC-001",
      type: "Física",
      service: "Manicura Completa",
      branch: "Fisherton",
      issueDate: "2025-03-15",
      receivedDate: null,
      expirationDate: "2025-04-14",
      status: "Pendiente"
    },
    {
      id: "2",
      number: "GC-002",
      type: "Virtual",
      service: "Corte y Peinado",
      branch: "Alto Rosario",
      issueDate: "2025-03-01",
      receivedDate: "2025-03-25",
      expirationDate: "2025-03-31",
      status: "Canjeada"
    },
    {
      id: "3",
      number: "GC-003",
      type: "Física",
      service: "Spa Facial",
      branch: "Moreno",
      issueDate: "2025-02-10",
      receivedDate: null,
      expirationDate: "2025-03-12",
      status: "Vencida"
    },
    {
      id: "4",
      number: "GC-004",
      type: "Física",
      service: "Depilación Completa",
      branch: "Tucumán",
      issueDate: "2025-03-20",
      receivedDate: null,
      expirationDate: "2025-04-19",
      status: "Pendiente"
    },
    {
      id: "5",
      number: "GC-005",
      type: "Virtual",
      service: "Tratamiento Capilar",
      branch: "Fisherton",
      issueDate: "2025-03-05",
      receivedDate: "2025-03-28",
      expirationDate: "2025-04-04",
      status: "Canjeada"
    }
  ]);

  const [newGiftCard, setNewGiftCard] = useState<Partial<GiftCard>>({
    type: "Física",
    branch: "Fisherton",
    issueDate: new Date().toISOString().split('T')[0]
  });

  // New state variables for dialog controls
  const [isNewGiftCardDialogOpen, setIsNewGiftCardDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isConfirmRedeemDialogOpen, setIsConfirmRedeemDialogOpen] = useState(false);
  const [selectedGiftCard, setSelectedGiftCard] = useState<GiftCard | null>(null);
  const [editGiftCard, setEditGiftCard] = useState<Partial<GiftCard>>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<GiftCardStatus | "all">("all");
  const [branchFilter, setBranchFilter] = useState<Branch | "all">("all");

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStatus, setImportStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [importResults, setImportResults] = useState<{ total: number; successful: number; failed: number }>({
    total: 0,
    successful: 0,
    failed: 0
  });
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewGiftCardChange = (field: keyof GiftCard, value: any) => {
    setNewGiftCard({
      ...newGiftCard,
      [field]: value
    });
  };

  const handleEditGiftCardChange = (field: keyof GiftCard, value: any) => {
    setEditGiftCard({
      ...editGiftCard,
      [field]: value
    });
  };

  const handleExportPDF = () => {
    toast.success({
      title: "Exportando a PDF...",
      description: "El archivo se descargará en breve."
    });
    console.log("Exporting to PDF...");
  };

  const handleExportExcel = () => {
    toast.success({
      title: "Exportando a Excel...",
      description: "El archivo se descargará en breve."
    });
    console.log("Exporting to Excel...");
  };

  const handleCreateGiftCard = () => {
    if (!newGiftCard.number || !newGiftCard.service) {
      toast.error({
        title: "Error",
        description: "Por favor complete todos los campos requeridos."
      });
      return;
    }

    const issueDate = new Date(newGiftCard.issueDate || new Date());
    const expirationDate = new Date(issueDate);
    expirationDate.setDate(expirationDate.getDate() + 30);

    let status: GiftCardStatus = "Pendiente";
    if (newGiftCard.receivedDate) {
      status = "Canjeada";
    } else if (new Date() > expirationDate) {
      status = "Vencida";
    }

    const newCard: GiftCard = {
      id: (giftCards.length + 1).toString(),
      number: newGiftCard.number || "",
      type: newGiftCard.type || "Física",
      service: newGiftCard.service || "",
      branch: newGiftCard.branch || "Fisherton",
      issueDate: newGiftCard.issueDate || new Date().toISOString().split('T')[0],
      receivedDate: newGiftCard.receivedDate || null,
      expirationDate: expirationDate.toISOString().split('T')[0],
      status: status
    };

    setGiftCards([...giftCards, newCard]);
    setIsNewGiftCardDialogOpen(false);
    setNewGiftCard({
      type: "Física",
      branch: "Fisherton",
      issueDate: new Date().toISOString().split('T')[0]
    });
    
    toast.success({
      title: "Gift Card creada",
      description: `La gift card ${newCard.number} ha sido creada exitosamente.`
    });
  };

  // Handle view details
  const handleViewDetails = (card: GiftCard) => {
    setSelectedGiftCard(card);
    setIsViewDetailsDialogOpen(true);
  };

  // Handle edit
  const handleEdit = (card: GiftCard) => {
    setSelectedGiftCard(card);
    setEditGiftCard({...card});
    setIsEditDialogOpen(true);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editGiftCard.number || !editGiftCard.service || !selectedGiftCard) {
      toast.error({
        title: "Error",
        description: "Por favor complete todos los campos requeridos."
      });
      return;
    }

    const updatedGiftCards = giftCards.map(card => {
      if (card.id === selectedGiftCard.id) {
        return {
          ...card,
          ...editGiftCard,
        } as GiftCard;
      }
      return card;
    });

    setGiftCards(updatedGiftCards);
    setIsEditDialogOpen(false);
    setSelectedGiftCard(null);
    
    toast.success({
      title: "Gift Card actualizada",
      description: `La gift card ${editGiftCard.number} ha sido actualizada exitosamente.`
    });
  };

  // Handle delete
  const handleDelete = (card: GiftCard) => {
    setSelectedGiftCard(card);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!selectedGiftCard) return;
    
    const updatedGiftCards = giftCards.filter(card => card.id !== selectedGiftCard.id);
    setGiftCards(updatedGiftCards);
    setIsDeleteDialogOpen(false);
    setSelectedGiftCard(null);
    
    toast.success({
      title: "Gift Card eliminada",
      description: `La gift card ${selectedGiftCard.number} ha sido eliminada exitosamente.`
    });
  };

  // Handle mark as redeemed
  const handleMarkAsRedeemed = (card: GiftCard) => {
    setSelectedGiftCard(card);
    setIsConfirmRedeemDialogOpen(true);
  };

  // Confirm mark as redeemed
  const handleConfirmRedeem = () => {
    if (!selectedGiftCard) return;
    
    const updatedGiftCards = giftCards.map(card => {
      if (card.id === selectedGiftCard.id) {
        return {
          ...card,
          status: "Canjeada",
          receivedDate: new Date().toISOString().split('T')[0]
        };
      }
      return card;
    });

    setGiftCards(updatedGiftCards);
    setIsConfirmRedeemDialogOpen(false);
    setSelectedGiftCard(null);
    
    toast.success({
      title: "Gift Card canjeada",
      description: `La gift card ${selectedGiftCard.number} ha sido marcada como canjeada.`
    });
  };

  const filteredGiftCards = giftCards.filter(card => {
    const matchesSearch = card.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         card.service.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || card.status === statusFilter;

    const matchesBranch = branchFilter === "all" || card.branch === branchFilter;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  const renderStatusBadge = (status: GiftCardStatus) => {
    switch (status) {
      case "Pendiente":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            <BadgeInfo className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "Canjeada":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            <BadgeCheck className="w-3 h-3 mr-1" />
            Canjeada
          </Badge>
        );
      case "Vencida":
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
    
    if (!data.number) errors.push(`Falta el número de gift card en la fila ${data.__rowNum__ + 1}`);
    if (!data.service) errors.push(`Falta el servicio en la fila ${data.__rowNum__ + 1}`);
    if (!data.type) errors.push(`Falta el tipo en la fila ${data.__rowNum__ + 1}`);
    if (!data.branch) errors.push(`Falta la sucursal en la fila ${data.__rowNum__ + 1}`);
    if (!data.issueDate) errors.push(`Falta la fecha de emisión en la fila ${data.__rowNum__ + 1}`);
    
    if (data.type && !["Física", "Virtual"].includes(data.type)) {
      errors.push(`Tipo inválido "${data.type}" en la fila ${data.__rowNum__ + 1}. Debe ser "Física" o "Virtual"`);
    }
    
    if (data.branch && !["Fisherton", "Alto Rosario", "Moreno", "Tucumán"].includes(data.branch)) {
      errors.push(`Sucursal inválida "${data.branch}" en la fila ${data.__rowNum__ + 1}`);
    }
    
    try {
      if (data.issueDate) new Date(data.issueDate);
      if (data.expirationDate) new Date(data.expirationDate);
      if (data.receivedDate) new Date(data.receivedDate);
    } catch (e) {
      errors.push(`Formato de fecha inválido en la fila ${data.__rowNum__ + 1}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const processExcelFile = (file: File) => {
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
        
        const newGiftCards: GiftCard[] = [];
        const errors: string[] = [];
        
        jsonData.forEach((row, index) => {
          setImportProgress(50 + Math.floor((index / jsonData.length) * 40));
          
          const { isValid, errors: rowErrors } = validateGiftCardData(row);
          
          if (isValid) {
            const issueDate = new Date(row.issueDate);
            const expirationDate = new Date(issueDate);
            expirationDate.setDate(expirationDate.getDate() + 30);
            
            let status: GiftCardStatus = "Pendiente";
            if (row.receivedDate) {
              status = "Canjeada";
            } else if (row.expirationDate && new Date() > new Date(row.expirationDate)) {
              status = "Vencida";
            }
            
            const newGiftCard: GiftCard = {
              id: (giftCards.length + newGiftCards.length + 1).toString(),
              number: row.number,
              type: row.type as GiftCardType,
              service: row.service,
              branch: row.branch as Branch,
              issueDate: row.issueDate,
              receivedDate: row.receivedDate || null,
              expirationDate: row.expirationDate || expirationDate.toISOString().split('T')[0],
              status
            };
            
            newGiftCards.push(newGiftCard);
          } else {
            errors.push(...rowErrors);
          }
        });
        
        setImportProgress(95);
        
        if (newGiftCards.length > 0) {
          setGiftCards([...giftCards, ...newGiftCards]);
        }
        
        setImportResults({
          total: jsonData.length,
          successful: newGiftCards.length,
          failed: jsonData.length - newGiftCards.length
        });
        
        setImportErrors(errors);
        setImportStatus(errors.length > 0 ? "error" : "success");
        setImportProgress(100);
        
        if (newGiftCards.length > 0) {
          toast.success({
            title: "Importación completada",
            description: `Se importaron ${newGiftCards.length} gift cards correctamente`
          });
        } else {
          toast.error({
            title: "Error en la importación",
            description: "No se pudo importar ninguna gift card. Revise los errores."
          });
        }
      } catch (error) {
        console.error("Error al procesar el archivo Excel:", error);
        setImportStatus("error");
        setImportErrors(["Error al procesar el archivo Excel. Verifique el formato."]);
        
        toast.error({
          title: "Error en la importación",
          description: "No se pudo procesar el archivo Excel. Verifique el formato."
        });
      }
    };
    
    reader.onerror = () => {
      setImportStatus("error");
      setImportErrors(["Error al leer el archivo"]);
      
      toast.error({
        title: "Error en la importación",
        description: "No se pudo leer el archivo."
      });
    };
    
    reader.readAsArrayBuffer(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processExcelFile(file);
    }
  };

  const downloadExcelTemplate = () => {
    const workbook = XLSX.utils.book_new();
    
    const headers = [
      "number", "type", "service", "branch", "issueDate", "receivedDate", "expirationDate"
    ];
    
    const sampleData = [
      {
        number: "GC-SAMPLE-001",
        type: "Física",
        service: "Manicura Completa",
        branch: "Fisherton",
        issueDate: "2025-04-10",
        receivedDate: "",
        expirationDate: "2025-05-10"
      },
      {
        number: "GC-SAMPLE-002",
        type: "Virtual",
        service: "Corte y Peinado",
        branch: "Alto Rosario",
        issueDate: "2025-04-10",
        receivedDate: "2025-04-15",
        expirationDate: "2025-05-10"
      }
    ];
    
    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Gift Cards");
    
    XLSX.writeFile(workbook, "plantilla_gift_cards.xlsx");
    
    toast({
      title: "Plantilla descargada",
      description: "La plantilla de Excel para importar gift cards ha sido descargada"
    });
  };

  const resetImportState = () => {
    setImportStatus("idle");
    setImportProgress(0);
    setImportErrors([]);
    setImportResults({ total: 0, successful: 0, failed: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
            onClick={() => setIsNewGiftCardDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva Gift Card
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
            onClick={() => setIsImportDialogOpen(true)}
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
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filtros</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <div className="space-y-2 mb-2">
                      <Label>Estado</Label>
                      <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as GiftCardStatus | "all")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los estados</SelectItem>
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="Canjeada">Canjeada</SelectItem>
                          <SelectItem value="Vencida">Vencida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Sucursal</Label>
                      <Select
                        value={branchFilter}
                        onValueChange={(value) => setBranchFilter(value as Branch | "all")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las sucursales" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las sucursales</SelectItem>
                          <SelectItem value="Fisherton">Fisherton</SelectItem>
                          <SelectItem value="Alto Rosario">Alto Rosario</SelectItem>
                          <SelectItem value="Moreno">Moreno</SelectItem>
                          <SelectItem value="Tucumán">Tucumán</SelectItem>
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
                  <TableHead>Nro Gift Card</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Servicio</TableHead>
                  <TableHead>Sucursal</TableHead>
                  <TableHead>F. Emisión</TableHead>
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
                        <CreditCard className="h-8 w-8 mb-2" />
                        <p>No se encontraron gift cards</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGiftCards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell className="font-medium">{card.number}</TableCell>
                      <TableCell>{card.type}</TableCell>
                      <TableCell>{card.service}</TableCell>
                      <TableCell>{card.branch}</TableCell>
                      <TableCell>{new Date(card.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(card.expirationDate).toLocaleDateString()}</TableCell>
                      <TableCell>{renderStatusBadge(card.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(card)}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Ver Detalles</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(card)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            {card.status !== "Canjeada" && (
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

      {/* New Gift Card Dialog */}
      <Dialog open={isNewGiftCardDialogOpen} onOpenChange={setIsNewGiftCardDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Nueva Gift Card</DialogTitle>
            <DialogDescription>
              Complete la información para crear una nueva gift card.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="giftCardNumber">Nro. Gift Card</Label>
                <Input
                  id="giftCardNumber"
                  placeholder="GC-001"
                  value={newGiftCard.number || ""}
                  onChange={(e) => handleNewGiftCardChange("number", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="giftCardType">Tipo</Label>
                <Select
                  value={newGiftCard.type}
                  onValueChange={(value) => handleNewGiftCardChange("type", value as GiftCardType)}
                >
                  <SelectTrigger id="giftCardType">
                    <SelectValue placeholder="Seleccione un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Física">Física</SelectItem>
                    <SelectItem value="Virtual">Virtual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="giftCardService">Servicio</Label>
              <Input
                id="giftCardService"
                placeholder="Manicura completa"
                value={newGiftCard.service || ""}
                onChange={(e) => handleNewGiftCardChange("service", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="giftCardBranch">Sucursal</Label>
                <Select
                  value={newGiftCard.branch}
                  onValueChange={(value) => handleNewGiftCardChange("branch", value as Branch)}
                >
                  <SelectTrigger id="giftCardBranch">
                    <SelectValue placeholder="Seleccione una sucursal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fisherton">Fisherton</SelectItem>
                    <SelectItem value="Alto Rosario">Alto Rosario</SelectItem>
                    <SelectItem value="Moreno">Moreno</SelectItem>
                    <SelectItem value="Tucumán">Tucumán</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="giftCardIssueDate">Fecha de Emisión</Label>
                <Input
                  id="giftCardIssueDate"
                  type="date"
                  value={newGiftCard.issueDate || ""}
                  onChange={(e) => handleNewGiftCardChange("issueDate", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasBeenReceived" 
                  checked={!!newGiftCard.receivedDate}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleNewGiftCardChange("receivedDate", new Date().toISOString().split('T')[0]);
                    } else {
                      handleNewGiftCardChange("receivedDate", null);
                    }
                  }}
                />
                <label
                  htmlFor="hasBeenReceived"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Ya ha sido canjeada
                </label>
              </div>
            </div>
            {newGiftCard.receivedDate && (
              <div className="space-y-2">
                <Label htmlFor="giftCardReceivedDate">Fecha de Recepción</Label>
                <Input
                  id="giftCardReceivedDate"
                  type="date"
                  value={newGiftCard.receivedDate || ""}
                  onChange={(e) => handleNewGiftCardChange("receivedDate", e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewGiftCardDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-salon-400 hover:bg-salon-500"
              onClick={handleCreateGiftCard}
            >
              Crear Gift Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsDialogOpen} onOpenChange={setIsViewDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Detalles de Gift Card</DialogTitle>
            <DialogDescription>
              Información completa de la gift card seleccionada.
            </DialogDescription>
          </DialogHeader>
          {selectedGiftCard && (
            <div className="grid gap-4 py-4">
