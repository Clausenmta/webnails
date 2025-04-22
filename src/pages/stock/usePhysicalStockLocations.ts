
import type { StockItem, PhysicalStockLocation } from "@/types/stock";
import { stockLocations } from "@/types/stock";

export function usePhysicalStockLocations(stockItems: StockItem[]): PhysicalStockLocation[] {
  return stockLocations.map((locationName, idx) => ({
    id: idx + 1,
    name: locationName,
    items: stockItems
      .filter(item => (item.location || "") === locationName)
      .map(item => ({
        productId: item.id,
        productName: item.product_name,
        category: item.category,
        brand: item.brand,
        quantity: item.quantity,
        unit_price: item.unit_price,
        min_stock_level: item.min_stock_level,
      })),
  }));
}
