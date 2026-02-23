export type Classification = "C1" | "C2" | "C3";
export type SortKey = "sku" | "name" | "category" | "totalStock";
export type SortDir = "asc" | "desc";
export type SizeUnit = "original" | "in" | "mm";
export type ViewMode = "all" | "category" | "lowstock" | "fastmovers";

export const PAGE_SIZE = 50;

export const STORAGE_KEYS = {
  columns: "inv2-hidden-columns",
  prefs: "inv2-preferences",
} as const;

export interface ProductSummary {
  productId: string;
  sku: string;
  name: string;
  category: string;
  sizeMm: string | null;
  sizeInch: string | null;
  thicknessMm: string | null;
  flangeThicknessMm: string | null;
  weightPer20ft: number | null;
  lengthM: number | null;
  kgPerM: number | null;
  weightPerLength: number | null;
  unit: string;
  status: boolean;
  c1: number;
  c2: number;
  c3: number;
  totalStock: number;
  companies: string[];
}

export interface WarehouseBreakdown {
  warehouse: string;
  company: string;
  c1: number;
  c2: number;
  c3: number;
}

export interface StockMovement {
  id: string;
  type: string;
  classification: string;
  quantity: number;
  warehouse: string;
  performedBy: string | null;
  createdAt: string;
  notes: string | null;
  referenceId: string | null;
}

export interface StatCard {
  label: string;
  value: string;
}

export interface CategoryWithCount {
  id: string;
  name: string;
  product_count: number;
}

export interface ColumnOption {
  key: string;
  label: string;
  align?: "left" | "right";
}

export interface FastMovingItem {
  product_id: string;
  sku: string;
  product_name: string;
  category_name: string;
  total_moved: number;
  total_ordered: number;
  txn_count: number;
  warehouse_count: number;
  current_stock: number;
  last_movement: string;
}

export interface LowStockItem {
  productId: string;
  sku: string;
  name: string;
  category: string;
  c1: number;
  c2: number;
  c3: number;
  totalStock: number;
  pct: number;
}
