
import { useState } from "react";
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
import { Package, Pencil, Trash2, PlusCircle, RefreshCw, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
}

interface StockLocation {
  id: number;
  name: string;
  items: {
    productId: number;
    productName: string;
    quantity: number;
  }[];
}

// Esta es una página de ejemplo simplificada para el manejo de stock con permisos por rol
export default function StockPage() {
  const { isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  
  // Datos de ejemplo de productos
  const [products, setProducts] = useState<Product[]>([
    { id: 1, code: "OPI-001", name: "OPI Gel Base Coat", category: "Esmaltes", stock: 5, minStock: 3, price: 12000 },
    { id: 2, code: "OPI-002", name: "OPI Gel Top Coat", category: "Esmaltes", stock: 8, minStock: 3, price: 12000 },
    { id: 3, code: "CND-001", name: "CND Shellac Base", category: "Esmaltes", stock: 2, minStock: 3, price: 10500 },
    { id: 4, code: "CND-002", name: "CND Shellac Top", category: "Esmaltes", stock: 4, minStock: 3, price: 10500 },
    { id: 5, code: "INS-001", name: "Algodón Premium", category: "Insumos", stock: 15, minStock: 5, price: 3000 },
    { id: 6, code: "INS-002", name: "Acetona 1L", category: "Insumos", stock: 3, minStock: 2, price: 5000 },
  ]);

  // Datos de ejemplo de ubicaciones de stock
  const [stockLocations, setStockLocations] = useState<StockLocation[]>([
    {
      id: 1,
      name: "Salón Principal",
      items: [
        { productId: 1, productName: "OPI Gel Base Coat", quantity: 3 },
        { productId: 2, productName: "OPI Gel Top Coat", quantity: 5 },
        { productId: 5, productName: "Algodón Premium", quantity: 7 },
      ]
    },
    {
      id: 2,
      name: "Depósito",
      items: [
        { productId: 1, productName: "OPI Gel Base Coat", quantity: 2 },
        { productId: 2, productName: "OPI Gel Top Coat", quantity: 3 },
        { productId: 3, productName: "CND Shellac Base", quantity: 2 },
        { productId: 4, productName: "CND Shellac Top", quantity: 4 },
        { productId: 5, productName: "Algodón Premium", quantity: 8 },
        { productId: 6, productName: "Acetona 1L", quantity: 3 },
      ]
    },
    {
      id: 3,
      name: "Sala de Manicura",
      items: [
        { productId: 3, productName: "CND Shellac Base", quantity: 1 },
        { productId: 4, productName: "CND Shellac Top", quantity: 2 },
      ]
    }
  ]);

  // Estado para los diálogos
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isUpdateStockOpen, setIsUpdateStockOpen] = useState(false);
  
  // Estado para nuevo producto
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    code: "",
    name: "",
    category: "Esmaltes",
    stock: 0,
    minStock: 1,
    price: 0
  });

  // Estado para actualización de stock
  const [stockUpdate, setStockUpdate] = useState({
    productId: 1,
    quantity: 0,
    operation: "add" as "add" | "remove"
  });

  const productCategories = ["Esmaltes", "Insumos", "Tratamientos", "Herramientas", "Decoración"];

  const handleAddProduct = () => {
    const id = Math.max(0, ...products.map(p => p.id)) + 1;
    setProducts([...products, { ...newProduct, id }]);
    setNewProduct({
      code: "",
      name: "",
      category: "Esmaltes",
      stock: 0,
      minStock: 1,
      price: 0
    });
    setIsAddProductOpen(false);
    toast.success("Producto agregado correctamente");
  };

  const handleUpdateStock = () => {
    const updatedProducts = products.map(product => {
      if (product.id === stockUpdate.productId) {
        const newStock = stockUpdate.operation === "add" 
          ? product.stock + stockUpdate.quantity 
          : Math.max(0, product.stock - stockUpdate.quantity);
        
        return { ...product, stock: newStock };
      }
      return product;
    });
    
    setProducts(updatedProducts);
    setStockUpdate({
      productId: 1,
      quantity: 0,
      operation: "add"
    });
    setIsUpdateStockOpen(false);
    toast.success("Stock actualizado correctamente");
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(product => product.id !== id));
    toast.success("Producto eliminado correctamente");
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
                      {isSuperAdmin && <th className="py-3 px-4 text-right">Precio</th>}
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} className="border-b">
                        <td className="py-3 px-4">{product.code}</td>
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4">{product.category}</td>
                        <td className={`py-3 px-4 text-center ${product.stock < product.minStock ? "text-red-500 font-medium" : ""}`}>
                          {product.stock}
                        </td>
                        <td className="py-3 px-4 text-center">{product.minStock}</td>
                        {isSuperAdmin && (
                          <td className="py-3 px-4 text-right">${product.price.toLocaleString()}</td>
                        )}
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm">
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
                {stockLocations.map(location => (
                  <Card key={location.id} className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center">
                        <Database className="h-4 w-4 mr-2 text-salon-500" />
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
                              <th className="py-2 px-3 text-right">Cantidad</th>
                            </tr>
                          </thead>
                          <tbody>
                            {location.items.map((item, index) => (
                              <tr key={index} className="border-b last:border-0">
                                <td className="py-2 px-3">{item.productName}</td>
                                <td className="py-2 px-3 text-right">{item.quantity}</td>
                              </tr>
                            ))}
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

      {/* Dialog para agregar producto */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Producto</DialogTitle>
            <DialogDescription>
              Completa los detalles del producto para agregarlo al inventario
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={newProduct.code}
                  onChange={(e) => setNewProduct({...newProduct, code: e.target.value})}
                  placeholder="Ej: OPI-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select 
                  value={newProduct.category} 
                  onValueChange={(value) => setNewProduct({...newProduct, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto</Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                placeholder="Nombre completo del producto"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Inicial</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">Stock Mínimo</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="1"
                  value={newProduct.minStock}
                  onChange={(e) => setNewProduct({...newProduct, minStock: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAddProduct}
              disabled={!newProduct.code || !newProduct.name}
              className="bg-salon-400 hover:bg-salon-500"
            >
              Agregar Producto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para actualizar stock */}
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
                value={stockUpdate.productId.toString()} 
                onValueChange={(value) => setStockUpdate({...stockUpdate, productId: Number(value)})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} ({product.code})
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
              disabled={stockUpdate.quantity <= 0}
            >
              Actualizar Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
