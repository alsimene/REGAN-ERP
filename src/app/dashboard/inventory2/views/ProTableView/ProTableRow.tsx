"use client";

import type { ProductSummary, SizeUnit } from "../../types";
import { classColor, displaySize, convertSize, formatNumber } from "../../utils";
import { icons } from "../../icons";

interface Props {
  product: ProductSummary;
  index: number;
  isSelected: boolean;
  onClick: () => void;
  sizeUnit: SizeUnit;
  hiddenColumns: Set<string>;
}

export default function ProTableRow({ product: p, index, isSelected, onClick, sizeUnit, hiddenColumns }: Props) {
  const isLow = p.capacity > 0 && p.totalStock < p.capacity * 0.2 && p.totalStock > 0;
  const isOut = p.totalStock === 0;
  const vis = (key: string) => !hiddenColumns.has(key);

  return (
    <tr
      className="cursor-pointer"
      style={{
        borderBottom: "1px solid var(--border)",
        borderLeft: isSelected ? "2px solid var(--accent)" : "2px solid transparent",
        backgroundColor: isSelected ? "var(--row-hover)" : undefined,
      }}
      onClick={onClick}
    >
      <td className="px-3 py-2.5 text-[12px] text-muted whitespace-nowrap tabular-nums">{index}</td>
      <td className="px-3 py-2.5 text-[13px] font-medium whitespace-nowrap" style={{ color: "var(--foreground)" }}>{p.sku}</td>
      <td className="px-3 py-2.5 text-[13px] whitespace-nowrap" style={{ color: "var(--foreground)" }}>
        <div className="flex items-center gap-2">
          {p.name}
          {isLow && <span style={{ color: "var(--accent)" }}>{icons.alert}</span>}
          {isOut && <span className="text-[9px] uppercase px-1.5 py-0.5" style={{ color: "var(--accent)", border: "1px solid var(--accent)" }}>OUT</span>}
        </div>
      </td>
      {vis("category") && <td className="px-3 py-2.5 text-[13px] text-muted whitespace-nowrap">{p.category}</td>}
      {vis("sizeMm") && <td className="px-3 py-2.5 text-[13px] text-muted whitespace-nowrap">{displaySize(p.sizeMm, p.sizeInch, sizeUnit)}</td>}
      {vis("thicknessMm") && <td className="px-3 py-2.5 text-[13px] text-muted whitespace-nowrap">{convertSize(p.thicknessMm, sizeUnit)}</td>}
      {vis("flangeThicknessMm") && <td className="px-3 py-2.5 text-[13px] text-right text-muted whitespace-nowrap tabular-nums">{p.flangeThicknessMm ?? "—"}</td>}
      {vis("lengthM") && <td className="px-3 py-2.5 text-[13px] text-right text-muted whitespace-nowrap tabular-nums">{p.lengthM !== null ? p.lengthM.toFixed(1) : "—"}</td>}
      {vis("kgPerM") && <td className="px-3 py-2.5 text-[13px] text-right text-muted whitespace-nowrap tabular-nums">{p.kgPerM !== null && p.kgPerM > 0 ? p.kgPerM.toFixed(3) : "—"}</td>}
      {vis("weightPerLength") && <td className="px-3 py-2.5 text-[13px] text-right text-muted whitespace-nowrap tabular-nums">{p.weightPerLength !== null && p.weightPerLength > 0 ? p.weightPerLength.toFixed(3) : "—"}</td>}
      {vis("weightPer20ft") && <td className="px-3 py-2.5 text-[13px] text-right text-muted whitespace-nowrap tabular-nums">{p.weightPer20ft !== null && p.weightPer20ft > 0 ? p.weightPer20ft.toFixed(1) : "—"}</td>}
      {vis("c1") && <td className="px-3 py-2.5 text-[13px] text-right font-bold whitespace-nowrap tabular-nums" style={{ color: classColor("C1"), borderLeft: "1px solid var(--border)" }}>{formatNumber(p.c1)}</td>}
      {vis("c2") && <td className="px-3 py-2.5 text-[13px] text-right font-bold whitespace-nowrap tabular-nums" style={{ color: classColor("C2") }}>{formatNumber(p.c2)}</td>}
      {vis("c3") && <td className="px-3 py-2.5 text-[13px] text-right font-bold whitespace-nowrap tabular-nums" style={{ color: classColor("C3") }}>{formatNumber(p.c3)}</td>}
      {vis("totalStock") && (
        <td className="px-3 py-2.5 text-[13px] text-right whitespace-nowrap font-bold tabular-nums" style={{ color: isLow || isOut ? "var(--accent)" : "var(--foreground)", borderLeft: "1px solid var(--border)" }}>
          {formatNumber(p.totalStock)}
        </td>
      )}
    </tr>
  );
}
