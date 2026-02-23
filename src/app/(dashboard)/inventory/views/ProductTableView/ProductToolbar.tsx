"use client";

import { useState, useRef, useEffect } from "react";
import { icons } from "../../icons";
import type { SizeUnit, ColumnOption } from "../../types";

interface Props {
  sizeUnit: SizeUnit;
  onSizeUnitChange: (unit: SizeUnit) => void;
  columns: ColumnOption[];
  hiddenColumns: Set<string>;
  onToggleColumn: (key: string) => void;
}

const unitOptions: { value: SizeUnit; label: string }[] = [
  { value: "original", label: "AUTO" },
  { value: "in", label: 'IN "' },
  { value: "mm", label: "MM" },
];

export default function ProductToolbar({ sizeUnit, onSizeUnitChange, columns, hiddenColumns, onToggleColumn }: Props) {
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
    <div className="flex items-center gap-3">
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
