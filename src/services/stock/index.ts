
import { stockQueryService } from "./stockQueryService";
import { stockMutationService } from "./stockMutationService";
import { stockCategories } from "@/types/stock";

// Re-export types using 'export type' syntax
export type { StockItem, NewStockItem } from "@/types/stock";

// Create combined stockService with all methods
export const stockService = {
  ...stockQueryService,
  ...stockMutationService,
  // Alias for backward compatibility
  createStockItem: stockMutationService.addStockItem
};

// Re-export stockCategories for easy access
export { stockCategories };
