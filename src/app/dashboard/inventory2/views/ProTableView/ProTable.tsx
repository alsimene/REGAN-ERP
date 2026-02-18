"use client";

import type { ProductSummary, SortKey, SortDir, SizeUnit, Classification } from "../../types";
import { classColor, sizeColumnLabel, thickColumnLabel } from "../../utils";
import { icons } from "../../icons";
import ProTableRow from "./ProTableRow";

const classLabels: Record<Classification, string> = {
  C1: "Good to Sell",
  C2: "Needs Repair",
  C3: "Not for Sale",
};

interface Props {
  products: ProductSummary[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  sizeUnit: SizeUnit;
  hiddenColumns: Set<string>;
  startIndex: number;
  selectedId: number | null;
  onSelectProduct: (id: number | null) => void;
}

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return null;
  return <span className="ml-0.5 inline-block">{dir === "asc" ? icons.sortAsc : icons.sortDesc}</span>;
}

export default function ProTable({ products, sortKey, sortDir, onSort, sizeUnit, hiddenColumns, startIndex, selectedId, onSelectProduct }: Props) {
  const vis = (key: string) => !hiddenColumns.has(key);

  const thClass = "py-2.5 px-3 text-[12px] font-medium uppercase tracking-widest text-muted whitespace-nowrap text-left";
  const thStyle = { position: "sticky" as const, top: 0, zIndex: 2, borderBottom: "1px solid var(--border)" };
  const sortableClass = thClass + " cursor-pointer select-none";

  return (
    <div className="overflow-auto" style={{ maxHeight: "72vh" }}>
      {/* Legend */}
      <div className="px-4 py-2 flex items-center justify-end gap-5" style={{ borderBottom: "1px solid var(--border)" }}>
        {(["C1", "C2", "C3"] as Classification[]).map((cls) => (
          <div key={cls} className="flex items-center gap-1.5">
            <span style={{ width: 8, height: 8, backgroundColor: classColor(cls), display: "inline-block" }} />
            <span className="text-[11px] uppercase tracking-wider" style={{ color: classColor(cls) }}>
              {cls} — {classLabels[cls]}
            </span>
          </div>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span style={{ color: "var(--muted)" }}>{icons.search}</span>
          <p className="text-sm uppercase tracking-wider" style={{ color: "var(--muted)" }}>
            No products found
          </p>
        </div>
      ) : (
        <table className="inv-table w-full" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr>
              <th className={thClass} style={thStyle}>#</th>
              <th className={sortableClass} style={thStyle} onClick={() => onSort("sku")}>SKU <SortIndicator active={sortKey === "sku"} dir={sortDir} /></th>
              <th className={sortableClass} style={thStyle} onClick={() => onSort("name")}>PRODUCT <SortIndicator active={sortKey === "name"} dir={sortDir} /></th>
              {vis("category") && <th className={sortableClass} style={thStyle} onClick={() => onSort("category")}>CATEGORY <SortIndicator active={sortKey === "category"} dir={sortDir} /></th>}
              {vis("sizeMm") && <th className={thClass} style={thStyle}>{sizeColumnLabel(sizeUnit)}</th>}
              {vis("thicknessMm") && <th className={thClass} style={thStyle}>{thickColumnLabel(sizeUnit)}</th>}
              {vis("flangeThicknessMm") && <th className={thClass + " text-right"} style={thStyle}>FLANGE (MM)</th>}
              {vis("lengthM") && <th className={thClass + " text-right"} style={thStyle}>LEN (M)</th>}
              {vis("kgPerM") && <th className={thClass + " text-right"} style={thStyle}>KG/M</th>}
              {vis("weightPerLength") && <th className={thClass + " text-right"} style={thStyle}>WT/PCS</th>}
              {vis("weightPer20ft") && <th className={thClass + " text-right"} style={thStyle}>WT/20FT</th>}
              {vis("c1") && <th className={thClass + " text-right"} style={{ ...thStyle, color: classColor("C1"), borderLeft: "1px solid var(--border)" }}>C1</th>}
              {vis("c2") && <th className={thClass + " text-right"} style={{ ...thStyle, color: classColor("C2") }}>C2</th>}
              {vis("c3") && <th className={thClass + " text-right"} style={{ ...thStyle, color: classColor("C3") }}>C3</th>}
              {vis("totalStock") && <th className={sortableClass + " text-right"} style={{ ...thStyle, color: "var(--foreground)", borderLeft: "1px solid var(--border)" }} onClick={() => onSort("totalStock")}>TOTAL <SortIndicator active={sortKey === "totalStock"} dir={sortDir} /></th>}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <ProTableRow
                key={p.productId}
                product={p}
                index={startIndex + i + 1}
                isSelected={selectedId === p.productId}
                onClick={() => onSelectProduct(selectedId === p.productId ? null : p.productId)}
                sizeUnit={sizeUnit}
                hiddenColumns={hiddenColumns}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
