"use client";

import { useState, useMemo } from "react";
import type { ProductSummary, SortKey, SortDir, SizeUnit } from "../../types";
import { useProductDetail } from "../../hooks/useInventoryData";
import ProductTable from "./ProductTable";
import ProductDetailModal from "../../shared/ProductDetailModal";
import Pagination from "../../shared/Pagination";

interface Props {
  products: ProductSummary[];
  totalCount: number;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  sizeUnit: SizeUnit;
  hiddenColumns: Set<string>;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
  onPageSizeChange: (size: number) => void;
  startIndex: number;
}

export default function ProductTableView({
  products, totalCount, sortKey, sortDir, onSort,
  sizeUnit, hiddenColumns,
  currentPage, totalPages, pageSize, onPrev, onNext, onPageSizeChange, startIndex,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { warehouses, movements, loading: detailLoading } = useProductDetail(selectedId);
  const selectedProduct = useMemo(
    () => products.find((p) => p.productId === selectedId) ?? null,
    [products, selectedId],
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
        filteredCount={totalCount}
        totalAll={totalCount}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        filteredItems={totalCount}
        pageSize={pageSize}
        onPrev={onPrev}
        onNext={onNext}
        onPageSizeChange={onPageSizeChange}
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
