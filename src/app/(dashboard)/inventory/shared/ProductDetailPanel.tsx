"use client";

import type { ProductSummary, WarehouseBreakdown, StockMovement, Classification } from "../types";
import { classColor, formatNumber } from "../utils";
import { icons } from "../icons";
import DataTable, { type ColumnDef } from "@/app/components/DataTable";

const warehouseColumns: ColumnDef<WarehouseBreakdown>[] = [
  { key: "warehouse", header: "WAREHOUSE" },
  { key: "c1", header: "C1", align: "right" },
  { key: "c2", header: "C2", align: "right" },
  { key: "c3", header: "C3", align: "right" },
  { key: "total", header: "TOTAL", align: "right" },
];

interface Props {
  product: ProductSummary;
  warehouses: WarehouseBreakdown[];
  movements: StockMovement[];
  loading: boolean;
}

export default function ProductDetailPanel({ product, warehouses, movements, loading }: Props) {
  if (loading) {
    return (
      <div className="py-6 px-5">
        <p className="text-xs text-muted uppercase tracking-wider animate-pulse">Loading details...</p>
      </div>
    );
  }

  return (
    <div className="px-6 pt-4 pb-6 animate-fade-up">
      {/* Specs */}
      <div>
        <h4 className="text-[13px] font-medium uppercase tracking-widest mb-3" style={{ color: "var(--foreground)" }}>Specifications</h4>
        <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-[13px]">
          {(product.sizeInch || product.sizeMm) && <><span className="text-muted">Size</span><span>{product.sizeInch ?? product.sizeMm}</span></>}
          {product.thicknessMm && <><span className="text-muted">Thickness</span><span>{product.thicknessMm} mm</span></>}
          {product.flangeThicknessMm && <><span className="text-muted">Flange</span><span>{product.flangeThicknessMm} mm</span></>}
          {product.lengthM !== null && <><span className="text-muted">Length</span><span>{product.lengthM} m</span></>}
          {product.kgPerM !== null && product.kgPerM > 0 && <><span className="text-muted">Kg/m</span><span>{product.kgPerM.toFixed(3)}</span></>}
          {product.weightPerLength !== null && product.weightPerLength > 0 && <><span className="text-muted">Wt/pcs</span><span>{product.weightPerLength.toFixed(3)}</span></>}
          {product.weightPer20ft !== null && product.weightPer20ft > 0 && <><span className="text-muted">Wt/20ft</span><span>{product.weightPer20ft.toFixed(1)} kg</span></>}
        </div>
      </div>

      {/* Warehouse breakdown */}
      <div>
        <div className="flex items-center gap-2 mb-3 mt-3">
          {icons.warehouse}
          <h4 className="text-[13px] font-medium uppercase tracking-widest" style={{ color: "var(--foreground)" }}>
            Warehouse Breakdown
          </h4>
        </div>
        {warehouses.length === 0 ? (
          <p className="text-[13px] text-muted">No warehouse data</p>
        ) : (
          (() => {
            // Group warehouses by company, maintaining Regan → Kirin → Supremo order
            const grouped: { company: string; items: WarehouseBreakdown[] }[] = [];
            for (const wh of warehouses) {
              const last = grouped[grouped.length - 1];
              if (last && last.company === wh.company) {
                last.items.push(wh);
              } else {
                grouped.push({ company: wh.company, items: [wh] });
              }
            }
            return (
              <div className="space-y-4">
                {grouped.map((group) => (
                  <div key={group.company}>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted mb-1.5">{group.company}</p>
                    <DataTable<WarehouseBreakdown>
                      columns={warehouseColumns}
                      data={group.items}
                      rowKey={(wh) => wh.warehouse}
                      renderCell={(wh, col) => {
                        switch (col.key) {
                          case "warehouse":
                            return <span className="text-[13px] text-muted">{wh.warehouse}</span>;
                          case "c1":
                            return <span className="text-[13px] font-bold tabular-nums" style={{ color: classColor("C1") }}>{formatNumber(wh.c1)}</span>;
                          case "c2":
                            return <span className="text-[13px] font-bold tabular-nums" style={{ color: classColor("C2") }}>{formatNumber(wh.c2)}</span>;
                          case "c3":
                            return <span className="text-[13px] font-bold tabular-nums" style={{ color: classColor("C3") }}>{formatNumber(wh.c3)}</span>;
                          case "total":
                            return <span className="text-[13px] font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{formatNumber(wh.c1 + wh.c2 + wh.c3)}</span>;
                          default:
                            return null;
                        }
                      }}
                      emptyMessage=""
                    />
                  </div>
                ))}
              </div>
            );
          })()
        )}
      </div>

      {/* Recent movements */}
      <div>
        <div className="flex items-center gap-2 mb-3 mt-3">
          {icons.clock}
          <h4 className="text-[13px] font-medium uppercase tracking-widest" style={{ color: "var(--foreground)" }}>
            Recent Movements
          </h4>
        </div>
        {movements.length === 0 ? (
          <p className="text-[13px] text-muted">No recent movements</p>
        ) : (
          <div className="space-y-1">
            {movements.map((mv) => {
              const isPositive = mv.type === "adjustment_add" || mv.type === "restock" || mv.type === "receive";
              return (
                <div
                  key={mv.id}
                  className="flex items-center justify-between py-2 px-3 text-[13px]"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="font-bold tabular-nums"
                        style={{ color: isPositive ? "var(--class-c1)" : "var(--accent)" }}
                      >
                        {isPositive ? "+" : ""}{mv.quantity}
                      </span>
                      <span className="text-muted uppercase text-[11px]">{mv.type.replace(/_/g, " ")}</span>
                      <span style={{ color: classColor(mv.classification as Classification) }} className="text-[11px]">{mv.classification}</span>
                    </div>
                    <div className="text-[11px] text-muted mt-0.5">
                      {mv.warehouse}{mv.performedBy ? ` — ${mv.performedBy}` : ""}
                    </div>
                  </div>
                  <div className="text-[11px] text-muted whitespace-nowrap ml-3 text-right">
                    <div>{new Date(mv.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</div>
                    <div>{new Date(mv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
