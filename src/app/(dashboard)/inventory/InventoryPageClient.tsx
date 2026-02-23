"use client";

import { useState, useMemo, useEffect, useRef, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchInput from "@/app/components/SearchInput";
import { usePreferences } from "./hooks/usePreferences";
import { useColumnVisibility } from "./hooks/useColumnVisibility";
import { useLowStockAlerts } from "./hooks/useInventoryData";
import StatCards from "./views/StatCards";
import ProductToolbar from "./views/ProductTableView/ProductToolbar";
import ProductTableView from "./views/ProductTableView/ProductTableView";
import LowStockModal from "./shared/LowStockModal";
import type { ColumnOption, StatCard, ProductSummary, PageParams, FilterOptions } from "./types";

interface Props {
  stats: StatCard[];
  products: ProductSummary[];
  totalCount: number;
  filterOptions: FilterOptions | null;
  currentParams: PageParams;
  parsedSearch: { category: string | null; dims: string[]; partialDims: string[]; words: string[] };
}

/* ── Searchable Filter Dropdown ── */
function FilterDropdown({
  options,
  selected,
  onSelect,
  placeholder,
  allLabel,
  mono,
  onOpenChange,
}: {
  options: string[];
  selected: string | null;
  onSelect: (v: string | null) => void;
  placeholder: string;
  allLabel: string;
  mono?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const setOpenState = useCallback((v: boolean) => {
    setOpen(v);
    onOpenChange?.(v);
    if (v) { setTimeout(() => inputRef.current?.focus(), 0); setHighlighted(0); }
    else setQuery("");
  }, [onOpenChange]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenState(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [setOpenState]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const normalize = (s: string) => s.toLowerCase().replace(/\s*[x×]\s*/g, "x").replace(/\s+/g, " ");
    const q = normalize(query);
    return options.filter((o) => normalize(o).includes(q));
  }, [options, query]);

  useEffect(() => { setHighlighted(0); }, [filtered]);

  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-option]");
    items[highlighted]?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) {
        onSelect(filtered[highlighted]);
        setOpenState(false);
      }
    } else if (e.key === "Escape") {
      setOpenState(false);
    }
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onSelect(null);
  }

  return (
    <div ref={ref} className="relative flex-shrink-0">
      {/* Trigger */}
      <button
        onClick={() => setOpenState(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 px-3 py-2 text-sm cursor-pointer whitespace-nowrap"
        style={{
          border: "1px solid var(--border)",
          backgroundColor: "var(--input-bg)",
          color: selected ? "var(--foreground)" : "var(--muted)",
          transition: "border-color 0.2s ease",
          borderColor: open ? "var(--foreground)" : "var(--border)",
          fontFamily: "var(--font-body)",
        }}
      >
        <span className={`text-[12px] uppercase tracking-wider ${mono ? "font-mono" : ""}`}>
          {selected ?? placeholder}
        </span>
        {selected && (
          <span
            onClick={handleClear}
            className="flex-shrink-0 cursor-pointer"
            style={{ color: "var(--muted)", lineHeight: 0 }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </span>
        )}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s ease", opacity: 0.5 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-1 w-full"
          style={{
            border: "1px solid var(--border)",
            backgroundColor: "var(--background)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            animation: "filterDropIn 0.15s ease-out",
            minWidth: 180,
          }}
        >
          {/* Search */}
          <div className="relative" style={{ borderBottom: "1px solid var(--border)" }}>
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--muted)", lineHeight: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search…"
              className="w-full pl-8 pr-3 py-2 text-[12px] outline-none"
              style={{
                backgroundColor: "var(--input-bg)",
                color: "var(--foreground)",
                fontFamily: "var(--font-body)",
              }}
            />
          </div>

          {/* Options */}
          <div ref={listRef} className="max-h-52 overflow-y-auto" role="listbox">
            {!query.trim() && (
              <button
                onClick={() => { onSelect(null); setOpenState(false); }}
                className="w-full text-left px-3 py-2 text-[11px] uppercase tracking-wider cursor-pointer flex items-center justify-between"
                role="option"
                aria-selected={!selected}
                style={{
                  color: !selected ? "var(--foreground)" : "var(--muted)",
                  fontWeight: !selected ? 600 : 400,
                  backgroundColor: !selected ? "var(--input-bg)" : "transparent",
                  borderBottom: "1px solid var(--border)",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--row-hover)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = !selected ? "var(--input-bg)" : "transparent"; }}
              >
                <span>{allLabel}</span>
                <span className="text-[10px]" style={{ color: "var(--muted)" }}>{options.length}</span>
              </button>
            )}

            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-[11px]" style={{ color: "var(--muted)" }}>
                No matches
              </div>
            ) : (
              filtered.map((item, i) => {
                const isSelected = selected === item;
                const isHighlighted = i === highlighted;
                return (
                  <button
                    key={item}
                    data-option
                    onClick={() => { onSelect(item); setOpenState(false); }}
                    onMouseEnter={() => setHighlighted(i)}
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full text-left px-3 py-2 text-[12px] tracking-wider cursor-pointer ${mono ? "font-mono" : ""}`}
                    style={{
                      color: (isSelected || isHighlighted) ? "var(--foreground)" : "var(--muted)",
                      fontWeight: isSelected ? 600 : 400,
                      backgroundColor: isHighlighted ? "var(--row-hover)" : isSelected ? "var(--input-bg)" : "transparent",
                      borderBottom: "1px solid var(--border)",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    {item}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const columnDefs: ColumnOption[] = [
  { key: "category", label: "Category" },
  { key: "sizeMm", label: "Size" },
  { key: "thicknessMm", label: "Thickness" },
  { key: "flangeThicknessMm", label: "Flange" },
  { key: "lengthM", label: "Length" },
  { key: "kgPerM", label: "Kg/m" },
  { key: "weightPerLength", label: "Wt/pcs" },
  { key: "weightPer20ft", label: "Wt/20ft" },
  { key: "regan", label: "Regan" },
  { key: "kirin", label: "Kirin" },
  { key: "supremo", label: "Supremo" },
  { key: "totalStock", label: "Total" },
];

export default function InventoryPageClient({
  stats, products, totalCount, filterOptions, currentParams, parsedSearch,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const { sizeUnit, setSizeUnit } = usePreferences();
  const { hiddenColumns, toggleColumn } = useColumnVisibility();
  const { items: lowStockItems, loading: lowStockLoading, load: loadLowStock } = useLowStockAlerts();

  const [showLowStock, setShowLowStock] = useState(false);
  const [searchInput, setSearchInput] = useState(currentParams.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Navigate by updating URL params
  const navigate = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    startTransition(() => {
      router.replace(`?${params.toString()}`);
    });
  }, [router, searchParams, startTransition]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchInput !== currentParams.search) {
        navigate({ q: searchInput || null, page: null, name: null, size: null, thickness: null });
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pagination
  const pageSize = currentParams.pageSize;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIndex = (currentParams.page - 1) * pageSize;

  function onPrev() {
    if (currentParams.page > 1) {
      navigate({ page: String(currentParams.page - 1) });
    }
  }
  function onNext() {
    if (currentParams.page < totalPages) {
      navigate({ page: String(currentParams.page + 1) });
    }
  }
  function onPageSizeChange(newSize: number) {
    navigate({ limit: String(newSize), page: null });
  }

  // Sort
  function onSort(key: string) {
    const newDir = currentParams.sortBy === key
      ? (currentParams.sortDir === "asc" ? "desc" : "asc")
      : "asc";
    navigate({ sort: key, dir: newDir, page: null });
  }

  // Filter dropdowns
  function onNameFilter(v: string | null) {
    navigate({ name: v, size: null, thickness: null, page: null });
  }
  function onSizeFilter(v: string | null) {
    navigate({ size: v, thickness: null, page: null });
  }
  function onThicknessFilter(v: string | null) {
    navigate({ thickness: v, page: null });
  }

  // Cascading filter options from server-provided filterOptions
  const categoryNames = filterOptions?.names ?? [];

  const categorySizes = useMemo(() => {
    if (!filterOptions) return [];
    // When name filter is active, we'd need to re-filter sizes.
    // Since filterOptions comes from the server for the full category, this is the full set.
    // Cascading is less critical for server-side pagination but we keep the full list.
    return filterOptions.sizes;
  }, [filterOptions]);

  const categoryThicknesses = useMemo(() => {
    if (!filterOptions) return [];
    return filterOptions.thicknesses;
  }, [filterOptions]);

  function onLowStockClick() {
    loadLowStock();
    setShowLowStock(true);
  }

  return (
    <>
      <StatCards stats={stats} viewMode="all" onLowStockClick={onLowStockClick} />

      <div
        className="animate-fade-up delay-400"
        style={{
          backgroundColor: "var(--input-bg)",
          transition: "background-color 0.4s ease",
          opacity: isPending ? 0.6 : 1,
          pointerEvents: isPending ? "none" : "auto",
        }}
      >
        <div className="px-4 pt-5 pb-4 space-y-3">
          {/* ── Row: Search + Filters (left) | Toolbar (right) ── */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-64 flex-shrink-0">
                <SearchInput
                  value={searchInput}
                  onChange={setSearchInput}
                  placeholder="e.g. equal angle 20x20 2.0"
                />
              </div>

              {/* Filter dropdowns — same row, aligned with search */}
              {parsedSearch.category && categoryNames.length > 0 && (
                <>
                  <FilterDropdown
                    options={categoryNames}
                    selected={currentParams.nameFilter}
                    onSelect={onNameFilter}
                    placeholder="Product"
                    allLabel="All products"
                  />
                  {categorySizes.length > 0 && (
                    <FilterDropdown
                      options={categorySizes}
                      selected={currentParams.sizeFilter}
                      onSelect={onSizeFilter}
                      placeholder="Size"
                      allLabel="All sizes"
                      mono
                    />
                  )}
                  {categoryThicknesses.length > 0 && (
                    <FilterDropdown
                      options={categoryThicknesses}
                      selected={currentParams.thicknessFilter}
                      onSelect={onThicknessFilter}
                      placeholder="Thickness"
                      allLabel="All thickness"
                      mono
                    />
                  )}
                  {(currentParams.nameFilter || currentParams.sizeFilter || currentParams.thicknessFilter) && (
                    <button
                      onClick={() => navigate({ name: null, size: null, thickness: null, page: null })}
                      className="flex-shrink-0 px-2 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                      style={{ color: "var(--accent)", transition: "opacity 0.15s ease" }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                    >
                      Clear
                    </button>
                  )}
                </>
              )}
            </div>

            <ProductToolbar
              sizeUnit={sizeUnit}
              onSizeUnitChange={setSizeUnit}
              columns={columnDefs}
              hiddenColumns={hiddenColumns}
              onToggleColumn={toggleColumn}
            />
          </div>

          {/* ── Parsed tokens ── */}
          {currentParams.search.trim() && (parsedSearch.category || parsedSearch.dims.length > 0 || parsedSearch.partialDims.length > 0 || parsedSearch.words.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {parsedSearch.category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium" style={{ backgroundColor: "var(--accent)", color: "#fff" }}>
                  {parsedSearch.category}
                </span>
              )}
              {parsedSearch.dims.map((d, i) => (
                <span key={`dim-${i}`} className="inline-flex items-center px-2 py-0.5 text-[10px] tracking-wider font-mono" style={{ backgroundColor: "var(--input-bg)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                  {d}
                </span>
              ))}
              {parsedSearch.partialDims.map((d, i) => (
                <span key={`pdim-${i}`} className="inline-flex items-center px-2 py-0.5 text-[10px] tracking-wider font-mono" style={{ backgroundColor: "var(--input-bg)", color: "var(--foreground)", border: "1px solid var(--border)" }}>
                  {d.trim()}…
                </span>
              ))}
              {parsedSearch.words.map((w, i) => (
                <span key={`word-${i}`} className="inline-flex items-center px-2 py-0.5 text-[10px] tracking-wider" style={{ backgroundColor: "var(--input-bg)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                  {/^\d+(\.\d+)?$/.test(w) ? `${w} mm` : w}
                </span>
              ))}
            </div>
          )}
        </div>

        <ProductTableView
          products={products}
          totalCount={totalCount}
          sortKey={currentParams.sortBy as "sku" | "name" | "category" | "totalStock"}
          sortDir={currentParams.sortDir as "asc" | "desc"}
          onSort={onSort}
          sizeUnit={sizeUnit}
          hiddenColumns={hiddenColumns}
          currentPage={currentParams.page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPrev={onPrev}
          onNext={onNext}
          onPageSizeChange={onPageSizeChange}
          startIndex={startIndex}
        />
      </div>

      {showLowStock && (
        <LowStockModal
          items={lowStockItems}
          loading={lowStockLoading}
          onClose={() => setShowLowStock(false)}
        />
      )}
    </>
  );
}
