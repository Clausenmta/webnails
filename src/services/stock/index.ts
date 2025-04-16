
import { stockQueryService } from "./stockQueryService";
import { stockMutationService } from "./stockMutationService";
import { stockCategories } from "@/types/stock";

// Re-export everything from the services
export * from "@/types/stock";

// Create combined stockService with all methods
export const stockService = {
  ...stockQueryService,
  ...stockMutationService
};

// Re-export stockCategories for easy access
export { stockCategories };
