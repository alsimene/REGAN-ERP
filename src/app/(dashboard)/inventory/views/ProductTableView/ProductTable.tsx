"use client";

import { useMemo, ReactNode } from "react";
import type { ProductSummary, SortKey, SortDir, SizeUnit, Classification } from "../../types";
import { classColor, classLabels, sizeColumnLabel, thickColumnLabel } from "../../utils";
import { icons } from "../../icons";
import DataTable, { type ColumnDef } from "@/app/components/DataTable";
import { renderProductCell } from "./ProductTableRow";

interface Props {
  products: ProductSummary[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  sizeUnit: SizeUnit;
  hiddenColumns: Set<string>;
  startIndex: number;
  onSelectProduct: (id: string) => void;
  filteredCount: number;
  totalAll: number;
}

function SortHeader({ children, column, sortKey, sortDir, onSort }: { children: ReactNode; column: SortKey; sortKey: SortKey; sortDir: SortDir; onSort: (key: SortKey) => void }) {
  return (
    <span className="cursor-pointer select-none inline-flex items-center" onClick={() => onSort(column)}>
      {children}
      {sortKey === column && <span className="ml-0.5">{sortDir === "asc" ? icons.sortAsc : icons.sortDesc}</span>}
    </span>
  );
}

export default function ProductTable({ products, sortKey, sortDir, onSort, sizeUnit, hiddenColumns, startIndex, onSelectProduct, filteredCount, totalAll }: Props) {
  const vis = (key: string) => !hiddenColumns.has(key);

  const columns = useMemo((): ColumnDef<ProductSummary>[] => {
    const cols: ColumnDef<ProductSummary>[] = [
      { key: "#", header: "#", minWidth: 40 },
      { key: "sku", header: <SortHeader column="sku" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>SKU</SortHeader>, minWidth: 80 },
      { key: "name", header: <SortHeader column="name" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>PRODUCT</SortHeader>, minWidth: 160 },
    ];
    if (vis("category")) cols.push({ key: "category", header: <SortHeader column="category" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>CATEGORY</SortHeader>, minWidth: 120 });
    if (vis("sizeMm")) cols.push({ key: "sizeMm", header: sizeColumnLabel(sizeUnit), minWidth: 90 });
    if (vis("thicknessMm")) cols.push({ key: "thicknessMm", header: thickColumnLabel(sizeUnit), minWidth: 90 });
    if (vis("flangeThicknessMm")) cols.push({ key: "flangeThicknessMm", header: "FLANGE (MM)", align: "right", minWidth: 80 });
    if (vis("lengthM")) cols.push({ key: "lengthM", header: "LEN (M)", align: "right", minWidth: 70 });
    if (vis("kgPerM")) cols.push({ key: "kgPerM", header: "KG/M", align: "right", minWidth: 70 });
    if (vis("weightPerLength")) cols.push({ key: "weightPerLength", header: "WT/PCS", align: "right", minWidth: 70 });
    if (vis("weightPer20ft")) cols.push({ key: "weightPer20ft", header: "WT/20FT", align: "right", minWidth: 70 });
    if (vis("c1")) cols.push({ key: "c1", header: "C1", align: "right", minWidth: 60 });
    if (vis("c2")) cols.push({ key: "c2", header: "C2", align: "right", minWidth: 60 });
    if (vis("c3")) cols.push({ key: "c3", header: "C3", align: "right", minWidth: 60 });
    if (vis("totalStock")) cols.push({ key: "totalStock", header: <SortHeader column="totalStock" sortKey={sortKey} sortDir={sortDir} onSort={onSort}>TOTAL</SortHeader>, align: "right", minWidth: 70 });
    if (vis("companies")) cols.push({ key: "companies", header: "COMPANIES", minWidth: 120 });
    return cols;
  }, [sortKey, sortDir, onSort, sizeUnit, hiddenColumns]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {/* Legend + Results count */}
      <div className="px-4 py-2 flex items-center gap-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <p
          className="text-[11px] uppercase tracking-wider"
          style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
        >
          Showing {filteredCount} of {totalAll} products
        </p>
        <div className="flex-1" />
        {(["C1", "C2", "C3"] as Classification[]).map((cls) => (
          <div key={cls} className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, backgroundColor: classColor(cls), display: "inline-block" }} />
            <span className="text-[11px] uppercase tracking-wider" style={{ color: classColor(cls) }}>
              {cls} — {classLabels[cls]}
            </span>
          </div>
        ))}
      </div>

      <DataTable<ProductSummary>
        columns={columns}
        data={products}
        rowKey={(row) => String(row.productId)}
        onRowClick={(row) => onSelectProduct(row.productId)}
        renderCell={(row, col, rowIndex) => renderProductCell(row, col.key, startIndex + rowIndex + 1, sizeUnit)}
        emptyMessage="No products found"
      />
    </div>
  );
}
