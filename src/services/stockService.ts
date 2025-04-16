
// This file is kept for backward compatibility
// It re-exports all the stock-related functionality from the new modular structure
import { stockService, stockCategories } from "./stock";
import type { StockItem, NewStockItem } from "@/types/stock";
import { MOCK_STOCK } from "@/types/stock";

export { stockService, stockCategories };
export type { StockItem, NewStockItem };
export { MOCK_STOCK };
