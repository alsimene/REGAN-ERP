"use client";

import { useState, useMemo } from "react";
import type { ProductSummary, SortKey, SortDir, SizeUnit, ColumnDef } from "../../types";
import { useProductDetail } from "../../hooks/useInventoryData";
import ProToolbar from "./ProToolbar";
import ProTable from "./ProTable";
import ProductDetailModal from "../../shared/ProductDetailModal";
import Pagination from "../../shared/Pagination";

interface Props {
  products: ProductSummary[];
  allProducts: ProductSummary[];
  totalAll: number;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  sizeUnit: SizeUnit;
  onSizeUnitChange: (unit: SizeUnit) => void;
  hiddenColumns: Set<string>;
  onToggleColumn: (key: string) => void;
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  startIndex: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const columnDefs: ColumnDef[] = [
  { key: "category", label: "Category" },
  { key: "sizeMm", label: "Size" },
  { key: "thicknessMm", label: "Thickness" },
  { key: "flangeThicknessMm", label: "Flange" },
  { key: "lengthM", label: "Length" },
  { key: "kgPerM", label: "Kg/m" },
  { key: "weightPerLength", label: "Wt/pcs" },
  { key: "weightPer20ft", label: "Wt/20ft" },
  { key: "c1", label: "C1" },
  { key: "c2", label: "C2" },
  { key: "c3", label: "C3" },
  { key: "totalStock", label: "Total" },
];

export default function ProTableView({
  products, allProducts, totalAll, sortKey, sortDir, onSort,
  sizeUnit, onSizeUnitChange, hiddenColumns, onToggleColumn,
  currentPage, totalPages, onPrev, onNext, startIndex,
  searchQuery, onSearchChange,
}: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { warehouses, movements, loading: detailLoading } = useProductDetail(selectedId);
  const selectedProduct = useMemo(
    () => allProducts.find((p) => p.productId === selectedId) ?? null,
    [allProducts, selectedId],
  );

  return (
    <>
      <ProToolbar
        sizeUnit={sizeUnit}
        onSizeUnitChange={onSizeUnitChange}
        columns={columnDefs}
        hiddenColumns={hiddenColumns}
        onToggleColumn={onToggleColumn}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <ProTable
        products={products}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={onSort}
        sizeUnit={sizeUnit}
        hiddenColumns={hiddenColumns}
        startIndex={startIndex}
        selectedId={selectedId}
        onSelectProduct={setSelectedId}
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
