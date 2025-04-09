
import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import {
  Package,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  Download,
  FileText,
  FileSpreadsheet,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group";

// Definición de tipos para productos
type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  location: string;
};

// Opciones para los desplegables
const CATEGORY_OPTIONS = ["SEMI OPI", "SEMI NAILS", "SHINE", "TRADICIONAL", "VARIOS"];
const LOCATION_OPTIONS = ["Stock Casa", "Stock Local", "Stock en Uso"];

// Datos de ejemplo
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Esmalte OPI",
    category: "SEMI OPI",
    price: 3500,
    stock: 12,
    location: "Stock Local",
  },
  {
    id: "2",
    name: "Removedor de esmalte",
    category: "VARIOS",
    price: 1800,
    stock: 8,
    location: "Stock Casa",
  },
  {
    id: "3",
    name: "Lima de uñas profesional",
    category: "SHINE",
    price: 950,
    stock: 20,
    location: "Stock Local",
  },
  {
    id: "4",
    name: "Kit de acrílico",
    category: "TRADICIONAL",
    price: 8500,
    stock: 5,
    location: "Stock en Uso",
  },
  {
    id: "5",
    name: "Aceite para cutícula",
    category: "VARIOS",
    price: 1200,
    stock: 15,
    location: "Stock Casa",
  },
];

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({
    name: "",
    category: CATEGORY_OPTIONS[0],
    price: 0,
    stock: 0,
    location: LOCATION_OPTIONS[0],
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Estado para filtros
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 10000,
  });
  const [stockView, setStockView] = useState<string>("all");

  // Dashboard data
  const stockByLocation = useMemo(() => {
    const result: Record<string, { totalItems: number; totalValue: number }> = {};
    
    LOCATION_OPTIONS.forEach(location => {
      result[location] = { totalItems: 0, totalValue: 0 };
    });
    
    products.forEach(product => {
      if (result[product.location]) {
        result[product.location].totalItems += product.stock;
        result[product.location].totalValue += product.price * product.stock;
      }
    });
    
    return result;
  }, [products]);

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Filtro de búsqueda
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro de categorías
      const matchesCategory = 
        selectedCategories.length === 0 || 
        selectedCategories.includes(product.category);
      
      // Filtro de ubicaciones
      const matchesLocation = 
        selectedLocations.length === 0 || 
        selectedLocations.includes(product.location);
      
      // Filtro de rango de precios
      const matchesPrice = 
        product.price >= priceRange.min && 
        product.price <= priceRange.max;
      
      // Filtro de vista de stock
      let matchesStockView = true;
      if (stockView === "low") {
        matchesStockView = product.stock < 10;
      } else if (stockView === "out") {
        matchesStockView = product.stock === 0;
      }
      
      return matchesSearch && matchesCategory && matchesLocation && matchesPrice && matchesStockView;
    });
  }, [
    products, 
    searchTerm, 
    selectedCategories, 
    selectedLocations, 
    priceRange, 
    stockView
  ]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(cat => cat !== category) 
        : [...prev, category]
    );
  };

  const handleLocationToggle = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(loc => loc !== location) 
        : [...prev, location]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedLocations([]);
    setPriceRange({ min: 0, max: 10000 });
    setStockView("all");
  };

  // Crear producto
  const handleCreateProduct = () => {
    if (!newProduct.name || !newProduct.category) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    const product: Product = {
      id: Date.now().toString(),
      ...newProduct,
    };

    setProducts([...products, product]);
    setNewProduct({
      name: "",
      category: CATEGORY_OPTIONS[0],
      price: 0,
      stock: 0,
      location: LOCATION_OPTIONS[0],
    });
    setIsAddDialogOpen(false);
    toast.success("Producto creado exitosamente");
  };

  // Editar producto
  const handleUpdateProduct = () => {
    if (!editingProduct || !editingProduct.name || !editingProduct.category) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    setProducts(
      products.map((product) =>
        product.id === editingProduct.id ? editingProduct : product
      )
    );
    setEditingProduct(null);
    toast.success("Producto actualizado exitosamente");
  };

  // Eliminar producto
  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
    toast.success("Producto eliminado exitosamente");
  };

  // Export functions
  const handleExportPDF = () => {
    toast.success("Exportando a PDF...", {
      description: "El archivo se descargará en breve.",
    });
    console.log("Exporting to PDF...");
  };

  const handleExportExcel = () => {
    toast.success("Exportando a Excel...", {
      description: "El archivo se descargará en breve.",
    });
    console.log("Exporting to Excel...");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Stock</h2>
          <p className="text-muted-foreground">
            Gestiona el inventario de productos en todos los depósitos
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
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
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-salon-400 hover:bg-salon-500">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                <DialogDescription>
                  Ingresa los detalles del nuevo producto.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Producto</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      placeholder="Esmalte OPI"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select
                      value={newProduct.category}
                      onValueChange={(value) =>
                        setNewProduct({ ...newProduct, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          price: Number(e.target.value),
                        })
                      }
                      placeholder="3500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Cantidad en Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          stock: Number(e.target.value),
                        })
                      }
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Select
                    value={newProduct.location}
                    onValueChange={(value) =>
                      setNewProduct({ ...newProduct, location: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una ubicación" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATION_OPTIONS.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateProduct}>Agregar Producto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Dashboard por ubicación */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(stockByLocation).map(([location, data]) => (
          <Card key={location}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">{location}</CardTitle>
              <CardDescription>Resumen de inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">{data.totalItems}</p>
                  <p className="text-sm text-muted-foreground">Items en stock</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">${data.totalValue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Valor total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventario de Productos</CardTitle>
          <CardDescription>
            Administra todos los productos disponibles en el inventario.
          </CardDescription>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <ToggleGroup type="single" value={stockView} onValueChange={(val) => val && setStockView(val)}>
                <ToggleGroupItem value="all">Todos</ToggleGroupItem>
                <ToggleGroupItem value="low">Stock bajo</ToggleGroupItem>
                <ToggleGroupItem value="out">Sin stock</ToggleGroupItem>
              </ToggleGroup>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                    {(selectedCategories.length > 0 || selectedLocations.length > 0) && (
                      <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
                        {selectedCategories.length + selectedLocations.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Categorías</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {CATEGORY_OPTIONS.map((category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`category-${category}`} 
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => handleCategoryToggle(category)} 
                            />
                            <label
                              htmlFor={`category-${category}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Ubicaciones</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {LOCATION_OPTIONS.map((location) => (
                          <div key={location} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`location-${location}`} 
                              checked={selectedLocations.includes(location)}
                              onCheckedChange={() => handleLocationToggle(location)} 
                            />
                            <label
                              htmlFor={`location-${location}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {location}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Rango de Precio</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="min-price" className="text-xs">Mínimo</Label>
                          <Input
                            id="min-price"
                            type="number"
                            placeholder="0"
                            value={priceRange.min}
                            onChange={(e) =>
                              setPriceRange({ ...priceRange, min: Number(e.target.value) })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="max-price" className="text-xs">Máximo</Label>
                          <Input
                            id="max-price"
                            type="number"
                            placeholder="10000"
                            value={priceRange.max}
                            onChange={(e) =>
                              setPriceRange({ ...priceRange, max: Number(e.target.value) })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={clearAllFilters}>
                      Limpiar filtros
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`${
                          product.stock === 0 
                            ? 'text-red-500' 
                            : product.stock < 10 
                              ? 'text-amber-500' 
                              : ''
                        }`}>
                          {product.stock}
                        </span>
                      </TableCell>
                      <TableCell>{product.location}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setEditingProduct(product)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Eliminar</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">No hay productos</p>
                        <p className="text-muted-foreground mt-1">
                          No se encontraron productos que coincidan con tu búsqueda.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog
        open={!!editingProduct}
        onOpenChange={(open) => !open && setEditingProduct(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Actualiza los detalles del producto.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre del Producto</Label>
                  <Input
                    id="edit-name"
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoría</Label>
                  <Select
                    value={editingProduct.category}
                    onValueChange={(value) =>
                      setEditingProduct({ ...editingProduct, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Precio</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Cantidad en Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Ubicación</Label>
                <Select
                  value={editingProduct.location}
                  onValueChange={(value) =>
                    setEditingProduct({ ...editingProduct, location: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_OPTIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateProduct}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
