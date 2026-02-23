"use client";

import { ReactNode } from "react";
import type { ProductSummary, SizeUnit } from "../../types";
import { classColor, displaySize, convertSize, formatNumber } from "../../utils";

export function renderProductCell(
  p: ProductSummary,
  colKey: string,
  index: number,
  sizeUnit: SizeUnit,
): ReactNode {
  const isOut = p.totalStock === 0;

  switch (colKey) {
    case "#":
      return <span className="text-[12px] text-muted tabular-nums">{index}</span>;
    case "sku":
      return <span className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>{p.sku}</span>;
    case "name":
      return (
        <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--foreground)" }}>
          {p.name}
          {isOut && <span className="text-[9px] uppercase px-1.5 py-0.5" style={{ color: "var(--accent)", border: "1px solid var(--accent)" }}>OUT</span>}
        </div>
      );
    case "status":
      return (
        <span
          className="text-[11px] uppercase px-2 py-0.5 font-medium tracking-wider"
          style={{
            color: p.status ? "var(--class-c1)" : "var(--accent)",
            backgroundColor: p.status ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          }}
        >
          {p.status ? "Active" : "Disabled"}
        </span>
      );
    case "category":
      return <span className="text-[13px] text-muted">{p.category}</span>;
    case "sizeMm":
      return <span className="text-[13px] text-muted">{displaySize(p.sizeMm, p.sizeInch, sizeUnit)}</span>;
    case "thicknessMm":
      return <span className="text-[13px] text-muted">{convertSize(p.thicknessMm, sizeUnit)}</span>;
    case "flangeThicknessMm":
      return <span className="text-[13px] text-muted tabular-nums">{p.flangeThicknessMm ?? "—"}</span>;
    case "lengthM":
      return <span className="text-[13px] text-muted tabular-nums">{p.lengthM !== null ? p.lengthM.toFixed(1) : "—"}</span>;
    case "kgPerM":
      return <span className="text-[13px] text-muted tabular-nums">{p.kgPerM !== null && p.kgPerM > 0 ? p.kgPerM.toFixed(3) : "—"}</span>;
    case "weightPerLength":
      return <span className="text-[13px] text-muted tabular-nums">{p.weightPerLength !== null && p.weightPerLength > 0 ? p.weightPerLength.toFixed(3) : "—"}</span>;
    case "weightPer20ft":
      return <span className="text-[13px] text-muted tabular-nums">{p.weightPer20ft !== null && p.weightPer20ft > 0 ? p.weightPer20ft.toFixed(1) : "—"}</span>;
    case "c1":
      return <span className="text-[13px] font-bold tabular-nums" style={{ color: classColor("C1") }}>{formatNumber(p.c1)}</span>;
    case "c2":
      return <span className="text-[13px] font-bold tabular-nums" style={{ color: classColor("C2") }}>{formatNumber(p.c2)}</span>;
    case "c3":
      return <span className="text-[13px] font-bold tabular-nums" style={{ color: classColor("C3") }}>{formatNumber(p.c3)}</span>;
    case "totalStock":
      return (
        <span className="text-[13px] font-bold tabular-nums" style={{ color: isOut ? "var(--accent)" : "var(--foreground)" }}>
          {formatNumber(p.totalStock)}
        </span>
      );
    case "companies":
      return p.companies.length > 0 ? (
        <div className="flex items-center gap-1 flex-wrap">
          {p.companies.map((c) => (
            <span
              key={c}
              className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 font-medium"
              style={{
                color: "var(--foreground)",
                backgroundColor: "var(--input-bg)",
                border: "1px solid var(--border)",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      ) : (
        <span className="text-[12px]" style={{ color: "var(--muted)" }}>—</span>
      );
    default:
      return null;
  }
}
