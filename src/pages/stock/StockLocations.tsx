
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import type { PhysicalStockLocation } from "@/types/stock";

interface StockLocationsProps {
  physicalStockLocations: PhysicalStockLocation[];
  isSuperAdmin: boolean;
}

const StockLocations: React.FC<StockLocationsProps> = ({
  physicalStockLocations,
  isSuperAdmin,
}) => (
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
);

export default StockLocations;
