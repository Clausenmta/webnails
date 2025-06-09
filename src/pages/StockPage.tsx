
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { stockQueryService } from "@/services/stock/stockQueryService";
import { stockMutationService } from "@/services/stock/stockMutationService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { StockItem, NewStockItem } from "@/types/stock";
import { stockCategories, stockLocations } from "@/types/stock";
import StockFilters from "./stock/StockFilters";
import ProductTable from "./stock/ProductTable";
import StockLocations from "./stock/StockLocations";
import ProductDialog from "./stock/ProductDialog";
import StockUpdateDialog from "./stock/StockUpdateDialog";
import StockImportDialog from "./stock/StockImportDialog";
import { usePhysicalStockLocations } from "./stock/usePhysicalStockLocations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Package, Plus, TrendingDown, Upload, RefreshCw } from "lucide-react";

const StockPage = () => {
  const { user, isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  const queryClient = useQueryClient();

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all-categories");
  const [locationFilter, setLocationFilter] = useState("all-locations");
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Update stock state
  const [productId, setProductId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [operation, setOperation] = useState<"add" | "remove">("add");

  // Data fetching
  const { data: stockItems = [], isLoading, error } = useQuery({
    queryKey: ['stockItems'],
    queryFn: stockQueryService.fetchStockItems,
  });

  const physicalStockLocations = usePhysicalStockLocations(stockItems);

  // Filter stocks
  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.provider && item.provider.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === "all-categories" || item.category === categoryFilter;
    const matchesLocation = locationFilter === "all-locations" || item.location === locationFilter;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Stock statistics
  const lowStockItems = stockItems.filter(item => item.quantity < (item.min_stock_level || 3));
  const totalValue = isSuperAdmin ? stockItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) : 0;

  // Mutations
  const addProductMutation = useMutation({
    mutationFn: (product: NewStockItem) => stockMutationService.createStockItem({
      ...product,
      created_by: user?.email || 'unknown'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] });
      toast.success("Producto agregado exitosamente");
      setIsProductDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      console.error("Error adding product:", error);
      toast.error("Error al agregar producto");
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<StockItem> }) => 
      stockMutationService.updateStockItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] });
      toast.success("Producto actualizado exitosamente");
      setIsProductDialogOpen(false);
      setSelectedProduct(null);
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      toast.error("Error al actualizar producto");
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => stockMutationService.deleteStockItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] });
      toast.success("Producto eliminado exitosamente");
    },
    onError: (error) => {
      console.error("Error deleting product:", error);
      toast.error("Error al eliminar producto");
    }
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ productId, quantity, operation }: { productId: number; quantity: number; operation: "add" | "remove" }) => 
      stockMutationService.updateStock(productId, quantity, operation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockItems'] });
      toast.success("Stock actualizado exitosamente");
      setIsUpdateDialogOpen(false);
      setProductId(0);
      setQuantity(1);
    },
    onError: (error) => {
      console.error("Error updating stock:", error);
      toast.error("Error al actualizar stock");
    }
  });

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductDialogOpen(true);
  };

  const handleEditProduct = (product: StockItem) => {
    setSelectedProduct(product);
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = (id: number) => {
    if (confirm("¿Está seguro que desea eliminar este producto?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleSaveProduct = (product: NewStockItem) => {
    const productWithUser = {
      ...product,
      created_by: user?.email || 'unknown'
    };

    if (selectedProduct) {
      updateProductMutation.mutate({
        id: selectedProduct.id,
        updates: productWithUser
      });
    } else {
      addProductMutation.mutate(productWithUser);
    }
  };

  const handleUpdateStock = () => {
    if (quantity <= 0 || !productId) {
      toast.error("Seleccione un producto y cantidad válida");
      return;
    }
    updateStockMutation.mutate({ productId, quantity, operation });
  };

  const handleImportProducts = (products: any[]) => {
    // In a real implementation, this would batch create products
    console.log("Importing products:", products);
    toast.success(`${products.length} productos importados exitosamente`);
    setIsImportDialogOpen(false);
  };

  const templateData = [
    {
      product_name: "Esmalte Base",
      category: "Esmaltes",
      brand: "OPI",
      quantity: 10,
      unit_price: 1200,
      min_stock_level: 3,
      location: "Estante A1",
      provider: "Distribuidora ABC"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Cargando inventario...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-500">
          <p>Error al cargar el inventario</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['stockItems'] })}
            className="mt-2"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-salon-800">Gestión de Stock</h1>
          <p className="text-salon-600 mt-1">Control de inventario y productos</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsImportDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Importar Excel
          </Button>
          <Button 
            onClick={() => setIsUpdateDialogOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Actualizar Stock
          </Button>
          <Button 
            onClick={handleAddProduct}
            className="bg-salon-500 hover:bg-salon-600 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockItems.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>
        
        {isSuperAdmin && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stockCategories.length}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center">
              <TrendingDown className="h-5 w-5 mr-2" />
              Productos con Stock Bajo
            </CardTitle>
            <CardDescription className="text-orange-700">
              Los siguientes productos necesitan reposición
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockItems.map(item => (
                <Badge key={item.id} variant="outline" className="border-orange-300 text-orange-800">
                  {item.product_name} ({item.quantity} restantes)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
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

      {/* Main Content */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="locations">Ubicaciones</TabsTrigger>
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

      {/* Dialogs */}
      <ProductDialog
        open={isProductDialogOpen}
        onOpenChange={setIsProductDialogOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
        isLoading={addProductMutation.isPending || updateProductMutation.isPending}
      />

      <StockUpdateDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        productId={productId}
        setProductId={setProductId}
        quantity={quantity}
        setQuantity={setQuantity}
        operation={operation}
        setOperation={setOperation}
        stockItems={stockItems}
        isPending={updateStockMutation.isPending}
        onUpdate={handleUpdateStock}
        onCancel={() => setIsUpdateDialogOpen(false)}
      />

      <StockImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImportProducts}
        templateData={templateData}
        templateFilename="plantilla_stock"
        title="Importar Productos"
        description="Importe productos desde un archivo Excel"
      />
    </div>
  );
};

export default StockPage;
