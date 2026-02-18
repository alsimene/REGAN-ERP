"use client";

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  filteredItems: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function Pagination({ currentPage, totalPages, totalItems, filteredItems, onPrev, onNext }: Props) {
  const countLabel =
    filteredItems !== totalItems
      ? `${filteredItems.toLocaleString()} of ${totalItems.toLocaleString()} items`
      : `${totalItems.toLocaleString()} items`;

  return (
    <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
      <span className="text-[13px] text-muted uppercase tracking-wider">{countLabel}</span>
      <div className="flex items-center gap-3">
        {totalPages > 1 && (
          <>
            <button
              onClick={onPrev}
              disabled={currentPage === 1}
              className="px-4 py-2 text-[13px] uppercase tracking-wider"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--background)",
                color: currentPage === 1 ? "var(--muted)" : "var(--foreground)",
                cursor: currentPage === 1 ? "default" : "pointer",
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              Prev
            </button>
            <span className="text-[13px] text-muted uppercase tracking-wider px-2">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={onNext}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-[13px] uppercase tracking-wider"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--background)",
                color: currentPage === totalPages ? "var(--muted)" : "var(--foreground)",
                cursor: currentPage === totalPages ? "default" : "pointer",
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </>
        )}
      </div>
    </div>
  );
}
