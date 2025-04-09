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

  // Efecto para limpiar el estado después de cada operación
  useEffect(() => {
    return () => {
      // Limpiar el estado al desmontar el componente
      setSelectedGiftCard(null);
      setEditGiftCard({});
    };
  }, []);

  const closeAllDialogs = () => {
    setIsNewGiftCardDialogOpen(false);
    setIsViewDetailsDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsConfirmRedeemDialogOpen(false);
    setIsImportDialogOpen(false);
    
    // Pequeño tiempo de espera antes de limpiar los estados
    setTimeout(() => {
      setSelectedGiftCard(null);
      setEditGiftCard({});
    }, 100);
  };

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
    try {
      toast.success({
        title: "Exportando a PDF...",
        description: "El archivo se descargará en breve."
      });
      console.log("Exporting to PDF...");
    } catch (error) {
      console.error("Error al exportar a PDF:", error);
      toast.error({
        title: "Error",
        description: "No se pudo exportar a PDF. Intente nuevamente."
      });
    }
  };

  const handleExportExcel = () => {
    try {
      toast.success({
        title: "Exportando a Excel...",
        description: "El archivo se descargará en breve."
      });
      console.log("Exporting to Excel...");
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      toast.error({
        title: "Error",
        description: "No se pudo exportar a Excel. Intente nuevamente."
      });
    }
  };

  const handleCreateGiftCard = () => {
    try {
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

      // Cerrar diálogo primero
      setIsNewGiftCardDialogOpen(false);
      
      // Pequeño retraso para asegurar que la interfaz responda
      setTimeout(() => {
        setGiftCards(prevCards => [...prevCards, newCard]);
        
        setNewGiftCard({
          type: "Física",
          branch: "Fisherton",
          issueDate: new Date().toISOString().split('T')[0]
        });
        
        toast.success({
          title: "Gift Card creada",
          description: `La gift card ${newCard.number} ha sido creada exitosamente.`
        });
      }, 100);
    } catch (error) {
      console.error("Error al crear gift card:", error);
      setIsNewGiftCardDialogOpen(false);
      
      setTimeout(() => {
        toast.error({
          title: "Error",
          description: "Ocurrió un error al crear la gift card. Intente nuevamente."
        });
      }, 100);
    }
  };

  const handleViewDetails = (card: GiftCard) => {
    try {
      setSelectedGiftCard(card);
      setIsViewDetailsDialogOpen(true);
    } catch (error) {
      console.error("Error al ver detalles:", error);
      toast.error({
        title: "Error",
        description: "No se pudieron cargar los detalles. Intente nuevamente."
      });
    }
  };

  const handleEdit = (card: GiftCard) => {
    try {
      setSelectedGiftCard(card);
      setEditGiftCard({...card});
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Error al editar:", error);
      toast.error({
        title: "Error",
        description: "No se pudo abrir el editor. Intente nuevamente."
      });
    }
  };

  const handleSaveEdit = () => {
    try {
      if (!editGiftCard.number || !editGiftCard.service || !selectedGiftCard) {
        toast.error({
          title: "Error",
          description: "Por favor complete todos los campos requeridos."
        });
        return;
      }

      // Cerrar primero el diálogo
      setIsEditDialogOpen(false);
      
      const cardId = selectedGiftCard.id;
      const updatedCardNumber = editGiftCard.number;
      
      // Limpiar referencias
      const currentSelectedGiftCard = {...selectedGiftCard};
      setSelectedGiftCard(null);

      // Pequeño retraso para asegurar que la interfaz responda
      setTimeout(() => {
        setGiftCards(prevCards => prevCards.map(card => {
          if (card.id === cardId) {
            return {
              ...card,
              ...editGiftCard,
              status: editGiftCard.status as GiftCardStatus || card.status
            } as GiftCard;
          }
          return card;
        }));
        
        toast.success({
          title: "Gift Card actualizada",
          description: `La gift card ${updatedCardNumber} ha sido actualizada exitosamente.`
        });
      }, 100);
    } catch (error) {
      console.error("Error al guardar edición:", error);
      setIsEditDialogOpen(false);
      setSelectedGiftCard(null);
      
      setTimeout(() => {
        toast.error({
          title: "Error",
          description: "Ocurrió un error al actualizar la gift card. Intente nuevamente."
        });
      }, 100);
    }
  };

  const handleDelete = (card: GiftCard) => {
    try {
      setSelectedGiftCard(card);
      setIsDeleteDialogOpen(true);
    } catch (error) {
      console.error("Error al preparar eliminación:", error);
      toast.error({
        title: "Error",
        description: "No se pudo preparar la eliminación. Intente nuevamente."
      });
    }
  };

  const handleConfirmDelete = () => {
    try {
      if (!selectedGiftCard) return;
      
      // Primero cerrar el diálogo y guardar los datos que necesitamos
      const cardToDelete = {...selectedGiftCard};
      setIsDeleteDialogOpen(false);
      
      // Limpiar la referencia al card seleccionado
      setSelectedGiftCard(null);
      
      // Pequeño retraso para asegurar que la interfaz responda
      setTimeout(() => {
        setGiftCards(prevCards => prevCards.filter(card => card.id !== cardToDelete.id));
        
        toast.success({
          title: "Gift Card eliminada",
          description: `La gift card ${cardToDelete.number} ha sido eliminada exitosamente.`
        });
      }, 100);
    } catch (error) {
      console.error("Error al eliminar gift card:", error);
      
      // Cerrar el diálogo y limpiar la selección en caso de error
      setIsDeleteDialogOpen(false);
      setSelectedGiftCard(null);
      
      setTimeout(() => {
        toast.error({
          title: "Error",
          description: "Ocurrió un error al eliminar la gift card. Intente nuevamente."
        });
      }, 100);
    }
  };

  const handleMarkAsRedeemed = (card: GiftCard) => {
    try {
      setSelectedGiftCard(card);
      setIsConfirmRedeemDialogOpen(true);
    } catch (error) {
      console.error("Error al preparar canje:", error);
      toast.error({
        title: "Error",
        description: "No se pudo preparar el canje. Intente nuevamente."
      });
    }
  };

  const handleConfirmRedeem = () => {
    try {
      if (!selectedGiftCard) return;
      
      // Primero cerrar el diálogo y guardar los datos que necesitamos
      const cardToRedeem = {...selectedGiftCard};
      setIsConfirmRedeemDialogOpen(false);
      
      // Limpiar la referencia al card seleccionado
      setSelectedGiftCard(null);
      
      // Pequeño retraso para asegurar que la interfaz responda
      setTimeout(() => {
        setGiftCards(prevCards => prevCards.map(card => {
          if (card.id === cardToRedeem.id) {
            return {
              ...card,
              status: "Canjeada" as GiftCardStatus,
              receivedDate: new Date().toISOString().split('T')[0]
            };
          }
          return card;
        }));
        
        toast.success({
          title: "Gift Card canjeada",
          description: `La gift card ${cardToRedeem.number} ha sido marcada como canjeada.`
        });
      }, 100);
    } catch (error) {
      console.error("Error al canjear gift card:", error);
      
      // Cerrar el diálogo y limpiar la selección en caso de error
      setIsConfirmRedeemDialogOpen(false);
      setSelectedGiftCard(null);
      
      setTimeout(() => {
        toast.error({
          title: "Error",
          description: "Ocurrió un error al canjear la gift card. Intente nuevamente."
        });
      }, 100);
    }
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
          
          setImportResults({
            total: jsonData.length,
            successful: newGiftCards.length,
            failed: jsonData.length - newGiftCards.length
          });
          
          setImportErrors(errors);
          
          if (newGiftCards.length > 0) {
            // Cerrar diálogo primero si es exitoso
            if (errors.length === 0) {
              setImportStatus("success");
              setImportProgress(100);
              
              // Pequeño retraso para la actualización
              setTimeout(() => {
                setGiftCards(prevCards => [...prevCards, ...newGiftCards]);
                
                toast.success({
                  title: "Importación completada",
                  description: `Se importaron ${newGiftCards.length} gift cards correctamente`
                });
              }, 100);
            } else {
              setImportStatus("error");
              setImportProgress(100);
              
              // Actualizar cards pero mostrar errores
              setTimeout(() => {
                setGiftCards(prevCards => [...prevCards, ...newGiftCards]);
                
                toast({
                  title: "Importación parcial",
                  description: `Se importaron ${newGiftCards.length} gift cards con ${errors.length} errores.`,
                  variant: "destructive"
                });
              }, 100);
            }
          } else {
            setImportStatus("error");
            setImportProgress(100);
            
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
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      setImportStatus("error");
      setImportProgress(0);
      setImportErrors(["Error inesperado al procesar el archivo"]);
      
      toast.error({
        title: "Error",
        description: "Error inesperado al procesar el archivo."
      });
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
      toast.error({
        title: "Error",
        description: "No se pudo seleccionar el archivo. Intente nuevamente."
      });
    }
  };

  const downloadExcelTemplate = () => {
    try {
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
    } catch (error) {
      console.error("Error al descargar plantilla:", error);
      toast.error({
        title: "Error",
        description: "No se pudo descargar la plantilla. Intente nuevamente."
      });
    }
  };

  const resetImportState = () => {
    try {
      setImportStatus("idle");
      setImportProgress(0);
      setImportErrors([]);
      setImportResults({ total: 0, successful: 0, failed: 0 });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error al resetear estado de importación:", error);
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

      <Dialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setTimeout(() => setSelectedGiftCard(null), 100);
          }
          setIsDeleteDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Eliminar Gift Card</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar esta gift card? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {selectedGiftCard && (
            <div className="py-4">
              <div className="p-4 border rounded-md mb-4">
                <p><span className="font-medium">Nro Gift Card:</span> {selectedGiftCard.number}</p>
                <p><span className="font-medium">Servicio:</span> {selectedGiftCard.service}</p>
                <p><span className="font-medium">Sucursal:</span> {selectedGiftCard.branch}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setTimeout(() => setSelectedGiftCard(null), 100);
              }}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog 
        open={isNewGiftCardDialogOpen} 
        onOpenChange={(open) => setIsNewGiftCardDialogOpen(open)}
      >
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
            <Button 
              variant="outline" 
              onClick={() => {
                setIsNewGiftCardDialogOpen(false);
                setTimeout(() => {
                  setNewGiftCard({
                    type: "Física",
                    branch: "Fisherton",
                    issueDate: new Date().toISOString().split('T')[0]
                  });
                }, 100);
              }}
            >
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

      <Dialog 
        open={isViewDetailsDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setTimeout(() => setSelectedGiftCard(null), 100);
          }
          setIsViewDetailsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
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
                  <p className="text-sm font-medium mb-1">Nro. Gift Card:</p>
                  <p className="text-lg font-bold">{selectedGiftCard.number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Tipo:</p>
                  <p className="text-lg">{selectedGiftCard.type}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Servicio:</p>
                <p className="text-lg">{selectedGiftCard.service}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Sucursal:</p>
                  <p className="text-lg">{selectedGiftCard.branch}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Estado:</p>
                  <div className="text-lg">{renderStatusBadge(selectedGiftCard.status)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Fecha de emisión:</p>
                  <p className="text-lg">{new Date(selectedGiftCard.issueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Fecha de vencimiento:</p>
                  <p className="text-lg">{new Date(selectedGiftCard.expirationDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              {selectedGiftCard.receivedDate && (
                <div>
                  <p className="text-sm font-medium mb-1">Fecha de recepción:</p>
                  <p className="text-lg">{new Date(selectedGiftCard.receivedDate).toLocaleDateString()}</p>
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
        onOpenChange={(open) => {
          if (!open) {
            setTimeout(() => {
              setSelectedGiftCard(null);
              setEditGiftCard({});
            }, 100);
          }
          setIsEditDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
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
                  <Label htmlFor="editGiftCardNumber">Nro. Gift Card</Label>
                  <Input
                    id="editGiftCardNumber"
                    placeholder="GC-001"
                    value={editGiftCard.number || ""}
                    onChange={(e) => handleEditGiftCardChange("number", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editGiftCardType">Tipo</Label>
                  <Select
                    value={editGiftCard.type}
                    onValueChange={(value) => handleEditGiftCardChange("type", value as GiftCardType)}
                  >
                    <SelectTrigger id="editGiftCardType">
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
                <Label htmlFor="editGiftCardService">Servicio</Label>
                <Input
                  id="editGiftCardService"
                  placeholder="Manicura completa"
                  value={editGiftCard.service || ""}
                  onChange={(e) => handleEditGiftCardChange("service", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editGiftCardBranch">Sucursal</Label>
                  <Select
                    value={editGiftCard.branch}
                    onValueChange={(value) => handleEditGiftCardChange("branch", value as Branch)}
                  >
                    <SelectTrigger id="editGiftCardBranch">
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
                  <Label htmlFor="editGiftCardIssueDate">Fecha de Emisión</Label>
                  <Input
                    id="editGiftCardIssueDate"
                    type="date"
                    value={editGiftCard.issueDate || ""}
                    onChange={(e) => handleEditGiftCardChange("issueDate", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="editHasBeenReceived" 
                    checked={!!editGiftCard.receivedDate}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleEditGiftCardChange("receivedDate", new Date().toISOString().split('T')[0]);
                        handleEditGiftCardChange("status", "Canjeada");
                      } else {
                        handleEditGiftCardChange("receivedDate", null);
                        handleEditGiftCardChange("status", "Pendiente");
                      }
                    }}
                  />
                  <label
                    htmlFor="editHasBeenReceived"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Ya ha sido canjeada
                  </label>
                </div>
              </div>
              {editGiftCard.receivedDate && (
                <div className="space-y-2">
                  <Label htmlFor="editGiftCardReceivedDate">Fecha de Recepción</Label>
                  <Input
                    id="editGiftCardReceivedDate"
                    type="date"
                    value={editGiftCard.receivedDate || ""}
                    onChange={(e) => handleEditGiftCardChange("receivedDate", e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="editGiftCardExpirationDate">Fecha de Vencimiento</Label>
                <Input
                  id="editGiftCardExpirationDate"
                  type="date"
                  value={editGiftCard.expirationDate || ""}
                  onChange={(e) => handleEditGiftCardChange("expirationDate", e.target.value)}
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
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog 
        open={isConfirmRedeemDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setTimeout(() => setSelectedGiftCard(null), 100);
          }
          setIsConfirmRedeemDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Marcar como Canjeada</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea marcar esta gift card como canjeada?
            </DialogDescription>
          </DialogHeader>
          {selectedGiftCard && (
            <div className="py-4">
              <div className="p-4 border rounded-md mb-4">
                <p><span className="font-medium">Nro Gift Card:</span> {selectedGiftCard.number}</p>
                <p><span className="font-medium">Servicio:</span> {selectedGiftCard.service}</p>
                <p><span className="font-medium">Sucursal:</span> {selectedGiftCard.branch}</p>
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
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog 
        open={isImportDialogOpen} 
        onOpenChange={(open) => {
          if (!open && importStatus !== "processing") {
            resetImportState();
          }
          setIsImportDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
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
