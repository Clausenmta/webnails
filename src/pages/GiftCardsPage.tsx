
import { useState } from "react";
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
  Trash
} from "lucide-react";
import { BadgeInfo, BadgeCheck, BadgeAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Definición de tipos para las gift cards
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
  // Estado para la lista de gift cards
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
  
  // Estado para el nuevo gift card
  const [newGiftCard, setNewGiftCard] = useState<Partial<GiftCard>>({
    type: "Física",
    branch: "Fisherton",
    issueDate: new Date().toISOString().split('T')[0]
  });
  
  // Estado para el diálogo
  const [isNewGiftCardDialogOpen, setIsNewGiftCardDialogOpen] = useState(false);
  
  // Estado para el filtro de búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<GiftCardStatus | "">("");
  const [branchFilter, setBranchFilter] = useState<Branch | "">("");

  // Manejadores para el formulario de nuevo gift card
  const handleNewGiftCardChange = (field: keyof GiftCard, value: any) => {
    setNewGiftCard({
      ...newGiftCard,
      [field]: value
    });
  };

  // Crear nueva gift card
  const handleCreateGiftCard = () => {
    if (!newGiftCard.number || !newGiftCard.service) {
      alert("Por favor complete todos los campos requeridos.");
      return;
    }
    
    // Calcular fecha de vencimiento (30 días después de la emisión)
    const issueDate = new Date(newGiftCard.issueDate || new Date());
    const expirationDate = new Date(issueDate);
    expirationDate.setDate(expirationDate.getDate() + 30);
    
    // Determinar estado
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
  };

  // Filtrar gift cards
  const filteredGiftCards = giftCards.filter(card => {
    // Filtrar por término de búsqueda
    const matchesSearch = card.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         card.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por estado
    const matchesStatus = !statusFilter || card.status === statusFilter;
    
    // Filtrar por sucursal
    const matchesBranch = !branchFilter || card.branch === branchFilter;
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  // Función para renderizar el badge de estado
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
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
                        onValueChange={(value) => setStatusFilter(value as GiftCardStatus | "")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los estados" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todos los estados</SelectItem>
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
                        onValueChange={(value) => setBranchFilter(value as Branch | "")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las sucursales" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Todas las sucursales</SelectItem>
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
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              <span>Ver Detalles</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="mr-2 h-4 w-4" />
                              <span>Marcar como Canjeada</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
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
    </div>
  );
}
