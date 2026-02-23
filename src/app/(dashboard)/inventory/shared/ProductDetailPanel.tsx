"use client";

import type { ProductSummary, WarehouseBreakdown, StockMovement, Classification } from "../types";
import { classColor, formatNumber } from "../utils";
import { icons } from "../icons";

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
    <div className="px-6 py-4 animate-fade-up">
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
        <div className="flex items-center gap-2 mb-3">
          {icons.warehouse}
          <h4 className="text-[13px] font-medium uppercase tracking-widest" style={{ color: "var(--foreground)" }}>
            Warehouse Breakdown
          </h4>
        </div>
        {warehouses.length === 0 ? (
          <p className="text-[13px] text-muted">No warehouse data</p>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="py-2 text-left text-[12px] uppercase tracking-widest text-muted">Warehouse</th>
                <th className="py-2 text-left text-[12px] uppercase tracking-widest text-muted">Company</th>
                <th className="py-2 text-right text-[12px] uppercase tracking-widest" style={{ color: classColor("C1") }}>C1</th>
                <th className="py-2 text-right text-[12px] uppercase tracking-widest" style={{ color: classColor("C2") }}>C2</th>
                <th className="py-2 text-right text-[12px] uppercase tracking-widest" style={{ color: classColor("C3") }}>C3</th>
                <th className="py-2 text-right text-[12px] uppercase tracking-widest text-muted">Total</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((wh) => (
                <tr key={wh.warehouse} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td className="py-2 text-muted">{wh.warehouse}</td>
                  <td className="py-2">
                    <span
                      className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 font-medium"
                      style={{ color: "var(--foreground)", backgroundColor: "var(--input-bg)", border: "1px solid var(--border)" }}
                    >
                      {wh.company}
                    </span>
                  </td>
                  <td className="py-2 text-right font-bold tabular-nums" style={{ color: classColor("C1") }}>{formatNumber(wh.c1)}</td>
                  <td className="py-2 text-right font-bold tabular-nums" style={{ color: classColor("C2") }}>{formatNumber(wh.c2)}</td>
                  <td className="py-2 text-right font-bold tabular-nums" style={{ color: classColor("C3") }}>{formatNumber(wh.c3)}</td>
                  <td className="py-2 text-right font-bold tabular-nums" style={{ color: "var(--foreground)" }}>{formatNumber(wh.c1 + wh.c2 + wh.c3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent movements */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          {icons.clock}
          <h4 className="text-[13px] font-medium uppercase tracking-widest" style={{ color: "var(--foreground)" }}>
            Recent Movements
          </h4>
        </div>
        {movements.length === 0 ? (
          <p className="text-[13px] text-muted">No recent movements</p>
        ) : (
          <div className="space-y-1 max-h-56 overflow-y-auto">
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
                  <span className="text-[11px] text-muted whitespace-nowrap ml-3">
                    {new Date(mv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
