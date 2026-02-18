"use client";

import { useEffect, useRef } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  children?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Go Back",
  variant = "warning",
  children,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  // Focus trap — focus the panel on open
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const confirmColor = variant === "danger" ? "var(--accent)" : "var(--draft)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(2px)" }}
      onClick={onCancel}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm mx-4 p-6 space-y-4 animate-fade-up outline-none"
        style={{
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className="text-sm uppercase tracking-wider font-[family-name:var(--font-display)]"
          style={{ color: confirmColor }}
        >
          {title}
        </h3>

        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
        >
          {message}
        </p>

        {children}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm uppercase tracking-wider cursor-pointer"
            style={{
              backgroundColor: confirmColor,
              color: "#fff",
              fontFamily: "var(--font-body)",
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm uppercase tracking-wider cursor-pointer"
            style={{
              color: "var(--muted)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-body)",
              transition: "border-color 0.2s ease",
            }}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
