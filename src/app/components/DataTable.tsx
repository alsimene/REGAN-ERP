"use client";

import { ReactNode } from "react";

/* ──────────────────────────────────────────
   DataTable — Uniform table component
   ──────────────────────────────────────────
   Standard table for all pages. Ensures consistent
   header style, cell spacing, row hover, empty state,
   and responsive overflow.

   Usage:
     <DataTable
       columns={[
         { key: "sku", header: "SKU" },
         { key: "name", header: "Name" },
         { key: "stock", header: "Stock", align: "right" },
       ]}
       data={products}
       rowKey={(row) => row.sku}
       renderCell={(row, col) => {
         if (col.key === "sku") return <span className="font-mono text-xs" style={{ color: "var(--accent)" }}>{row.sku}</span>;
         return row[col.key];
       }}
       emptyMessage="No products found."
     />
   ────────────────────────────────────────── */

export type ColumnDef<T> = {
  key: string;
  header: string | ReactNode;
  align?: "left" | "center" | "right";
  /** If true, header and cells get sticky positioning */
  sticky?: boolean;
  /** Optional min-width for the column */
  minWidth?: number;
};

type Props<T> = {
  columns: ColumnDef<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string | number;
  renderCell: (row: T, col: ColumnDef<T>, rowIndex: number) => ReactNode;
  /** Called when a row is clicked (optional) */
  onRowClick?: (row: T, index: number) => void;
  /** Message shown when data is empty */
  emptyMessage?: string;
  /** Optional className for the outer wrapper */
  className?: string;
};

export default function DataTable<T>({
  columns,
  data,
  rowKey,
  renderCell,
  onRowClick,
  emptyMessage = "No data found.",
  className = "",
}: Props<T>) {
  return (
    <div
      className={className}
      style={{ border: "1px solid var(--border)", overflow: "hidden" }}
    >
      <div className="overflow-x-auto">
        <table
          className="w-full text-sm"
          style={{
            fontFamily: "var(--font-body)",
            borderCollapse: "collapse",
          }}
        >
          {/* ── Header ── */}
          <thead>
            <tr
              style={{
                backgroundColor: "var(--input-bg)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs uppercase tracking-wider font-semibold whitespace-nowrap ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                        ? "text-center"
                        : "text-left"
                  }`}
                  style={{
                    color: "var(--muted)",
                    ...(col.sticky
                      ? { position: "sticky" as const, top: 0, zIndex: 2 }
                      : {}),
                    ...(col.minWidth ? { minWidth: col.minWidth } : {}),
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-sm"
                  style={{ color: "var(--muted)" }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={rowKey(row, i)}
                  className={onRowClick ? "cursor-pointer" : ""}
                  style={{
                    backgroundColor:
                      i % 2 === 0 ? "var(--row-even)" : "var(--row-odd)",
                    borderBottom: "1px solid var(--border)",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--row-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      i % 2 === 0 ? "var(--row-even)" : "var(--row-odd)";
                  }}
                  onClick={
                    onRowClick ? () => onRowClick(row, i) : undefined
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 whitespace-nowrap ${
                        col.align === "right"
                          ? "text-right"
                          : col.align === "center"
                            ? "text-center"
                            : "text-left"
                      }`}
                      style={{ color: "var(--foreground)" }}
                    >
                      {renderCell(row, col, i)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
