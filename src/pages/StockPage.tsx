
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Package, FileSpreadsheet, PlusCircle, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stockService } from "@/services/stock";
import type { StockItem, NewStockItem, PhysicalStockLocation } from "@/types/stock";
import { stockCategories, stockLocations } from "@/types/stock";
import { exportReport } from "@/utils/reportExport";
import StockFilters from "./stock/StockFilters";
import ProductTable from "./stock/ProductTable";
import StockLocations from "./stock/StockLocations";
import ProductDialog from "./stock/ProductDialog";
import StockUpdateDialog from "./stock/StockUpdateDialog";
import StockImportDialog from "./stock/StockImportDialog";

export default function StockPage() {
  const { isAuthorized, user } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  const queryClient = useQueryClient();
  
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isUpdateStockOpen, setIsUpdateStockOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StockItem | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const [newProduct, setNewProduct] = useState<Partial<NewStockItem>>({
    product_name: "",
    category: stockCategories[0],
    brand: "",
    supplier: "",
    quantity: 0,
    min_stock_level: 1,
    unit_price: 0,
    purchase_date: new Date().toLocaleDateString(),
    location: stockLocations[0]
  });

  const [stockUpdate, setStockUpdate] = useState({
    productId: 0,
    quantity: 0,
    operation: "add" as "add" | "remove"
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");

  const { data: stockItems = [], isLoading, error } = useQuery({
    queryKey: ['stock'],
    queryFn: stockService.fetchStock
  });

  const addProductMutation = useMutation({
    mutationFn: stockService.addStockItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      setIsAddProductOpen(false);
      resetNewProductForm();
    }
  });

  const updateStockMutation = useMutation({
    mutationFn: (data: { id: number, updates: Partial<NewStockItem> }) => 
      stockService.updateStockItem(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      setIsUpdateStockOpen(false);
      setStockUpdate({
        productId: 0,
        quantity: 0,
        operation: "add"
      });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: stockService.deleteStockItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    }
  });

  const editProductMutation = useMutation({
    mutationFn: (data: { id: number, updates: Partial<NewStockItem> }) => 
      stockService.updateStockItem(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      setIsEditProductOpen(false);
      setEditingProduct(null);
      toast.success("Producto actualizado correctamente");
    },
    onError: (error: any) => {
      console.error("Error al actualizar el producto:", error);
      toast.error(`Error al actualizar el producto: ${error.message}`);
    }
  });

  const physicalStockLocations: PhysicalStockLocation[] = [
    {
      id: 1,
      name: "Stock Casa",
      items: stockItems
        .filter(item => item.location === "Stock Casa")
        .map(item => ({
          productId: item.id,
          productName: item.product_name,
          category: item.category,
          brand: item.brand,
          quantity: item.quantity,
          unit_price: item.unit_price,
          min_stock_level: item.min_stock_level
        }))
    },
    {
      id: 2,
      name: "Stock Local",
      items: stockItems
        .filter(item => item.location === "Stock Local")
        .map(item => ({
          productId: item.id,
          productName: item.product_name,
          category: item.category,
          brand: item.brand,
          quantity: item.quantity,
          unit_price: item.unit_price,
          min_stock_level: item.min_stock_level
        }))
    },
    {
      id: 3,
      name: "Stock en Uso",
      items: stockItems
        .filter(item => item.location === "Stock en Uso")
        .map(item => ({
          productId: item.id,
          productName: item.product_name,
          category: item.category,
          brand: item.brand,
          quantity: item.quantity,
          unit_price: item.unit_price,
          min_stock_level: item.min_stock_level
        }))
    }
  ];

  const handleExportExcel = () => {
    const exportData = stockItems.map(item => ({
      Código: item.id,
      Producto: item.product_name,
      Categoría: item.category,
      Stock: item.quantity,
      Mínimo: item.min_stock_level || 3,
      Ubicación: item.location,
      Marca: item.brand || 'N/A',
      Proveedor: item.supplier || 'N/A',
      Precio: item.unit_price
    }));

    exportReport(exportData, {
      filename: 'inventario',
      format: 'excel'
    });
  };

  const templateData = [
    {
      product_name: "Producto Ejemplo",
      category: stockCategories[0],
      brand: "Marca",
      supplier: "Proveedor",
      quantity: 10,
      min_stock_level: 5,
      unit_price: 1000,
      location: stockLocations[0]
    }
  ];

  const validateStockImport = (row: any) => {
    if (!row.product_name) {
      return { isValid: false, error: "El nombre del producto es requerido" };
    }
    
    if (typeof row.quantity !== 'number' || row.quantity < 0) {
      return { isValid: false, error: "La cantidad debe ser un número mayor o igual a 0" };
    }

    if (row.category && !stockCategories.includes(row.category)) {
      return { isValid: false, error: "La categoría no es válida" };
    }

    if (row.unit_price !== undefined && (typeof row.unit_price !== 'number' || row.unit_price < 0)) {
      return { isValid: false, error: "El precio debe ser un número mayor o igual a 0" };
    }

    return { isValid: true };
  };

  const handleImportStock = async (data: any[]) => {
    try {
      const currentUserEmail = user?.username || 'unknown';
      
      for (const item of data) {
        const stockItem: NewStockItem = {
          product_name: item.product_name,
          category: item.category || stockCategories[0],
          brand: item.brand || '',
          supplier: item.supplier || '',
          quantity: item.quantity !== undefined ? item.quantity : 0,
          min_stock_level: item.min_stock_level || 1,
          unit_price: item.unit_price !== undefined ? item.unit_price : 0,
          purchase_date: item.purchase_date || new Date().toLocaleDateString(),
          location: item.location || stockLocations[0],
          created_by: currentUserEmail
        };

        const validationResult = validateStockImport(stockItem);
        if (!validationResult.isValid) {
          toast.error(validationResult.error);
          return;
        }

        await addProductMutation.mutateAsync(stockItem);
      }
      toast.success(`${data.length} productos importados correctamente`);
    } catch (error) {
      console.error('Error importing stock:', error);
      toast.error('Error al importar productos');
    }
  };

  const filteredStockItems = stockItems.filter(product => {
    const matchesSearch = 
      searchTerm.length === 0 ||
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.supplier || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = 
      !categoryFilter || product.category === categoryFilter;
    const matchesLocation = 
      !locationFilter || (product.location || "") === locationFilter;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  useEffect(() => {
    if (error) {
      toast.error(`Error al cargar inventario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }, [error]);

  const resetNewProductForm = () => {
    setNewProduct({
      product_name: "",
      category: stockCategories[0],
      brand: "",
      supplier: "",
      quantity: 0,
      min_stock_level: 1,
      unit_price: 0,
      purchase_date: new Date().toLocaleDateString(),
      location: stockLocations[0]
    });
  };

  const handleAddProduct = () => {
    if (!newProduct.product_name) {
      toast.error("El nombre del producto es requerido");
      return;
    }

    const stockItem: NewStockItem = {
      product_name: newProduct.product_name,
      category: newProduct.category || stockCategories[0],
      brand: newProduct.brand || '',
      supplier: newProduct.supplier || '',
      quantity: newProduct.quantity || 0,
      min_stock_level: newProduct.min_stock_level || 1,
      unit_price: newProduct.unit_price || 0,
      purchase_date: newProduct.purchase_date || new Date().toLocaleDateString(),
      location: newProduct.location || stockLocations[0],
      created_by: user?.username || 'unknown'
    };
    
    addProductMutation.mutate(stockItem);
  };

  const handleUpdateStock = () => {
    if (!stockUpdate.productId || stockUpdate.quantity <= 0) {
      toast.error("Seleccione un producto y una cantidad válida");
      return;
    }

    const selectedProduct = stockItems.find(item => item.id === stockUpdate.productId);
    if (!selectedProduct) {
      toast.error("Producto no encontrado");
      return;
    }

    const newQuantity = stockUpdate.operation === "add" 
      ? selectedProduct.quantity + stockUpdate.quantity 
      : Math.max(0, selectedProduct.quantity - stockUpdate.quantity);

    updateStockMutation.mutate({
      id: stockUpdate.productId,
      updates: { quantity: newQuantity }
    });
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm("¿Está seguro que desea eliminar este producto?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleEditProduct = (product: StockItem) => {
    setEditingProduct(product);
    setIsEditProductOpen(true);
  };

  const handleSaveEditedProduct = () => {
    if (!editingProduct) return;

    const { id, ...updates } = editingProduct;
    editProductMutation.mutate({ 
      id, 
      updates: {
        product_name: updates.product_name,
        category: updates.category,
        quantity: updates.quantity,
        min_stock_level: updates.min_stock_level,
        unit_price: updates.unit_price,
        purchase_date: updates.purchase_date,
        supplier: updates.supplier,
        brand: updates.brand,
        location: updates.location
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventario</h2>
          <p className="text-muted-foreground">
            Gestión de stock y productos
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Importar Excel
          </Button>
          <Button 
            className="bg-salon-400 hover:bg-salon-500"
            onClick={() => setIsAddProductOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Producto
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsUpdateStockOpen(true)}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar Stock
          </Button>
        </div>
      </div>

      {/* --- Filtros y búsqueda arriba de la tabla --- */}
      <StockFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        stockCategories={stockCategories}
        stockLocations={stockLocations}
      />
      {/* --- Fin filtros y búsqueda --- */}

      {isLoading && (
        <Card>
          <CardContent className="p-8 flex justify-center">
            <p>Cargando inventario...</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && (
        <Tabs defaultValue="products">
          <TabsList className="mb-4">
            <TabsTrigger value="products">Listado de Productos</TabsTrigger>
            <TabsTrigger value="locations">Detalle por Ubicación</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <ProductTable
              stockItems={stockItems}
              filteredStockItems={filteredStockItems}
              isSuperAdmin={isSuperAdmin}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          </TabsContent>
          
          <TabsContent value="locations">
            <StockLocations
              physicalStockLocations={physicalStockLocations}
              isSuperAdmin={isSuperAdmin}
            />
          </TabsContent>
        </Tabs>
      )}

      <ProductDialog
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        mode="add"
        product={newProduct}
        setProduct={setNewProduct}
        categories={stockCategories}
        locations={stockLocations}
        isPending={addProductMutation.isPending}
        onAction={handleAddProduct}
        onCancel={() => setIsAddProductOpen(false)}
        actionLabel="Agregar Producto"
      />

      <StockUpdateDialog
        open={isUpdateStockOpen}
        onOpenChange={setIsUpdateStockOpen}
        productId={stockUpdate.productId}
        setProductId={id => setStockUpdate(update => ({ ...update, productId: id }))}
        quantity={stockUpdate.quantity}
        setQuantity={q => setStockUpdate(update => ({ ...update, quantity: q }))}
        operation={stockUpdate.operation}
        setOperation={op => setStockUpdate(update => ({ ...update, operation: op }))}
        stockItems={stockItems}
        isPending={updateStockMutation.isPending}
        onUpdate={handleUpdateStock}
        onCancel={() => setIsUpdateStockOpen(false)}
      />

      <ProductDialog
        open={isEditProductOpen}
        onOpenChange={setIsEditProductOpen}
        mode="edit"
        product={editingProduct || {}}
        setProduct={product => setEditingProduct(e => e ? { ...e, ...product } : null)}
        categories={stockCategories}
        locations={stockLocations}
        isPending={editProductMutation.isPending}
        onAction={handleSaveEditedProduct}
        onCancel={() => setIsEditProductOpen(false)}
        actionLabel="Guardar Cambios"
      />

      <StockImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImportStock}
        templateData={templateData}
        templateFilename="plantilla_stock"
        title="Importar Stock"
        description="Descargue la plantilla y complete los datos según el formato requerido"
      />
    </div>
  );
}
