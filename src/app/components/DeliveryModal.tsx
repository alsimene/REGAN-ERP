"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";

interface DeliveryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  delivered_qty: number;
}

interface DeliveryModalProps {
  open: boolean;
  items: DeliveryItem[];
  saving: boolean;
  onSubmit: (deliveries: { order_item_id: string; qty: number }[], notes: string) => void;
  onCancel: () => void;
}

export default function DeliveryModal({
  open,
  items,
  saving,
  onSubmit,
  onCancel,
}: DeliveryModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDiscardWarning, setShowDiscardWarning] = useState(false);

  // Split items: pending vs completed
  const { pendingItems, completedItems } = useMemo(() => {
    const pending: DeliveryItem[] = [];
    const completed: DeliveryItem[] = [];
    for (const item of items) {
      if (item.delivered_qty >= item.quantity) {
        completed.push(item);
      } else {
        pending.push(item);
      }
    }
    return { pendingItems: pending, completedItems: completed };
  }, [items]);

  // Check if there's any unsaved data
  const hasDirtyData = useMemo(() => {
    const hasQty = Object.values(quantities).some((v) => v !== "" && parseInt(v, 10) > 0);
    return hasQty || notes.trim().length > 0;
  }, [quantities, notes]);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      const initial: Record<string, string> = {};
      for (const item of items) {
        initial[item.id] = "";
      }
      setQuantities(initial);
      setNotes("");
      setErrors({});
      setShowDiscardWarning(false);
      panelRef.current?.focus();
    }
  }, [open, items]);

  // Safe cancel — warn if dirty
  const handleSafeCancel = useCallback(() => {
    if (hasDirtyData) {
      setShowDiscardWarning(true);
    } else {
      onCancel();
    }
  }, [hasDirtyData, onCancel]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleSafeCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, handleSafeCancel]);

  if (!open) return null;

  // Build remaining map for quick lookup
  const remainingMap: Record<string, number> = {};
  for (const item of pendingItems) {
    remainingMap[item.id] = item.quantity - item.delivered_qty;
  }

  const parsedQuantities = Object.fromEntries(
    Object.entries(quantities).map(([id, val]) => [id, Math.max(0, parseInt(val, 10) || 0)])
  );

  // Validate a single item
  function validateItem(itemId: string, val: number): string | null {
    const remaining = remainingMap[itemId];
    if (remaining === undefined) return null;
    if (val < 0) return "Cannot be negative";
    if (val > remaining) return `Exceeds remaining (${remaining})`;
    return null;
  }

  // Check for any validation errors
  const hasErrors = Object.values(errors).some((e) => e.length > 0);
  const hasAnyQty = Object.values(parsedQuantities).some((q) => q > 0);
  const canSubmit = hasAnyQty && !hasErrors && !saving;

  // Count items being delivered and total pieces
  const deliveringCount = Object.values(parsedQuantities).filter((q) => q > 0).length;
  const deliveringTotal = Object.values(parsedQuantities).reduce((s, q) => s + q, 0);

  function handleQuantityChange(itemId: string, rawValue: string) {
    setQuantities((prev) => ({ ...prev, [itemId]: rawValue }));

    // Real-time validation
    const val = parseInt(rawValue, 10);
    if (rawValue === "" || isNaN(val)) {
      setErrors((prev) => ({ ...prev, [itemId]: "" }));
      return;
    }
    const error = validateItem(itemId, val);
    setErrors((prev) => ({ ...prev, [itemId]: error ?? "" }));
  }

  function handleQuantityBlur(itemId: string) {
    const raw = quantities[itemId] ?? "";
    const val = parseInt(raw, 10);
    const remaining = remainingMap[itemId] ?? 0;

    if (isNaN(val) || val <= 0) {
      setQuantities((prev) => ({ ...prev, [itemId]: "" }));
      setErrors((prev) => ({ ...prev, [itemId]: "" }));
      return;
    }

    // Clamp to remaining
    const clamped = Math.min(val, remaining);
    setQuantities((prev) => ({ ...prev, [itemId]: String(clamped) }));
    setErrors((prev) => ({ ...prev, [itemId]: "" }));
  }

  function handleFillAll() {
    const filled: Record<string, string> = { ...quantities };
    const cleared: Record<string, string> = {};
    for (const item of pendingItems) {
      const remaining = item.quantity - item.delivered_qty;
      if (remaining > 0) {
        filled[item.id] = String(remaining);
        cleared[item.id] = "";
      }
    }
    setQuantities(filled);
    setErrors(cleared);
  }

  function handleClearAll() {
    const cleared: Record<string, string> = { ...quantities };
    const clearedErrors: Record<string, string> = {};
    for (const item of pendingItems) {
      cleared[item.id] = "";
      clearedErrors[item.id] = "";
    }
    setQuantities(cleared);
    setErrors(clearedErrors);
  }

  function handleSubmit() {
    // Final validation pass
    let valid = true;
    const newErrors: Record<string, string> = {};
    for (const item of pendingItems) {
      const val = parsedQuantities[item.id] ?? 0;
      if (val <= 0) continue;
      const error = validateItem(item.id, val);
      if (error) {
        newErrors[item.id] = error;
        valid = false;
      }
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (!valid) return;

    const deliveries = Object.entries(parsedQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ order_item_id: id, qty }));
    onSubmit(deliveries, notes.trim());
  }

  // Discard warning overlay
  if (showDiscardWarning) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(2px)" }}
      >
        <div
          className="w-full max-w-sm mx-4 p-6 space-y-4 animate-fade-up"
          style={{
            backgroundColor: "var(--input-bg)",
            border: "1px solid var(--border)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div className="flex items-center gap-3">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--draft)", flexShrink: 0 }}
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h3
              className="text-sm uppercase tracking-wider font-[family-name:var(--font-display)]"
              style={{ color: "var(--draft)" }}
            >
              Discard Changes?
            </h3>
          </div>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
          >
            You have unsaved delivery data. Are you sure you want to discard your changes?
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setShowDiscardWarning(false);
                onCancel();
              }}
              className="flex-1 px-4 py-2.5 text-sm uppercase tracking-wider cursor-pointer"
              style={{
                backgroundColor: "var(--accent)",
                color: "#fff",
                fontFamily: "var(--font-body)",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Discard
            </button>
            <button
              onClick={() => setShowDiscardWarning(false)}
              className="flex-1 px-4 py-2.5 text-sm uppercase tracking-wider cursor-pointer"
              style={{
                color: "var(--muted)",
                border: "1px solid var(--border)",
                fontFamily: "var(--font-body)",
                transition: "border-color 0.2s ease",
              }}
            >
              Keep Editing
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(2px)" }}
      onClick={handleSafeCancel}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Record Delivery"
        className="w-full max-w-2xl mx-4 animate-fade-up outline-none"
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
          className="px-6 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h3
              className="text-sm uppercase tracking-wider font-[family-name:var(--font-display)]"
              style={{ color: "var(--foreground)" }}
            >
              Record Delivery
            </h3>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
            >
              {pendingItems.length} item{pendingItems.length !== 1 ? "s" : ""} remaining
              {completedItems.length > 0 && (
                <span style={{ color: "var(--class-c1)" }}>
                  {" "}&middot; {completedItems.length} fully delivered
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleSafeCancel}
            className="p-1 cursor-pointer"
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

        {/* Quick actions */}
        <div
          className="px-6 py-2.5 flex items-center gap-3 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <button
            onClick={handleFillAll}
            className="text-xs uppercase tracking-wider cursor-pointer px-3 py-1.5"
            style={{
              color: "var(--btn-text)",
              backgroundColor: "var(--btn-bg)",
              fontFamily: "var(--font-body)",
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Fill All Remaining
          </button>
          <button
            onClick={handleClearAll}
            className="text-xs uppercase tracking-wider cursor-pointer px-3 py-1.5"
            style={{
              color: "var(--muted)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-body)",
              transition: "border-color 0.2s ease",
            }}
          >
            Clear All
          </button>
        </div>

        {/* Scrollable items */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0" style={{ backgroundColor: "var(--input-bg)" }}>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Product", "Remaining", "Deliver"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pendingItems.map((item) => {
                const remaining = item.quantity - item.delivered_qty;
                const currentVal = parsedQuantities[item.id] ?? 0;
                const isFilled = currentVal > 0;
                const itemError = errors[item.id] ?? "";
                const hasError = itemError.length > 0;
                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      backgroundColor: hasError
                        ? "rgba(200, 50, 50, 0.06)"
                        : isFilled
                          ? "rgba(76, 175, 80, 0.04)"
                          : "transparent",
                    }}
                  >
                    <td className="px-5 py-3 text-foreground whitespace-nowrap">
                      <span className="text-muted text-xs mr-1">{item.sku}</span>{" "}
                      {item.name}
                      <span
                        className="ml-2 text-xs"
                        style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
                      >
                        ({item.delivered_qty}/{item.quantity})
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "var(--draft)" }}
                      >
                        {remaining.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <input
                            type="number"
                            min={0}
                            max={remaining}
                            value={quantities[item.id] ?? ""}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            onBlur={() => handleQuantityBlur(item.id)}
                            placeholder="0"
                            className="w-20 px-3 py-1.5 text-sm text-foreground outline-none text-center"
                            style={{
                              backgroundColor: "var(--background)",
                              border: `1px solid ${hasError ? "var(--accent)" : isFilled ? "var(--class-c1)" : "var(--border)"}`,
                              fontFamily: "var(--font-body)",
                              transition: "border-color 0.2s ease",
                            }}
                          />
                          {hasError && (
                            <p
                              className="text-[10px] mt-0.5"
                              style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
                            >
                              {itemError}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setQuantities((prev) => ({ ...prev, [item.id]: String(remaining) }));
                            setErrors((prev) => ({ ...prev, [item.id]: "" }));
                          }}
                          className="text-[10px] uppercase tracking-wider cursor-pointer px-2 py-1"
                          style={{
                            color: "var(--muted)",
                            border: "1px solid var(--border)",
                            fontFamily: "var(--font-body)",
                            transition: "color 0.2s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                          title="Fill remaining"
                        >
                          Max
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div className="px-6 py-3 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          <label
            className="block text-xs uppercase tracking-widest mb-1.5"
            style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
          >
            Notes (truck, driver, remarks)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm text-foreground outline-none"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-body)",
            }}
            placeholder="e.g. Truck #5 - Driver Pedro"
          />
        </div>

        {/* Footer with summary */}
        <div
          className="px-6 py-4 flex items-center gap-3 shrink-0"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <span
            className="text-xs mr-auto"
            style={{
              color: hasErrors ? "var(--accent)" : hasAnyQty ? "var(--class-c1)" : "var(--muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            {hasErrors
              ? "Fix errors before submitting"
              : hasAnyQty
                ? `Delivering ${deliveringTotal} pcs across ${deliveringCount} item${deliveringCount !== 1 ? "s" : ""}`
                : "Enter quantities to deliver"}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-5 py-2.5 text-sm uppercase tracking-wider"
            style={{
              backgroundColor: canSubmit ? "var(--btn-bg)" : "var(--border)",
              color: canSubmit ? "var(--btn-text)" : "var(--muted)",
              fontFamily: "var(--font-body)",
              transition: "opacity 0.2s ease",
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
            onMouseEnter={(e) => {
              if (canSubmit) e.currentTarget.style.opacity = "0.85";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {saving ? "Saving..." : "Confirm Delivery"}
          </button>
          <button
            onClick={handleSafeCancel}
            disabled={saving}
            className="px-5 py-2.5 text-sm uppercase tracking-wider cursor-pointer"
            style={{
              color: "var(--muted)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-body)",
              transition: "border-color 0.2s ease",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
