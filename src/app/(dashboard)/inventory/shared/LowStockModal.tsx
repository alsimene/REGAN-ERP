"use client";

import { useEffect, useRef, ReactNode } from "react";
import type { LowStockItem } from "../types";
import { classColor, formatNumber } from "../utils";
import { icons } from "../icons";
import DataTable, { type ColumnDef } from "@/app/components/DataTable";

interface Props {
  items: LowStockItem[];
  loading: boolean;
  onClose: () => void;
}

const columns: ColumnDef<LowStockItem>[] = [
  { key: "sku", header: "SKU", minWidth: 80 },
  { key: "name", header: "PRODUCT", minWidth: 140 },
  { key: "category", header: "CATEGORY", minWidth: 100 },
  { key: "c1", header: "C1", align: "right", minWidth: 50 },
  { key: "c2", header: "C2", align: "right", minWidth: 50 },
  { key: "c3", header: "C3", align: "right", minWidth: 50 },
  { key: "totalStock", header: "TOTAL", align: "right", minWidth: 60 },
  { key: "pct", header: "LEVEL", align: "right", minWidth: 60 },
];

function renderCell(item: LowStockItem, col: ColumnDef<LowStockItem>): ReactNode {
  switch (col.key) {
    case "sku":
      return <span className="text-[13px] font-medium" style={{ color: "var(--foreground)" }}>{item.sku}</span>;
    case "name":
      return <span className="text-[13px]" style={{ color: "var(--foreground)" }}>{item.name}</span>;
    case "category":
      return <span className="text-[13px] text-muted">{item.category}</span>;
    case "c1":
      return <span className="text-[13px] font-bold tabular-nums" style={{ color: classColor("C1") }}>{formatNumber(item.c1)}</span>;
    case "c2":
      return <span className="text-[13px] font-bold tabular-nums" style={{ color: classColor("C2") }}>{formatNumber(item.c2)}</span>;
    case "c3":
      return <span className="text-[13px] font-bold tabular-nums" style={{ color: classColor("C3") }}>{formatNumber(item.c3)}</span>;
    case "totalStock":
      return <span className="text-[13px] font-bold tabular-nums" style={{ color: "var(--accent)" }}>{formatNumber(item.totalStock)}</span>;
    case "pct":
      return (
        <div className="flex items-center gap-2 justify-end">
          <div style={{ width: 40, height: 4, backgroundColor: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(item.pct, 100)}%`, height: "100%", backgroundColor: "var(--accent)", borderRadius: 2 }} />
          </div>
          <span className="text-[11px] tabular-nums" style={{ color: "var(--accent)", minWidth: 28, textAlign: "right" }}>
            {item.pct}%
          </span>
        </div>
      );
    default:
      return null;
  }
}

export default function LowStockModal({ items, loading, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Low Stock Alerts"
        className="w-full max-w-4xl mx-4 outline-none animate-fade-up"
        style={{
          backgroundColor: "var(--background)",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 flex items-center justify-center"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              {icons.alert}
            </div>
            <div>
              <h3
                className="text-sm font-medium uppercase tracking-widest"
                style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}
              >
                Low Stock Alerts
              </h3>
              <p className="text-[11px] text-muted uppercase tracking-wider mt-0.5">
                {items.length} products below threshold
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 cursor-pointer p-1.5 text-muted"
            style={{ transition: "color 0.15s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            aria-label="Close"
          >
            {icons.x}
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="py-8 px-5">
              <p className="text-xs text-muted uppercase tracking-wider animate-pulse text-center">Loading alerts...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-8 px-5">
              <p className="text-sm text-muted text-center">No low stock items</p>
            </div>
          ) : (
            <DataTable<LowStockItem>
              columns={columns}
              data={items}
              rowKey={(item) => item.productId}
              renderCell={renderCell}
              emptyMessage="No low stock items"
            />
          )}
        </div>
      </div>
    </div>
  );
}
