export type Classification = "C1" | "C2" | "C3";
export type SortKey = "sku" | "name" | "category" | "totalStock";
export type SortDir = "asc" | "desc";
export type SizeUnit = "original" | "in" | "mm";

export const PAGE_SIZE = 50;

export const STORAGE_KEYS = {
  columns: "inv2-hidden-columns",
  prefs: "inv2-preferences",
} as const;

export interface ProductSummary {
  productId: number;
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
  capacity: number;
  unit: string;
  c1: number;
  c2: number;
  c3: number;
  totalStock: number;
}

export interface WarehouseBreakdown {
  warehouse: string;
  c1: number;
  c2: number;
  c3: number;
}

export interface StockMovement {
  id: number;
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
  id: number;
  name: string;
  product_count: number;
}

export interface ColumnDef {
  key: string;
  label: string;
  align?: "left" | "right";
}
