"use client";

import { useEffect, useRef } from "react";
import type { ProductSummary, WarehouseBreakdown, StockMovement } from "../types";
import { icons } from "../icons";
import ProductDetailPanel from "./ProductDetailPanel";

interface Props {
  product: ProductSummary;
  warehouses: WarehouseBreakdown[];
  movements: StockMovement[];
  loading: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({ product, warehouses, movements, loading, onClose }: Props) {
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
        aria-label={`${product.sku} — ${product.name}`}
        className="w-full max-w-xl mx-4 outline-none animate-fade-up"
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
          <div className="min-w-0">
            <p className="text-[12px] text-muted uppercase tracking-widest truncate">
              {product.category}
            </p>
            <h3
              className="text-sm font-medium uppercase tracking-widest truncate mt-1"
              style={{ color: "var(--foreground)", fontFamily: "var(--font-display)" }}
            >
              {product.name}
            </h3>
            <p className="text-[13px] text-muted truncate mt-1">
              {product.sku}
            </p>
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
          <ProductDetailPanel
            product={product}
            warehouses={warehouses}
            movements={movements}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
