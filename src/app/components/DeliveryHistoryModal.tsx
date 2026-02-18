"use client";

import { useEffect, useRef, useState } from "react";

type DeliveryRecord = {
  id: number;
  processed_by: string | null;
  processed_by_name: string | null;
  notes: string | null;
  delivered_at: string;
  delivery_items: {
    id: number;
    qty: number;
    order_item_id: number;
    order_items: { products: { sku: string; name: string } | null } | null;
  }[];
};

interface OrderInfo {
  orderNumber: string;
  clientName: string;
  clientAddress?: string;
  clientCity?: string;
  clientPhone?: string;
}

interface DeliveryHistoryModalProps {
  open: boolean;
  deliveries: DeliveryRecord[];
  orderInfo: OrderInfo;
  onClose: () => void;
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function DeliveryHistoryModal({
  open,
  deliveries,
  orderInfo,
  onClose,
}: DeliveryHistoryModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  // null = list view, number = document view for that index
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (selectedIdx !== null) {
          setSelectedIdx(null);
        } else {
          onClose();
        }
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose, selectedIdx]);

  useEffect(() => {
    if (open) {
      setSelectedIdx(null);
      panelRef.current?.focus();
    }
  }, [open]);

  if (!open || deliveries.length === 0) return null;

  const selected = selectedIdx !== null ? deliveries[selectedIdx] : null;
  const batchNumber = selectedIdx !== null ? deliveries.length - selectedIdx : 0;
  const totalQty = selected
    ? selected.delivery_items.reduce((s, di) => s + di.qty, 0)
    : 0;

  function handlePrint() {
    if (selectedIdx === null) return;
    const el = printRef.current;
    if (!el) return;

    const bn = deliveries.length - selectedIdx;
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>DR-${orderInfo.orderNumber}-${bn}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #1a1a1a; padding: 40px; }
          .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #333; padding-bottom: 16px; }
          .header h1 { font-size: 20px; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 4px; }
          .header .subtitle { font-size: 11px; color: #666; letter-spacing: 2px; text-transform: uppercase; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; }
          .meta-block { }
          .meta-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px; }
          .meta-value { font-size: 13px; font-weight: 600; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th { background: #f5f5f0; padding: 8px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #ddd; color: #666; }
          .items-table td { padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 12px; }
          .items-table .num { text-align: center; }
          .items-table .sku { color: #888; font-size: 11px; }
          .items-table tfoot td { font-weight: 700; border-top: 2px solid #333; background: #f5f5f0; }
          .notes { margin-bottom: 30px; padding: 12px; background: #f9f9f5; border: 1px solid #eee; font-size: 12px; }
          .notes-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 48px; }
          .sig-block { width: 200px; text-align: center; }
          .sig-line { border-top: 1px solid #333; margin-bottom: 4px; margin-top: 40px; }
          .sig-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
          .sig-name { font-size: 11px; margin-top: 2px; }
          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 12px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        ${el.innerHTML}
        <script>window.onload = function() { window.print(); window.close(); }<\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  /* ─── LIST VIEW ─── */
  if (selectedIdx === null) {
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
          aria-label="Delivery History"
          className="w-full max-w-[600px] mx-4 animate-fade-up outline-none"
          style={{
            backgroundColor: "var(--input-bg)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center justify-between shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div>
              <h2
                className="text-sm uppercase tracking-[0.15em] font-[family-name:var(--font-display)]"
                style={{ color: "var(--foreground)" }}
              >
                Delivery History
              </h2>
              <span
                className="text-xs"
                style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
              >
                {orderInfo.orderNumber} &middot; {deliveries.length} batch{deliveries.length !== 1 ? "es" : ""}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 cursor-pointer"
              style={{ color: "var(--muted)", transition: "color 0.2s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Batch list */}
          <div className="overflow-y-auto flex-1">
            {deliveries.map((del, idx) => {
              const bn = deliveries.length - idx;
              const qty = del.delivery_items.reduce((s, di) => s + di.qty, 0);
              const itemCount = del.delivery_items.length;
              return (
                <button
                  key={del.id}
                  onClick={() => setSelectedIdx(idx)}
                  className="w-full text-left px-5 py-4 cursor-pointer"
                  style={{
                    borderBottom: "1px solid var(--border)",
                    transition: "background-color 0.15s ease",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--background)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Batch badge */}
                      <div
                        className="w-9 h-9 flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          backgroundColor: "var(--btn-bg)",
                          color: "var(--btn-text)",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {bn}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-medium truncate"
                            style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}
                          >
                            DR-{orderInfo.orderNumber}-{bn}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className="text-xs"
                            style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
                          >
                            {formatShortDate(del.delivered_at)}
                          </span>
                          {del.processed_by_name && (
                            <>
                              <span style={{ color: "var(--border)" }}>&middot;</span>
                              <span
                                className="text-xs truncate"
                                style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
                              >
                                {del.processed_by_name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Summary badges */}
                      <div className="text-right">
                        <div
                          className="text-xs"
                          style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}
                        >
                          {qty} pc{qty !== 1 ? "s" : ""}
                        </div>
                        <div
                          className="text-[10px]"
                          style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
                        >
                          {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </div>
                      </div>
                      {/* Arrow */}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ color: "var(--muted)" }}
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>

                  {/* Notes preview */}
                  {del.notes && (
                    <div
                      className="mt-2 text-xs truncate pl-12"
                      style={{ color: "var(--muted)", fontFamily: "var(--font-body)", fontStyle: "italic" }}
                    >
                      {del.notes}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ─── DOCUMENT VIEW ─── */
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(2px)" }}
      onClick={() => setSelectedIdx(null)}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Delivery Receipt"
        className="w-full max-w-[700px] mx-4 animate-fade-up outline-none"
        style={{
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div
          className="px-5 py-3 flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <button
            onClick={() => setSelectedIdx(null)}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-xs uppercase tracking-wider cursor-pointer"
            style={{
              color: "var(--foreground)",
              fontFamily: "var(--font-body)",
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to List
          </button>
          <div className="flex items-center gap-2">
            <span
              className="text-xs uppercase tracking-wider"
              style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
            >
              Batch {batchNumber} of {deliveries.length}
            </span>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs uppercase tracking-wider cursor-pointer"
              style={{
                color: "var(--btn-text)",
                backgroundColor: "var(--btn-bg)",
                fontFamily: "var(--font-body)",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print
            </button>
            <button
              onClick={() => setSelectedIdx(null)}
              className="p-1.5 cursor-pointer"
              style={{ color: "var(--muted)", transition: "color 0.2s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Document */}
        <div className="overflow-y-auto flex-1 p-5">
          <div
            style={{
              backgroundColor: "#fff",
              color: "#1a1a1a",
              border: "1px solid #ddd",
              fontFamily: "Arial, sans-serif",
            }}
          >
            {/* Hidden print content */}
            <div ref={printRef} style={{ display: "none" }}>
              <div className="header">
                <h1>BAKAL</h1>
                <div className="subtitle">Delivery Receipt</div>
              </div>
              <div className="meta">
                <div className="meta-block">
                  <div className="meta-label">DR Number</div>
                  <div className="meta-value">DR-{orderInfo.orderNumber}-{batchNumber}</div>
                  <div className="meta-label" style={{ marginTop: "8px" }}>PO Number</div>
                  <div className="meta-value">{orderInfo.orderNumber}</div>
                </div>
                <div className="meta-block">
                  <div className="meta-label">Delivery Date</div>
                  <div className="meta-value">{formatDateTime(selected!.delivered_at)}</div>
                  <div className="meta-label" style={{ marginTop: "8px" }}>Processed By</div>
                  <div className="meta-value">{selected!.processed_by_name || "\u2014"}</div>
                </div>
              </div>
              <div className="meta" style={{ borderTop: "1px solid #eee", paddingTop: "12px" }}>
                <div className="meta-block">
                  <div className="meta-label">Delivered To</div>
                  <div className="meta-value">{orderInfo.clientName}</div>
                  {orderInfo.clientAddress && <div style={{ fontSize: "11px", color: "#666", marginTop: "2px" }}>{orderInfo.clientAddress}</div>}
                  {orderInfo.clientCity && <div style={{ fontSize: "11px", color: "#666" }}>{orderInfo.clientCity}</div>}
                  {orderInfo.clientPhone && <div style={{ fontSize: "11px", color: "#666" }}>{orderInfo.clientPhone}</div>}
                </div>
              </div>
              <table className="items-table">
                <thead>
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th>SKU</th>
                    <th>Product</th>
                    <th className="num" style={{ width: "80px" }}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {selected!.delivery_items.map((di, i) => (
                    <tr key={di.id}>
                      <td className="num">{i + 1}</td>
                      <td className="sku">{di.order_items?.products?.sku ?? "\u2014"}</td>
                      <td>{di.order_items?.products?.name ?? "\u2014"}</td>
                      <td className="num">{di.qty}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} style={{ textAlign: "right" }}>Total Items</td>
                    <td className="num">{totalQty}</td>
                  </tr>
                </tfoot>
              </table>
              {selected!.notes && (
                <div className="notes">
                  <div className="notes-label">Remarks / Notes</div>
                  {selected!.notes}
                </div>
              )}
              <div className="signatures">
                <div className="sig-block">
                  <div className="sig-line"></div>
                  <div className="sig-label">Delivered By</div>
                  <div className="sig-name">{selected!.processed_by_name || ""}</div>
                </div>
                <div className="sig-block">
                  <div className="sig-line"></div>
                  <div className="sig-label">Received By</div>
                </div>
                <div className="sig-block">
                  <div className="sig-line"></div>
                  <div className="sig-label">Date Received</div>
                </div>
              </div>
              <div className="footer">
                DR-{orderInfo.orderNumber}-{batchNumber} &middot; Generated on {formatDate(new Date().toISOString())}
              </div>
            </div>

            {/* Visible document preview */}
            <div style={{ padding: "32px" }}>
              {/* Document Header */}
              <div style={{ textAlign: "center", marginBottom: "20px", borderBottom: "2px solid #333", paddingBottom: "14px" }}>
                <div style={{ fontSize: "20px", letterSpacing: "4px", textTransform: "uppercase" as const, fontWeight: 700 }}>
                  BAKAL
                </div>
                <div style={{ fontSize: "11px", color: "#888", letterSpacing: "2px", textTransform: "uppercase" as const, marginTop: "2px" }}>
                  Delivery Receipt
                </div>
              </div>

              {/* Meta grid */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "12px" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "#999", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "2px" }}>
                    DR Number
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>
                    DR-{orderInfo.orderNumber}-{batchNumber}
                  </div>
                  <div style={{ fontSize: "10px", color: "#999", textTransform: "uppercase" as const, letterSpacing: "1px", marginTop: "8px", marginBottom: "2px" }}>
                    PO Number
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {orderInfo.orderNumber}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "10px", color: "#999", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "2px" }}>
                    Delivery Date
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {formatDateTime(selected!.delivered_at)}
                  </div>
                  <div style={{ fontSize: "10px", color: "#999", textTransform: "uppercase" as const, letterSpacing: "1px", marginTop: "8px", marginBottom: "2px" }}>
                    Processed By
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {selected!.processed_by_name || "\u2014"}
                  </div>
                </div>
              </div>

              {/* Client info */}
              <div style={{ borderTop: "1px solid #eee", paddingTop: "12px", marginBottom: "16px" }}>
                <div style={{ fontSize: "10px", color: "#999", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "2px" }}>
                  Delivered To
                </div>
                <div style={{ fontWeight: 700, fontSize: "13px" }}>{orderInfo.clientName}</div>
                {orderInfo.clientAddress && (
                  <div style={{ fontSize: "11px", color: "#666", marginTop: "1px" }}>{orderInfo.clientAddress}</div>
                )}
                {orderInfo.clientCity && (
                  <div style={{ fontSize: "11px", color: "#666" }}>{orderInfo.clientCity}</div>
                )}
                {orderInfo.clientPhone && (
                  <div style={{ fontSize: "11px", color: "#666" }}>{orderInfo.clientPhone}</div>
                )}
              </div>

              {/* Items table */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "16px", fontSize: "12px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f0" }}>
                    <th style={{ padding: "8px 12px", textAlign: "center", fontSize: "10px", textTransform: "uppercase" as const, letterSpacing: "1px", borderBottom: "1px solid #ddd", color: "#888", width: "40px" }}>#</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "10px", textTransform: "uppercase" as const, letterSpacing: "1px", borderBottom: "1px solid #ddd", color: "#888" }}>SKU</th>
                    <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "10px", textTransform: "uppercase" as const, letterSpacing: "1px", borderBottom: "1px solid #ddd", color: "#888" }}>Product</th>
                    <th style={{ padding: "8px 12px", textAlign: "center", fontSize: "10px", textTransform: "uppercase" as const, letterSpacing: "1px", borderBottom: "1px solid #ddd", color: "#888", width: "80px" }}>Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {selected!.delivery_items.map((di, i) => (
                    <tr key={di.id}>
                      <td style={{ padding: "8px 12px", textAlign: "center", borderBottom: "1px solid #eee", color: "#999" }}>{i + 1}</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee", color: "#888", fontSize: "11px" }}>{di.order_items?.products?.sku ?? "\u2014"}</td>
                      <td style={{ padding: "8px 12px", borderBottom: "1px solid #eee" }}>{di.order_items?.products?.name ?? "\u2014"}</td>
                      <td style={{ padding: "8px 12px", textAlign: "center", borderBottom: "1px solid #eee", fontWeight: 600 }}>{di.qty}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: "#f5f5f0" }}>
                    <td colSpan={3} style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, borderTop: "2px solid #333", fontSize: "11px", textTransform: "uppercase" as const, letterSpacing: "1px" }}>
                      Total Items
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center", fontWeight: 700, borderTop: "2px solid #333", fontSize: "14px" }}>
                      {totalQty}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Notes */}
              {selected!.notes && (
                <div style={{ marginBottom: "20px", padding: "10px 12px", backgroundColor: "#f9f9f5", border: "1px solid #eee", fontSize: "12px" }}>
                  <div style={{ fontSize: "10px", color: "#999", textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: "4px" }}>
                    Remarks / Notes
                  </div>
                  {selected!.notes}
                </div>
              )}

              {/* Signature lines */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "36px" }}>
                {[
                  { label: "Delivered By", name: selected!.processed_by_name || "" },
                  { label: "Received By", name: "" },
                  { label: "Date Received", name: "" },
                ].map((sig) => (
                  <div key={sig.label} style={{ width: "160px", textAlign: "center" }}>
                    <div style={{ borderTop: "1px solid #333", marginTop: "36px", marginBottom: "4px" }} />
                    <div style={{ fontSize: "10px", color: "#999", textTransform: "uppercase" as const, letterSpacing: "1px" }}>
                      {sig.label}
                    </div>
                    {sig.name && (
                      <div style={{ fontSize: "11px", marginTop: "1px" }}>{sig.name}</div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{ marginTop: "28px", textAlign: "center", fontSize: "10px", color: "#bbb", borderTop: "1px solid #eee", paddingTop: "10px" }}>
                DR-{orderInfo.orderNumber}-{batchNumber} &middot; Generated on {formatDate(new Date().toISOString())}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
