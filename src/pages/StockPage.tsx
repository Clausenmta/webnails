
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

// Esta es una página de ejemplo simplificada para el manejo de stock con permisos por rol
export default function StockPage() {
  const { isAuthorized } = useAuth();
  const isSuperAdmin = isAuthorized('superadmin');
  
  // Datos de ejemplo de productos
  const [products, setProducts] = useState([
    { id: 1, code: "OPI-001", name: "OPI Gel Base Coat", category: "Esmaltes", stock: 5, minStock: 3, price: 12000 },
    { id: 2, code: "OPI-002", name: "OPI Gel Top Coat", category: "Esmaltes", stock: 8, minStock: 3, price: 12000 },
    { id: 3, code: "CND-001", name: "CND Shellac Base", category: "Esmaltes", stock: 2, minStock: 3, price: 10500 },
    { id: 4, code: "CND-002", name: "CND Shellac Top", category: "Esmaltes", stock: 4, minStock: 3, price: 10500 },
    { id: 5, code: "INS-001", name: "Algodón Premium", category: "Insumos", stock: 15, minStock: 5, price: 3000 },
    { id: 6, code: "INS-002", name: "Acetona 1L", category: "Insumos", stock: 3, minStock: 2, price: 5000 },
  ]);

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
          <Button className="bg-salon-400 hover:bg-salon-500">
            Agregar Producto
          </Button>
          <Button variant="outline">
            Actualizar Stock
          </Button>
        </div>
      </div>

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
                      <Button variant="ghost" size="sm">Editar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
