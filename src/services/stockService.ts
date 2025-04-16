
// This file is kept for backward compatibility
// It re-exports all the stock-related functionality from the new modular structure
import { stockService, stockCategories } from "./stock";
import { MOCK_STOCK } from "@/types/stock";

// Re-export the service and categories
export { stockService, stockCategories };

// Re-export types using 'export type' syntax for TypeScript isolatedModules compatibility
export type { StockItem, NewStockItem } from "@/types/stock";

// Export mock data
export { MOCK_STOCK };
