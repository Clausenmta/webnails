
// Stock-related type definitions

export interface StockItem {
  id: number;
  created_at: string;
  product_name: string;
  category: string;
  brand?: string;
  quantity: number;
  unit_price: number;
  purchase_date: string;
  expiry_date?: string;
  min_stock_level?: number;
  location?: string;
  supplier?: string;
  created_by: string;
}

export type NewStockItem = Omit<StockItem, 'id' | 'created_at'>;

// Categorías de productos para stock
export const stockCategories = [
  "Productos para cabello",
  "Productos para uñas",
  "Cosméticos",
  "Cuidado facial",
  "Equipamiento",
  "Herramientas",
  "Otros"
];

// Datos de muestra para cuando Supabase no está configurado
export const MOCK_STOCK: StockItem[] = [
  {
    id: 1,
    created_at: new Date().toISOString(),
    product_name: "Shampoo profesional",
    category: "Productos para cabello",
    brand: "Marca Ejemplo",
    quantity: 10,
    unit_price: 1800,
    purchase_date: "01/04/2025",
    expiry_date: "01/04/2026",
    min_stock_level: 3,
    supplier: "Proveedor Ejemplo",
    created_by: "admin"
  }
];
