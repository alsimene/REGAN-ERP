"use client";

import { useState, useMemo } from "react";
import type { ProductSummary, SortKey, SortDir, SizeUnit } from "../../types";
import { useProductDetail } from "../../hooks/useInventoryData";
import ProductTable from "./ProductTable";
import ProductDetailModal from "../../shared/ProductDetailModal";
import Pagination from "../../shared/Pagination";

interface Props {
  products: ProductSummary[];
  allProducts: ProductSummary[];
  totalAll: number;
  filteredCount: number;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  sizeUnit: SizeUnit;
  hiddenColumns: Set<string>;
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  startIndex: number;
}

export default function ProductTableView({
  products, allProducts, totalAll, filteredCount, sortKey, sortDir, onSort,
  sizeUnit, hiddenColumns,
  currentPage, totalPages, onPrev, onNext, startIndex,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { warehouses, movements, loading: detailLoading } = useProductDetail(selectedId);
  const selectedProduct = useMemo(
    () => allProducts.find((p) => p.productId === selectedId) ?? null,
    [allProducts, selectedId],
  );

  return (
    <>
      <ProductTable
        products={products}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={onSort}
        sizeUnit={sizeUnit}
        hiddenColumns={hiddenColumns}
        startIndex={startIndex}
        onSelectProduct={(id) => setSelectedId(selectedId === id ? null : id)}
        filteredCount={filteredCount}
        totalAll={totalAll}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalAll}
        filteredItems={allProducts.length}
        onPrev={onPrev}
        onNext={onNext}
      />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          warehouses={warehouses}
          movements={movements}
          loading={detailLoading}
          onClose={() => setSelectedId(null)}
        />
      )}
    </>
  );
}
