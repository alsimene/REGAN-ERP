"use client";

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

export default function LoadingOverlay({
  open,
  message = "Loading",
}: LoadingOverlayProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="px-8 py-6 flex flex-col items-center gap-4 animate-fade-up"
        style={{
          backgroundColor: "var(--input-bg)",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* Spinner */}
        <div
          className="w-6 h-6 rounded-full animate-spin"
          style={{
            border: "2px solid var(--border)",
            borderTop: "2px solid var(--foreground)",
          }}
        />
        <p
          className="text-xs uppercase tracking-widest"
          style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
