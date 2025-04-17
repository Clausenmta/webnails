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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Package, Pencil, Trash2, PlusCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserRoleInfo from "@/components/auth/UserRoleInfo";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { stockService } from "@/services/stock";
import type { StockItem, NewStockItem, PhysicalStockLocation } from "@/types/stock";
import { stockCategories, stockLocations } from "@/types/stock";
import { FileSpreadsheet } from "lucide-react";
import { exportReport } from "@/utils/reportExport";
import { ImportExcelDialog } from "@/components/common/ImportExcelDialog";

export default function StockPage() {
  const { isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  const queryClient = useQueryClient();
  
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isUpdateStockOpen, setIsUpdateStockOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StockItem | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const [newProduct, setNewProduct] = useState<Omit<NewStockItem, 'created_by'>>({
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
    if (!row.category || !stockCategories.includes(row.category)) {
      return { isValid: false, error: "La categoría no es válida" };
    }
    if (typeof row.quantity !== 'number' || row.quantity < 0) {
      return { isValid: false, error: "La cantidad debe ser un número positivo" };
    }
    if (typeof row.unit_price !== 'number' || row.unit_price < 0) {
      return { isValid: false, error: "El precio debe ser un número positivo" };
    }
    return { isValid: true };
  };

  const handleImportStock = async (data: any[]) => {
    try {
      for (const item of data) {
        await addProductMutation.mutateAsync({
          ...item,
          purchase_date: new Date().toLocaleDateString()
        });
      }
      toast.success(`${data.length} productos importados correctamente`);
    } catch (error) {
      console.error('Error importing stock:', error);
      toast.error('Error al importar productos');
    }
  };

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
    const stockItem: Omit<NewStockItem, 'created_by'> = {
      ...newProduct,
    };
    
    addProductMutation.mutate(stockItem as NewStockItem);
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
            <Card>
              <CardHeader>
                <CardTitle>Listado de Productos</CardTitle>
                <CardDescription>
                  Inventario completo de productos e insumos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left">Código</th>
                        <th className="py-3 px-4 text-left">Producto</th>
                        <th className="py-3 px-4 text-left">Categoría</th>
                        <th className="py-3 px-4 text-center">Stock</th>
                        <th className="py-3 px-4 text-center">Mínimo</th>
                        <th className="py-3 px-4 text-left">Ubicación</th>
                        <th className="py-3 px-4 text-left">Marca</th>
                        {isSuperAdmin && <th className="py-3 px-4 text-right">Precio</th>}
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockItems.map(product => (
                        <tr key={product.id} className="border-b">
                          <td className="py-3 px-4">{product.id}</td>
                          <td className="py-3 px-4">{product.product_name}</td>
                          <td className="py-3 px-4">{product.category}</td>
                          <td className={`py-3 px-4 text-center ${product.quantity < (product.min_stock_level || 3) ? "text-red-500 font-medium" : ""}`}>
                            {product.quantity}
                          </td>
                          <td className="py-3 px-4 text-center">{product.min_stock_level || 3}</td>
                          <td className="py-3 px-4">{product.location}</td>
                          <td className="py-3 px-4">{product.brand || 'N/A'}</td>
                          {isSuperAdmin && (
                            <td className="py-3 px-4 text-right">${product.unit_price.toLocaleString()}</td>
                          )}
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {stockItems.length === 0 && (
                        <tr>
                          <td colSpan={isSuperAdmin ? 8 : 7} className="py-6 text-center text-muted-foreground">
                            No hay productos en el inventario
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <CardTitle>Detalle de Stock por Ubicación</CardTitle>
                <CardDescription>
                  Distribución de productos en las diferentes ubicaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {physicalStockLocations.map(location => (
                    <Card key={location.id} className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Package className="h-4 w-4 mr-2 text-salon-500" />
                          {location.name}
                        </CardTitle>
                        <CardDescription>
                          {location.items.length} productos
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="py-2 px-3 text-left">Producto</th>
                                <th className="py-2 px-3 text-left">Categoría</th>
                                <th className="py-2 px-3 text-right">Stock</th>
                                {isSuperAdmin && (
                                  <th className="py-2 px-3 text-right">Precio</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {location.items.map((item, index) => (
                                <tr key={index} className="border-b last:border-0">
                                  <td className="py-2 px-3">
                                    {item.brand ? `${item.productName} (${item.brand})` : item.productName}
                                  </td>
                                  <td className="py-2 px-3">{item.category}</td>
                                  <td className={`py-2 px-3 text-right ${
                                    item.quantity < (item.min_stock_level || 3) ? "text-red-500 font-medium" : ""
                                  }`}>
                                    {item.quantity}
                                  </td>
                                  {isSuperAdmin && (
                                    <td className="py-2 px-3 text-right">
                                      ${item.unit_price.toLocaleString()}
                                    </td>
                                  )}
                                </tr>
                              ))}
                              
                              {location.items.length === 0 && (
                                <tr>
                                  <td colSpan={isSuperAdmin ? 4 : 3} className="py-4 text-center text-muted-foreground">
                                    No hay productos en esta ubicación
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Producto</DialogTitle>
            <DialogDescription>
              Completa los detalles del producto para agregarlo al inventario
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto</Label>
              <Input
                id="name"
                value={newProduct.product_name}
                onChange={(e) => setNewProduct({...newProduct, product_name: e.target.value})}
                placeholder="Nombre completo del producto"
                className="w-full"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Proveedor</Label>
                <Input
                  id="supplier"
                  value={newProduct.supplier || ""}
                  onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                  placeholder="Nombre del proveedor"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={newProduct.brand || ""}
                  onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                  placeholder="Marca del producto"
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select 
                value={newProduct.category} 
                onValueChange={(value) => setNewProduct({...newProduct, category: value})}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {stockCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Select 
                value={newProduct.location || ''} 
                onValueChange={(value) => setNewProduct({...newProduct, location: value})}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {stockLocations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Inicial</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={newProduct.quantity || ""}
                  onChange={(e) => setNewProduct({...newProduct, quantity: Number(e.target.value)})}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Stock Mínimo</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="1"
                  value={newProduct.min_stock_level || ""}
                  onChange={(e) => setNewProduct({...newProduct, min_stock_level: Number(e.target.value)})}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={newProduct.unit_price || ""}
                  onChange={(e) => setNewProduct({...newProduct, unit_price: Number(e.target.value)})}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAddProductOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAddProduct}
              disabled={!newProduct.product_name || addProductMutation.isPending}
              className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
            >
              {addProductMutation.isPending ? "Guardando..." : "Agregar Producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateStockOpen} onOpenChange={setIsUpdateStockOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Actualizar Stock</DialogTitle>
            <DialogDescription>
              Selecciona un producto y actualiza su cantidad en stock
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product">Producto</Label>
              <Select 
                value={stockUpdate.productId ? stockUpdate.productId.toString() : ""} 
                onValueChange={(value) => setStockUpdate({...stockUpdate, productId: Number(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {stockItems.map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.product_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="operation">Operación</Label>
              <Select 
                value={stockUpdate.operation} 
                onValueChange={(value) => setStockUpdate({...stockUpdate, operation: value as "add" | "remove"})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar operación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Agregar</SelectItem>
                  <SelectItem value="remove">Retirar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={stockUpdate.quantity || ""}
                onChange={(e) => setStockUpdate({...stockUpdate, quantity: Number(e.target.value)})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStockOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateStock}
              disabled={stockUpdate.quantity <= 0 || !stockUpdate.productId || updateStockMutation.isPending}
            >
              {updateStockMutation.isPending ? "Actualizando..." : "Actualizar Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Modifica los detalles del producto en el inventario
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto</Label>
              <Input
                id="name"
                value={editingProduct?.product_name || ""}
                onChange={(e) => setEditingProduct(prev => 
                  prev ? { ...prev, product_name: e.target.value } : null
                )}
                placeholder="Nombre completo del producto"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select 
                value={editingProduct?.category || ""} 
                onValueChange={(value) => setEditingProduct(prev => 
                  prev ? { ...prev, category: value } : null
                )}
              >
                <SelectTrigger className="w-full border-[#9b87f5] focus:ring-[#9b87f5]">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {stockCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={editingProduct?.quantity || ""}
                  onChange={(e) => setEditingProduct(prev => 
                    prev ? { ...prev, quantity: Number(e.target.value) } : null
                  )}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Stock Mínimo</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="1"
                  value={editingProduct?.min_stock_level || ""}
                  onChange={(e) => setEditingProduct(prev => 
                    prev ? { ...prev, min_stock_level: Number(e.target.value) } : null
                  )}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={editingProduct?.unit_price || ""}
                  onChange={(e) => setEditingProduct(prev => 
                    prev ? { ...prev, unit_price: Number(e.target.value) } : null
                  )}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Proveedor</Label>
                <Input
                  id="supplier"
                  value={editingProduct?.supplier || ""}
                  onChange={(e) => setEditingProduct(prev => 
                    prev ? { ...prev, supplier: e.target.value } : null
                  )}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={editingProduct?.brand || ""}
                  onChange={(e) => setEditingProduct(prev => 
                    prev ? { ...prev, brand: e.target.value } : null
                  )}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ubicación</Label>
              <Select 
                value={editingProduct?.location || ''} 
                onValueChange={(value) => setEditingProduct(prev => 
                  prev ? { ...prev, location: value } : null
                )}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {stockLocations.map(location => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditProductOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEditedProduct}
              disabled={!editingProduct?.product_name || editProductMutation.isPending}
              className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
            >
              {editProductMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImportExcelDialog
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
