
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
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="py-3 px-4 text-left whitespace-nowrap">Código</th>
              <th className="py-3 px-4 text-left whitespace-nowrap">Producto</th>
              <th className="py-3 px-4 text-left whitespace-nowrap">Categoría</th>
              <th className="py-3 px-4 text-center whitespace-nowrap">Stock</th>
              <th className="py-3 px-4 text-center whitespace-nowrap">Mínimo</th>
              <th className="py-3 px-4 text-left whitespace-nowrap">Ubicación</th>
              <th className="py-3 px-4 text-left whitespace-nowrap">Marca</th>
              {isSuperAdmin && <th className="py-3 px-4 text-right whitespace-nowrap">Precio</th>}
              <th className="py-3 px-4 text-right whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredStockItems.map(product => (
              <tr key={product.id} className="border-b">
                <td className="py-3 px-4 whitespace-nowrap">{product.id}</td>
                <td className="py-3 px-4 max-w-[150px] truncate">{product.product_name}</td>
                <td className="py-3 px-4 whitespace-nowrap">{product.category}</td>
                <td className={`py-3 px-4 text-center whitespace-nowrap ${product.quantity < (product.min_stock_level || 3) ? "text-red-500 font-medium" : ""}`}>
                  {product.quantity}
                </td>
                <td className="py-3 px-4 text-center whitespace-nowrap">{product.min_stock_level || 3}</td>
                <td className="py-3 px-4 whitespace-nowrap">{product.location}</td>
                <td className="py-3 px-4 whitespace-nowrap">{product.brand || 'N/A'}</td>
                {isSuperAdmin && (
                  <td className="py-3 px-4 text-right whitespace-nowrap">${product.unit_price.toLocaleString()}</td>
                )}
                <td className="py-3 px-4 text-right whitespace-nowrap">
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
                <td colSpan={isSuperAdmin ? 9 : 8} className="py-6 text-center text-muted-foreground">
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
