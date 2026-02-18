"use client";

import { useState, useMemo, useEffect } from "react";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import { useInventoryData } from "./hooks/useInventoryData";
import { usePreferences } from "./hooks/usePreferences";
import { useColumnVisibility } from "./hooks/useColumnVisibility";
import { usePagination } from "./hooks/usePagination";
import { useSortedProducts } from "./hooks/useSortedProducts";
import { buildSearchIndex, parseSearchTokens, matchesSearch } from "./utils";
import ProTableView from "./views/ProTableView/ProTableView";

export default function Inventory2Page() {
  const { stats, categories, allProducts, loading } = useInventoryData();
  const { sortKey, sortDir, sizeUnit, setSortKey, setSizeUnit } = usePreferences();
  const { hiddenColumns, toggleColumn } = useColumnVisibility();

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Pre-build search index (once per allProducts change)
  const indexMap = useMemo(() => {
    const map = new Map<number, string>();
    allProducts.forEach((p) => map.set(p.productId, buildSearchIndex(p)));
    return map;
  }, [allProducts]);

  // Filter by search
  const filteredProducts = useMemo(() => {
    if (!debouncedQuery) return allProducts;
    const { dims, words } = parseSearchTokens(debouncedQuery);
    if (dims.length === 0 && words.length === 0) return allProducts;
    return allProducts.filter((p) => {
      const idx = indexMap.get(p.productId) ?? "";
      return matchesSearch(idx, dims, words);
    });
  }, [allProducts, debouncedQuery, indexMap]);

  const sortedProducts = useSortedProducts(filteredProducts, sortKey, sortDir);
  const { currentPage, totalPages, prevPage, nextPage, pageSlice } = usePagination(sortedProducts.length);
  const pageProducts = useMemo(
    () => sortedProducts.slice(pageSlice.start, pageSlice.end),
    [sortedProducts, pageSlice],
  );

  return (
    <>
      <LoadingOverlay open={loading} message="Loading inventory" />

      <div
        className="animate-fade-up"
        style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
      >
        <ProTableView
          products={pageProducts}
          allProducts={sortedProducts}
          totalAll={allProducts.length}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={setSortKey}
          sizeUnit={sizeUnit}
          onSizeUnitChange={setSizeUnit}
          hiddenColumns={hiddenColumns}
          onToggleColumn={toggleColumn}
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={prevPage}
          onNext={nextPage}
          startIndex={pageSlice.start}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>
    </>
  );
}
