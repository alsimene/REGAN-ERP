"use client";

import { useState, useRef, useEffect } from "react";
import { icons } from "../../icons";
import type { SizeUnit, ColumnDef } from "../../types";

interface Props {
  sizeUnit: SizeUnit;
  onSizeUnitChange: (unit: SizeUnit) => void;
  columns: ColumnDef[];
  hiddenColumns: Set<string>;
  onToggleColumn: (key: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const unitOptions: { value: SizeUnit; label: string }[] = [
  { value: "original", label: "AUTO" },
  { value: "in", label: 'IN "' },
  { value: "mm", label: "MM" },
];

export default function ProToolbar({ sizeUnit, onSizeUnitChange, columns, hiddenColumns, onToggleColumn, searchQuery, onSearchChange }: Props) {
  const [colOpen, setColOpen] = useState(false);
  const colRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (colRef.current && !colRef.current.contains(e.target as Node)) setColOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hiddenCount = hiddenColumns.size;

  return (
    <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none">{icons.search}</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="e.g. equal angle 20x20 2.0"
          className="w-full py-2 pl-9 pr-8 text-[13px]"
          style={{
            backgroundColor: "transparent",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
            outline: "none",
            fontFamily: "var(--font-body)",
            transition: "border-color 0.15s ease",
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "var(--foreground)")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted"
            style={{ transition: "color 0.15s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            {icons.x}
          </button>
        )}
      </div>

      {/* Unit toggle */}
      <div className="flex items-center" style={{ border: "1px solid var(--border)" }}>
        {unitOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSizeUnitChange(opt.value)}
            className="px-3 py-2 text-[12px] uppercase tracking-wider cursor-pointer"
            style={{
              backgroundColor: sizeUnit === opt.value ? "var(--foreground)" : "transparent",
              color: sizeUnit === opt.value ? "var(--background)" : "var(--muted)",
              transition: "background-color 0.15s ease, color 0.15s ease",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Column toggle */}
      <div ref={colRef} className="relative">
        <button
          onClick={() => setColOpen((o) => !o)}
          className="flex items-center gap-2 px-3 py-2 text-[12px] uppercase tracking-wider cursor-pointer"
          style={{
            border: "1px solid var(--border)",
            backgroundColor: colOpen ? "var(--foreground)" : "var(--background)",
            color: colOpen ? "var(--background)" : hiddenCount > 0 ? "var(--foreground)" : "var(--muted)",
            transition: "background-color 0.15s ease, color 0.15s ease",
          }}
        >
          {icons.columns}
          COLUMNS
          {hiddenCount > 0 && (
            <span style={{
              backgroundColor: "var(--accent)",
              color: "#fff",
              width: 16, height: 16,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 700,
            }}>
              {hiddenCount}
            </span>
          )}
        </button>
        {colOpen && (
          <div className="absolute z-50 mt-1 right-0" style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)", minWidth: 180 }}>
            {columns.map((col) => (
              <label
                key={col.key}
                className="flex items-center gap-2.5 px-3.5 py-2 text-[12px] uppercase tracking-wider cursor-pointer"
                style={{
                  color: hiddenColumns.has(col.key) ? "var(--muted)" : "var(--foreground)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <input
                  type="checkbox"
                  checked={!hiddenColumns.has(col.key)}
                  onChange={() => onToggleColumn(col.key)}
                  style={{ accentColor: "var(--foreground)", width: 14, height: 14 }}
                />
                {col.label}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
