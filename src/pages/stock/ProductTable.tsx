
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { StockItem } from "@/types/stock";

interface ProductTableProps {
  stockItems: StockItem[];
  filteredStockItems: StockItem[];
  isSuperAdmin: boolean;
  onEdit: (p: StockItem) => void;
  onDelete: (id: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  stockItems,
  filteredStockItems,
  isSuperAdmin,
  onEdit,
  onDelete,
}) => (
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
            {filteredStockItems.map(product => (
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
                      onClick={() => onEdit(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDelete(product.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredStockItems.length === 0 && (
              <tr>
                <td colSpan={isSuperAdmin ? 8 : 7} className="py-6 text-center text-muted-foreground">
                  No hay productos en el inventario con esos filtros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

export default ProductTable;
