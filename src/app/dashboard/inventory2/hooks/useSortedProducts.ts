"use client";

import { useMemo } from "react";
import type { ProductSummary, SortKey, SortDir } from "../types";

export function useSortedProducts(
  products: ProductSummary[],
  sortKey: SortKey,
  sortDir: SortDir,
): ProductSummary[] {
  return useMemo(() => {
    const sorted = [...products].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "sku": cmp = a.sku.localeCompare(b.sku); break;
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "category": cmp = a.category.localeCompare(b.category); break;
        case "totalStock": cmp = a.totalStock - b.totalStock; break;
      }
      if (cmp === 0) cmp = a.sku.localeCompare(b.sku);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [products, sortKey, sortDir]);
}
