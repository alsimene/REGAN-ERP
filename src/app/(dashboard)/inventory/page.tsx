"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  getInventoryByCategory,
  getInventoryStats,
  getCategoriesWithCounts,
  getFastMovingItems,
  getAllLowStockAlerts,
} from "@/lib/queries";
import LoadingOverlay from "@/app/components/LoadingOverlay";

/* ── icons ── */
const icons = {
  alert: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  warehouse: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21V8l9-5 9 5v13" /><path d="M9 21V12h6v9" />
    </svg>
  ),
  x: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  sortAsc: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5l-7 7h14z" /></svg>
  ),
  sortDesc: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 19l-7-7h14z" /></svg>
  ),
};

/* ── classification helpers ── */
type Classification = "C1" | "C2" | "C3";

const classLabels: Record<Classification, string> = {
  C1: "Good to Sell",
  C2: "Needs Repair",
  C3: "Not for Sale",
};

function classColor(c: Classification) {
  switch (c) {
    case "C1": return "var(--class-c1)";
    case "C2": return "var(--class-c2)";
    case "C3": return "var(--class-c3)";
  }
}

function capColor(pct: number) {
  if (pct < 20) return "var(--accent)";
  if (pct < 50) return "var(--class-c2)";
  return "var(--class-c1)";
}

/* ── size conversion helpers ── */
function convertSizePart(part: string, target: "in" | "mm"): string {
  const trimmed = part.trim();
  // Match fractional inches: 4", 3/4", 1 5/8", 1-5/8", etc.
  const inchMatch = trimmed.match(/^(\d+)?[\s-]*(?:(\d+)\/(\d+))?\s*"$/);
  if (inchMatch && (inchMatch[1] || inchMatch[2])) {
    const whole = inchMatch[1] ? parseFloat(inchMatch[1]) : 0;
    const num = inchMatch[2] ? parseFloat(inchMatch[2]) : 0;
    const den = inchMatch[3] ? parseFloat(inchMatch[3]) : 1;
    const val = whole + num / den;
    if (target === "mm") return parseFloat((val * 25.4).toFixed(3)).toString();
    return trimmed; // already inches
  }
  // Match plain numbers (mm values)
  const mmMatch = trimmed.match(/^([\d.]+)/);
  if (mmMatch) {
    const val = parseFloat(mmMatch[1]);
    if (target === "in") return (val / 25.4).toFixed(2) + '"';
    return trimmed; // already mm
  }
  return trimmed;
}

function convertSize(raw: string, target: "original" | "in" | "mm"): string {
  if (!raw || raw === "—" || target === "original") return raw;
  // Split by "x" or "×" to handle compound sizes like '4" × 1 5/8"'
  const parts = raw.split(/\s*[x×]\s*/i);
  return parts.map((p) => convertSizePart(p, target)).join(" x ");
}

/* ── types ── */
type WarehouseStock = { warehouse: string; c1: number; c2: number; c3: number };

type InventoryItem = {
  sku: string;
  name: string;
  category: string;
  size: string;
  thickness: string;
  flangeThickness?: string;
  length?: number;
  kgPerM: number;
  weightPerLength: number;
  weightPer20ft?: number;
  capacity: number;
  unit: string;
  warehouses: WarehouseStock[];
};

function itemTotals(item: InventoryItem) {
  const c1 = item.warehouses.reduce((s, w) => s + w.c1, 0);
  const c2 = item.warehouses.reduce((s, w) => s + w.c2, 0);
  const c3 = item.warehouses.reduce((s, w) => s + w.c3, 0);
  return { c1, c2, c3, stock: c1 + c2 + c3 };
}

type LowStockItem = {
  productId: number;
  sku: string;
  name: string;
  category: string;
  c1: number;
  c2: number;
  c3: number;
  totalStock: number;
  capacity: number;
  pct: number;
};

type SortKey = "sku" | "name" | "totalStock" | "capPct";
type SortDir = "asc" | "desc";
type ViewMode = "overview" | "category" | "lowstock";

const PAGE_SIZE = 50;

/* ── CapacityBar component ── */
function CapacityBar({ pct }: { pct: number }) {
  const color = capColor(pct);
  return (
    <div className="flex items-center gap-2">
      <div className="capacity-bar" style={{ width: 48 }}>
        <div className="capacity-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] tabular-nums" style={{ color, minWidth: 32, textAlign: "right" }}>
        {pct}%
      </span>
    </div>
  );
}

export default function InventoryPage() {
  /* ── state ── */
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [allCategories, setAllCategories] = useState<{ id: number; name: string; product_count: number }[]>([]);
  const [inventoryStats, setInventoryStats] = useState<{ label: string; value: string }[]>([]);
  const [fastMovingItems, setFastMovingItems] = useState<{
    product_id: number; sku: string; product_name: string;
    category_name: string; total_moved: number; total_ordered: number;
    txn_count: number; warehouse_count: number; current_stock: number;
    last_movement: string;
  }[]>([]);
  const [fastMovingDays, setFastMovingDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Sub-filters (category view only)
  const [selectedProductType, setSelectedProductType] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [selectedThickness, setSelectedThickness] = useState("All");
  const [selectedFlangeThickness, setSelectedFlangeThickness] = useState("All");
  const [selectedLength, setSelectedLength] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  // Unit toggle (inches ↔ mm)
  const [sizeUnit, setSizeUnit] = useState<"original" | "in" | "mm">("original");

  // Low stock view
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [lowStockLoading, setLowStockLoading] = useState(false);

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("sku");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Column visibility
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const colMenuRef = useRef<HTMLDivElement>(null);

  // Category search dropdown
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryHighlight, setCategoryHighlight] = useState(-1);
  const categoryRef = useRef<HTMLDivElement>(null);
  const categoryListRef = useRef<HTMLDivElement>(null);

  /* ── close dropdowns on outside click ── */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setCategoryOpen(false);
      }
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) {
        setColMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── initial load: stats + categories + fast movers ── */
  useEffect(() => {
    Promise.all([getInventoryStats(), getCategoriesWithCounts(), getFastMovingItems(20, fastMovingDays)]).then(([stats, cats, fast]) => {
      setInventoryStats(stats);
      setAllCategories(cats);
      setFastMovingItems(fast);
      setLoading(false);
    }).catch((err) => {
      console.error("Inventory initial load error:", err);
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── reload fast movers when period changes ── */
  useEffect(() => {
    if (loading) return;
    getFastMovingItems(20, fastMovingDays).then(setFastMovingItems).catch(console.error);
  }, [fastMovingDays]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── lazy load: fetch products when category changes ── */
  useEffect(() => {
    if (selectedCategory === "All") {
      setInventoryItems([]);
      return;
    }
    setCategoryLoading(true);
    getInventoryByCategory(selectedCategory).then((items) => {
      setInventoryItems(items);
      setCategoryLoading(false);
    }).catch((err) => {
      console.error("Inventory category load error:", err);
      setCategoryLoading(false);
    });
  }, [selectedCategory]);

  /* ── category change handler ── */
  function handleCategoryChange(cat: string) {
    setSelectedCategory(cat);
    setSelectedProductType("All");
    setSelectedSize("All");
    setSelectedThickness("All");
    setSelectedFlangeThickness("All");
    setSelectedLength("All");
    setCurrentPage(1);
    setViewMode(cat === "All" ? "overview" : "category");
  }

  /* ── low stock click handler ── */
  function handleLowStockClick() {
    setViewMode("lowstock");
    setSelectedCategory("All");
    setCurrentPage(1);
    setLowStockLoading(true);
    getAllLowStockAlerts().then((items) => {
      setLowStockItems(items);
      setLowStockLoading(false);
    }).catch(() => setLowStockLoading(false));
  }

  /* ── clear all filters ── */
  function clearFilters() {
    setSelectedCategory("All");
    setSelectedProductType("All");
    setSelectedSize("All");
    setSelectedThickness("All");
    setSelectedFlangeThickness("All");
    setSelectedLength("All");
    setCurrentPage(1);
    setViewMode("overview");
  }

  /* ── filter pipeline (category view) ── */
  const filteredItems = useMemo(() => {
    let items: InventoryItem[] = inventoryItems;
    if (selectedProductType !== "All") items = items.filter((i) => i.name === selectedProductType);
    if (selectedSize !== "All") items = items.filter((i) => i.size === selectedSize);
    if (selectedThickness !== "All") items = items.filter((i) => i.thickness === selectedThickness);
    if (selectedFlangeThickness !== "All") items = items.filter((i) => i.flangeThickness === selectedFlangeThickness);
    if (selectedLength !== "All") items = items.filter((i) => i.length !== undefined && String(i.length) === selectedLength);
    return items;
  }, [inventoryItems, selectedProductType, selectedSize, selectedThickness, selectedFlangeThickness, selectedLength]);

  // Reset page when sub-filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedProductType, selectedSize, selectedThickness, selectedFlangeThickness, selectedLength]);

  /* ── determine which optional spec columns have data (category view) ── */
  const visibleColumns = useMemo(() => ({
    size: filteredItems.some((i) => i.size && i.size !== "—"),
    thickness: filteredItems.some((i) => i.thickness && i.thickness !== "—"),
    flange: filteredItems.some((i) => !!i.flangeThickness && i.flangeThickness !== "—"),
    length: filteredItems.some((i) => i.length !== undefined),
    kgPerM: filteredItems.some((i) => i.kgPerM > 0),
    weightPerLength: filteredItems.some((i) => i.weightPerLength > 0),
    weightPer20ft: filteredItems.some((i) => !!i.weightPer20ft),
  }), [filteredItems]);

  const sizeLabel = useMemo(() => {
    if (sizeUnit === "in") return 'SIZE (")';
    if (sizeUnit === "mm") return "SIZE (MM)";
    const hasInch = filteredItems.some((i) => i.size.includes('"'));
    const hasMm = filteredItems.some((i) => i.size !== "—" && !i.size.includes('"'));
    if (hasInch && hasMm) return "SIZE";
    if (hasInch) return 'SIZE (")';
    return "SIZE (MM)";
  }, [filteredItems, sizeUnit]);

  /* ── collect unique warehouse names from current data ── */
  const warehouseNames = useMemo(() => {
    const names = new Set<string>();
    for (const item of inventoryItems) {
      for (const wh of item.warehouses) names.add(wh.warehouse);
    }
    return [...names].sort();
  }, [inventoryItems]);

  /* ── column visibility ── */
  const columnOptions = useMemo(() => {
    const opts: { key: string; label: string }[] = [];
    if (visibleColumns.size) opts.push({ key: "size", label: "SIZE" });
    if (visibleColumns.thickness) opts.push({ key: "thickness", label: "THICKNESS" });
    if (visibleColumns.flange) opts.push({ key: "flange", label: "FLANGE" });
    if (visibleColumns.length) opts.push({ key: "length", label: "LENGTH" });
    if (visibleColumns.kgPerM) opts.push({ key: "kgPerM", label: "KG/M" });
    if (visibleColumns.weightPerLength) opts.push({ key: "weightPerLength", label: "WT/PCS" });
    if (visibleColumns.weightPer20ft) opts.push({ key: "weightPer20ft", label: "WT/20FT" });
    for (const wn of warehouseNames) opts.push({ key: `wh_${wn}`, label: wn });
    opts.push({ key: "total", label: "TOTAL" });
    return opts;
  }, [visibleColumns, warehouseNames]);

  const shownWarehouses = useMemo(() =>
    warehouseNames.filter(wn => !hiddenColumns.has(`wh_${wn}`)),
    [warehouseNames, hiddenColumns]
  );

  function toggleColumn(key: string) {
    setHiddenColumns(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  /* ── sort (category view) ── */
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems].sort((a, b) => {
      let cmp = 0;
      const aT = itemTotals(a);
      const bT = itemTotals(b);
      switch (sortKey) {
        case "sku": cmp = a.sku.localeCompare(b.sku); break;
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "totalStock": cmp = aT.stock - bT.stock; break;
        case "capPct": {
          const aPct = a.capacity > 0 ? aT.stock / a.capacity : 0;
          const bPct = b.capacity > 0 ? bT.stock / b.capacity : 0;
          cmp = aPct - bPct;
          break;
        }
      }
      if (cmp === 0) cmp = a.sku.localeCompare(b.sku);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [filteredItems, sortKey, sortDir]);

  /* ── sort (low stock view) ── */
  const sortedLowStock = useMemo(() => {
    const sorted = [...lowStockItems].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "sku": cmp = a.sku.localeCompare(b.sku); break;
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "totalStock": cmp = a.totalStock - b.totalStock; break;
        case "capPct": cmp = a.pct - b.pct; break;
      }
      if (cmp === 0) cmp = a.sku.localeCompare(b.sku);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [lowStockItems, sortKey, sortDir]);

  /* ── pagination ── */
  const totalItemCount = viewMode === "category" ? sortedItems.length : viewMode === "lowstock" ? sortedLowStock.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalItemCount / PAGE_SIZE));

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedItems.slice(start, start + PAGE_SIZE);
  }, [sortedItems, currentPage]);

  const paginatedLowStock = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedLowStock.slice(start, start + PAGE_SIZE);
  }, [sortedLowStock, currentPage]);

  const shownSpecCount = [
    visibleColumns.size && !hiddenColumns.has("size"),
    visibleColumns.thickness && !hiddenColumns.has("thickness"),
    visibleColumns.flange && !hiddenColumns.has("flange"),
    visibleColumns.length && !hiddenColumns.has("length"),
    visibleColumns.kgPerM && !hiddenColumns.has("kgPerM"),
    visibleColumns.weightPerLength && !hiddenColumns.has("weightPerLength"),
    visibleColumns.weightPer20ft && !hiddenColumns.has("weightPer20ft"),
  ].filter(Boolean).length;
  const totalColCount = 3 + shownSpecCount + (shownWarehouses.length * 3) + (hiddenColumns.has("total") ? 0 : 1);

  /* ── sub-filter chip options (category view) ── */
  const chipOptions = useMemo(() => {
    if (selectedCategory === "All" || inventoryItems.length === 0) return { productTypes: [] as string[], sizes: [] as string[], thicknesses: [] as string[], flangeThicknesses: [] as string[], lengths: [] as string[] };
    const pool = inventoryItems;
    const productTypes = [...new Set(pool.map((i) => i.name))];
    const narrowForSizes = (() => {
      let n = pool;
      if (selectedProductType !== "All") n = n.filter((i) => i.name === selectedProductType);
      return n;
    })();
    const narrowForThicknesses = (() => {
      let n = narrowForSizes;
      if (selectedSize !== "All") n = n.filter((i) => i.size === selectedSize);
      return n;
    })();
    const narrowForFlanges = (() => {
      let n = narrowForThicknesses;
      if (selectedThickness !== "All") n = n.filter((i) => i.thickness === selectedThickness);
      return n;
    })();
    const narrowForLengths = (() => {
      let n = narrowForSizes;
      if (selectedSize !== "All") n = n.filter((i) => i.size === selectedSize);
      return n;
    })();

    const sizes = [...new Set(narrowForSizes.map((i) => i.size).filter((s) => s !== "—"))];
    const thicknesses = [...new Set(narrowForThicknesses.map((i) => i.thickness).filter((t) => t !== "—"))];
    const flangeThicknesses = [...new Set(narrowForFlanges.map((i) => i.flangeThickness).filter((f): f is string => !!f && f !== "—"))];
    const lengths = [...new Set(narrowForLengths.filter((i) => i.length !== undefined).map((i) => String(i.length!)))];

    const numSort = (a: string, b: string) => parseFloat(a) - parseFloat(b);
    sizes.sort((a, b) => { const na = parseFloat(a); const nb = parseFloat(b); return isNaN(na) || isNaN(nb) ? a.localeCompare(b) : na - nb; });
    thicknesses.sort(numSort);
    flangeThicknesses.sort(numSort);
    lengths.sort(numSort);

    return { productTypes, sizes, thicknesses, flangeThicknesses, lengths };
  }, [inventoryItems, selectedProductType, selectedSize, selectedThickness]);

  /* ── sort header click ── */
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  }

  function SortIndicator({ col }: { col: SortKey }) {
    if (sortKey !== col) return null;
    return <span className="ml-1 inline-block">{sortDir === "asc" ? icons.sortAsc : icons.sortDesc}</span>;
  }

  const isTableView = viewMode !== "overview";
  const tableIsLoading = categoryLoading || lowStockLoading;

  return (
    <>
      <LoadingOverlay open={loading || tableIsLoading} message={loading ? "Loading inventory" : viewMode === "lowstock" ? "Loading alerts" : "Loading category"} />

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {inventoryStats.map((stat, i) => {
          const isLowStock = stat.label === "Low Stock Alerts";
          const hasAlerts = isLowStock && parseInt(stat.value) > 0;
          const isActive = isLowStock && viewMode === "lowstock";
          return (
            <div
              key={stat.label}
              className="relative p-5 animate-fade-up"
              style={{
                backgroundColor: isActive ? "var(--background)" : "var(--input-bg)",
                borderBottom: hasAlerts ? "2px solid var(--accent)" : "2px solid var(--border)",
                animationDelay: `${i * 0.1}s`,
                transition: "background-color 0.4s ease, border-color 0.4s ease",
                cursor: isLowStock && hasAlerts ? "pointer" : "default",
              }}
              onClick={isLowStock && hasAlerts ? handleLowStockClick : undefined}
            >
              <div
                className="absolute top-2 right-2 rounded-full"
                style={{ width: "4px", height: "4px", backgroundColor: "var(--border)" }}
              />
              <p className="text-xs text-muted uppercase tracking-widest font-[family-name:var(--font-body)]">
                {stat.label}
              </p>
              <p
                className="mt-2 text-2xl font-[family-name:var(--font-display)] tracking-tight"
                style={{ color: hasAlerts ? "var(--accent)" : "var(--foreground)" }}
              >
                {stat.value}
              </p>
              {isLowStock && hasAlerts && (
                <p className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                  Click to view
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── INVENTORY TABLE ── */}
      <div
        className="animate-fade-up delay-400"
        style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
      >
        {/* Header: Category dropdown + filters */}
        <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex flex-wrap gap-2">
            {/* Category (searchable dropdown) */}
            <div ref={categoryRef} className="relative" style={{ minWidth: 280 }}>
              <div
                className="flex items-center gap-1 px-3 py-2"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)" }}
              >
                <span className="text-muted">{icons.search}</span>
                <input
                  type="text"
                  value={categoryOpen ? categorySearch : (selectedCategory === "All" ? "" : selectedCategory)}
                  placeholder="Category"
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setCategoryHighlight(0);
                    if (!categoryOpen) setCategoryOpen(true);
                  }}
                  onFocus={() => {
                    setCategoryOpen(true);
                    setCategorySearch("");
                    setCategoryHighlight(-1);
                  }}
                  onKeyDown={(e) => {
                    if (!categoryOpen) return;
                    const catNames = ["All", ...allCategories.map((c) => c.name)];
                    const filtered = catNames.filter((c) => c.toLowerCase().includes(categorySearch.toLowerCase()));
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setCategoryHighlight((prev) => {
                        const next = Math.min(prev + 1, filtered.length - 1);
                        categoryListRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
                        return next;
                      });
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setCategoryHighlight((prev) => {
                        const next = Math.max(prev - 1, 0);
                        categoryListRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
                        return next;
                      });
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      const pick = categoryHighlight >= 0 && categoryHighlight < filtered.length ? filtered[categoryHighlight] : filtered[0];
                      if (pick) {
                        handleCategoryChange(pick);
                        setCategorySearch("");
                        setCategoryOpen(false);
                        setCategoryHighlight(-1);
                      }
                    } else if (e.key === "Escape") {
                      setCategoryOpen(false);
                      setCategoryHighlight(-1);
                    }
                  }}
                  className="bg-transparent outline-none text-[12px] uppercase tracking-wider w-full"
                  style={{ color: "var(--foreground)" }}
                />
                {selectedCategory !== "All" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCategoryChange("All"); setCategorySearch(""); setCategoryOpen(false); }}
                    className="text-muted hover:text-foreground"
                  >
                    {icons.x}
                  </button>
                )}
              </div>
              {categoryOpen && (
                <div
                  ref={categoryListRef}
                  className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto"
                  style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)" }}
                >
                  {["All", ...allCategories.map((c) => c.name)]
                    .filter((cat) => cat.toLowerCase().includes(categorySearch.toLowerCase()))
                    .map((cat, idx) => {
                      const countInfo = allCategories.find((c) => c.name === cat);
                      return (
                        <div
                          key={cat}
                          className="px-3 py-2 text-[12px] uppercase tracking-wider cursor-pointer flex items-center justify-between"
                          style={{
                            color: idx === categoryHighlight || cat === selectedCategory ? "var(--foreground)" : "var(--muted)",
                            backgroundColor: idx === categoryHighlight ? "var(--border)" : "transparent",
                            borderLeft: idx === categoryHighlight ? "2px solid var(--accent)" : "2px solid transparent",
                          }}
                          onMouseEnter={() => setCategoryHighlight(idx)}
                          onClick={() => {
                            handleCategoryChange(cat);
                            setCategorySearch("");
                            setCategoryOpen(false);
                            setCategoryHighlight(-1);
                          }}
                        >
                          <span>{cat}</span>
                          {countInfo && <span className="text-[10px] text-muted">{countInfo.product_count}</span>}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Sub-filters (only in category view) */}
            {viewMode === "category" && (<>
              {chipOptions.productTypes.length > 1 && (
                <select
                  value={selectedProductType}
                  onChange={(e) => { setSelectedProductType(e.target.value); setSelectedSize("All"); setSelectedThickness("All"); setSelectedFlangeThickness("All"); setSelectedLength("All"); }}
                  className="px-3 py-2 text-[12px] uppercase tracking-wider cursor-pointer"
                  style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)", color: selectedProductType !== "All" ? "var(--foreground)" : "var(--muted)", minWidth: 140 }}
                >
                  <option value="All" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>PRODUCT</option>
                  {chipOptions.productTypes.map((t) => <option key={t} value={t} style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>{t}</option>)}
                </select>
              )}
              {chipOptions.sizes.length > 1 && (
                <select
                  value={selectedSize}
                  onChange={(e) => { setSelectedSize(e.target.value); setSelectedThickness("All"); setSelectedFlangeThickness("All"); setSelectedLength("All"); }}
                  className="px-3 py-2 text-[12px] uppercase tracking-wider cursor-pointer"
                  style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)", color: selectedSize !== "All" ? "var(--foreground)" : "var(--muted)", minWidth: 120 }}
                >
                  <option value="All" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>{selectedCategory === "Deformed Bars" ? (sizeUnit === "in" ? 'DIAMETER (")' : "DIAMETER (MM)") : sizeLabel}</option>
                  {chipOptions.sizes.map((s) => {
                    const display = sizeUnit === "original" ? (s.includes('"') ? s : s + " (mm)") : sizeUnit === "mm" ? convertSize(s, "mm") + " mm" : convertSize(s, "in");
                    return <option key={s} value={s} style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>{display}</option>;
                  })}
                </select>
              )}
              {selectedCategory !== "Deformed Bars" && chipOptions.thicknesses.length > 0 && (
                <select
                  value={selectedThickness}
                  onChange={(e) => { setSelectedThickness(e.target.value); setSelectedFlangeThickness("All"); }}
                  className="px-3 py-2 text-[12px] uppercase tracking-wider cursor-pointer"
                  style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)", color: selectedThickness !== "All" ? "var(--foreground)" : "var(--muted)", minWidth: 120 }}
                >
                  <option value="All" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>{sizeUnit === "in" ? 'THICKNESS (")' : "THICKNESS (MM)"}</option>
                  {chipOptions.thicknesses.map((t) => {
                    const display = sizeUnit === "in" ? convertSize(t, "in") : t + " (mm)";
                    return <option key={t} value={t} style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>{display}</option>;
                  })}
                </select>
              )}
              {selectedCategory === "Deformed Bars" && chipOptions.lengths.length > 0 && (
                <select
                  value={selectedLength}
                  onChange={(e) => setSelectedLength(e.target.value)}
                  className="px-3 py-2 text-[12px] uppercase tracking-wider cursor-pointer"
                  style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)", color: selectedLength !== "All" ? "var(--foreground)" : "var(--muted)", minWidth: 100 }}
                >
                  <option value="All" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>LENGTH (M)</option>
                  {chipOptions.lengths.map((l) => <option key={l} value={l} style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>{l} (m)</option>)}
                </select>
              )}
            </>)}

            {/* Clear all */}
            {viewMode !== "overview" && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-[12px] uppercase tracking-wider cursor-pointer"
                style={{ color: "var(--accent)", border: "1px solid var(--border)", backgroundColor: "var(--background)" }}
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Legend + unit toggle + column visibility (category view) */}
        {viewMode === "category" && (
          <div className="px-5 py-2 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            {/* Unit toggle + Columns button (left) */}
            <div className="flex items-center gap-2">
              {visibleColumns.size && (
                <div className="flex items-center" style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)" }}>
                  {(["original", "in", "mm"] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => setSizeUnit(u)}
                      className="px-3 py-1.5 text-[10px] uppercase tracking-wider cursor-pointer"
                      style={{
                        backgroundColor: sizeUnit === u ? "var(--foreground)" : "transparent",
                        color: sizeUnit === u ? "var(--background)" : "var(--muted)",
                        transition: "background-color 0.15s ease, color 0.15s ease",
                      }}
                    >
                      {u === "original" ? "AUTO" : u === "in" ? 'IN "' : "MM"}
                    </button>
                  ))}
                </div>
              )}
              {/* Column visibility dropdown */}
              <div ref={colMenuRef} className="relative">
                <button
                  onClick={() => setColMenuOpen(o => !o)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider cursor-pointer"
                  style={{
                    border: "1px solid var(--border)",
                    backgroundColor: colMenuOpen ? "var(--foreground)" : "var(--background)",
                    color: colMenuOpen ? "var(--background)" : hiddenColumns.size > 0 ? "var(--foreground)" : "var(--muted)",
                    transition: "background-color 0.15s ease, color 0.15s ease",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v18" /><path d="M3 12h18" /><rect x="3" y="3" width="18" height="18" rx="2" />
                  </svg>
                  COLUMNS
                  {hiddenColumns.size > 0 && (
                    <span style={{
                      backgroundColor: "var(--accent)",
                      color: "var(--background)",
                      borderRadius: "50%",
                      width: 16, height: 16,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700,
                    }}>
                      {hiddenColumns.size}
                    </span>
                  )}
                </button>
                {colMenuOpen && (
                  <div
                    className="absolute z-50 mt-1 left-0"
                    style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)", minWidth: 170 }}
                  >
                    {columnOptions.map((col) => (
                      <label
                        key={col.key}
                        className="flex items-center gap-2 px-3 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                        style={{
                          color: hiddenColumns.has(col.key) ? "var(--muted)" : "var(--foreground)",
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!hiddenColumns.has(col.key)}
                          onChange={() => toggleColumn(col.key)}
                          style={{ accentColor: "var(--foreground)" }}
                        />
                        {col.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Legend (right) */}
            <div className="flex items-center gap-5">
              {(["C1", "C2", "C3"] as Classification[]).map((cls) => (
                <div key={cls} className="flex items-center gap-1.5">
                  <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: classColor(cls), display: "inline-block" }} />
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: classColor(cls) }}>
                    {cls} — {classLabels[cls]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low stock banner */}
        {viewMode === "lowstock" && (
          <div className="px-5 py-2 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border)", backgroundColor: "var(--background)" }}>
            <span style={{ color: "var(--accent)" }}>{icons.alert}</span>
            <span className="text-[11px] uppercase tracking-widest font-medium" style={{ color: "var(--accent)" }}>
              Low Stock Alerts — Products below 20% capacity
            </span>
          </div>
        )}

        <div className="overflow-auto" style={{ maxHeight: "70vh" }}>
          {/* ── OVERVIEW: Fast Moving Items ── */}
          {viewMode === "overview" && (
            <div>
              <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--foreground)" }}>
                    Fast Moving Items
                  </h3>
                  <p className="text-xs text-muted uppercase tracking-wider mt-1">
                    Based on warehouse transactions (sales &amp; transfers)
                  </p>
                </div>
                {/* Period toggle */}
                <div className="flex items-center" style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)" }}>
                  {([7, 30, 90] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => setFastMovingDays(d)}
                      className="px-3 py-1.5 text-[10px] uppercase tracking-wider cursor-pointer"
                      style={{
                        backgroundColor: fastMovingDays === d ? "var(--foreground)" : "transparent",
                        color: fastMovingDays === d ? "var(--background)" : "var(--muted)",
                        transition: "background-color 0.15s ease, color 0.15s ease",
                      }}
                    >
                      {d}D
                    </button>
                  ))}
                </div>
              </div>
              {fastMovingItems.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-muted uppercase tracking-widest">No transactions yet</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["#", "SKU", "PRODUCT", "CATEGORY", "QTY MOVED", "TXNS", "STOCK", "LAST MOVED"].map((h) => (
                        <th
                          key={h}
                          className={`py-3 text-left text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap ${h === "#" ? "px-3 w-10" : "px-5"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fastMovingItems.map((item, idx) => (
                      <tr key={item.product_id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td className="px-3 py-3 text-xs text-muted whitespace-nowrap">{idx + 1}</td>
                        <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">{item.sku}</td>
                        <td className="px-5 py-3 text-foreground whitespace-nowrap">{item.product_name}</td>
                        <td className="px-5 py-3 text-muted whitespace-nowrap">{item.category_name}</td>
                        <td className="px-5 py-3 whitespace-nowrap font-bold" style={{ color: "var(--foreground)" }}>
                          {item.total_moved.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-muted whitespace-nowrap">{item.txn_count.toLocaleString()}</td>
                        <td className="px-5 py-3 whitespace-nowrap font-bold" style={{ color: item.current_stock === 0 ? "var(--accent)" : "var(--foreground)" }}>
                          {item.current_stock.toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-muted whitespace-nowrap text-xs">
                          {new Date(item.last_movement).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── CATEGORY VIEW: Collapsible warehouse rows ── */}
          {viewMode === "category" && (
            <table className="inv-table w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap" style={{ position: "sticky", top: 0, zIndex: 2, borderBottom: "1px solid var(--border)" }}>#</th>
                  <th className="py-2 px-5 text-left text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap cursor-pointer select-none" style={{ position: "sticky", top: 0, zIndex: 2, borderBottom: "1px solid var(--border)" }} onClick={() => handleSort("sku")}>
                    SKU <SortIndicator col="sku" />
                  </th>
                  <th className="py-2 px-5 text-left text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap cursor-pointer select-none" style={{ position: "sticky", top: 0, zIndex: 2, borderBottom: "1px solid var(--border)" }} onClick={() => handleSort("name")}>
                    PRODUCT <SortIndicator col="name" />
                  </th>
                  {[
                    { key: "size", label: sizeLabel, show: visibleColumns.size && !hiddenColumns.has("size") },
                    { key: "thickness", label: sizeUnit === "in" ? 'THICKNESS (")' : "THICKNESS (MM)", show: visibleColumns.thickness && !hiddenColumns.has("thickness") },
                    { key: "flange", label: sizeUnit === "in" ? 'FLANGE (")' : "FLANGE (MM)", show: visibleColumns.flange && !hiddenColumns.has("flange") },
                    { key: "length", label: "LENGTH (M)", show: visibleColumns.length && !hiddenColumns.has("length") },
                    { key: "kgPerM", label: "KG/M", show: visibleColumns.kgPerM && !hiddenColumns.has("kgPerM") },
                    { key: "wtPcs", label: "WT/PCS", show: visibleColumns.weightPerLength && !hiddenColumns.has("weightPerLength") },
                    { key: "wt20ft", label: "WT/20FT", show: visibleColumns.weightPer20ft && !hiddenColumns.has("weightPer20ft") },
                  ].filter((col) => col.show).map((col) => (
                    <th key={col.key} className="py-2 px-5 text-left text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap" style={{ position: "sticky", top: 0, zIndex: 2, borderBottom: "1px solid var(--border)" }}>
                      {col.label}
                    </th>
                  ))}
                  {shownWarehouses.map((wn) => (
                    <th key={wn} colSpan={3} className="py-2 px-2 text-center text-xs font-medium uppercase tracking-widest whitespace-nowrap" style={{ position: "sticky", top: 0, zIndex: 2, color: "var(--foreground)", borderLeft: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                      <div className="flex items-center justify-center gap-1.5">
                        {icons.warehouse}
                        {wn}
                      </div>
                    </th>
                  ))}
                  {!hiddenColumns.has("total") && (
                    <th className="py-2 px-5 text-right text-xs font-medium uppercase tracking-widest whitespace-nowrap cursor-pointer select-none" style={{ position: "sticky", top: 0, zIndex: 2, color: "var(--foreground)", borderLeft: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }} onClick={() => handleSort("totalStock")}>
                      TOTAL <SortIndicator col="totalStock" />
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {!categoryLoading && filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={totalColCount} className="px-5 py-8 text-center text-sm text-muted uppercase tracking-wider">No items found</td>
                  </tr>
                )}
                {paginatedItems.map((item, index) => {
                  const isService = item.category === "Other Services";
                  const t = itemTotals(item);
                  const isLow = !isService && item.capacity > 0 && t.stock / item.capacity < 0.2;

                  return (
                    <tr key={item.sku} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="px-3 py-3 text-xs text-muted whitespace-nowrap">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                      <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">{item.sku}</td>
                      <td className="px-5 py-3 text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {item.name}
                          {isLow && <span style={{ color: "var(--accent)" }}>{icons.alert}</span>}
                        </div>
                      </td>
                      {visibleColumns.size && !hiddenColumns.has("size") && <td className="px-5 py-3 text-muted whitespace-nowrap">{convertSize(item.size, sizeUnit)}</td>}
                      {visibleColumns.thickness && !hiddenColumns.has("thickness") && <td className="px-5 py-3 text-muted whitespace-nowrap">{convertSize(item.thickness, sizeUnit)}</td>}
                      {visibleColumns.flange && !hiddenColumns.has("flange") && <td className="px-5 py-3 text-muted whitespace-nowrap">{item.flangeThickness ? convertSize(item.flangeThickness, sizeUnit) : "—"}</td>}
                      {visibleColumns.length && !hiddenColumns.has("length") && <td className="px-5 py-3 text-muted whitespace-nowrap">{item.length ? item.length.toFixed(1) : "—"}</td>}
                      {visibleColumns.kgPerM && !hiddenColumns.has("kgPerM") && <td className="px-5 py-3 text-right text-muted whitespace-nowrap tabular-nums">{item.kgPerM > 0 ? item.kgPerM.toFixed(3) : "—"}</td>}
                      {visibleColumns.weightPerLength && !hiddenColumns.has("weightPerLength") && <td className="px-5 py-3 text-right text-muted whitespace-nowrap tabular-nums">{item.weightPerLength > 0 ? item.weightPerLength.toFixed(3) : "—"}</td>}
                      {visibleColumns.weightPer20ft && !hiddenColumns.has("weightPer20ft") && <td className="px-5 py-3 text-right text-muted whitespace-nowrap tabular-nums">{item.weightPer20ft ? item.weightPer20ft.toFixed(2) : "—"}</td>}
                      {/* Per-warehouse C1/C2/C3 */}
                      {shownWarehouses.map((wn) => {
                        const wh = item.warehouses.find((w) => w.warehouse === wn);
                        const c1 = wh?.c1 ?? 0;
                        const c2 = wh?.c2 ?? 0;
                        const c3 = wh?.c3 ?? 0;
                        return isService ? (
                          <td key={`${wn}-s`} colSpan={3} className="px-2 py-3 text-center text-muted" style={{ borderLeft: "1px solid var(--border)" }}>—</td>
                        ) : ([
                          <td key={`${wn}-c1`} className="px-2 py-3 text-right text-xs font-bold whitespace-nowrap tabular-nums" style={{ color: classColor("C1"), borderLeft: "1px solid var(--border)" }}>{c1.toLocaleString()}</td>,
                          <td key={`${wn}-c2`} className="px-2 py-3 text-right text-xs font-bold whitespace-nowrap tabular-nums" style={{ color: classColor("C2") }}>{c2.toLocaleString()}</td>,
                          <td key={`${wn}-c3`} className="px-2 py-3 text-right text-xs font-bold whitespace-nowrap tabular-nums" style={{ color: classColor("C3") }}>{c3.toLocaleString()}</td>,
                        ]);
                      })}
                      {/* TOTAL */}
                      {!hiddenColumns.has("total") && (
                        <td className="px-5 py-3 text-right whitespace-nowrap font-bold tabular-nums" style={{ color: isLow ? "var(--accent)" : "var(--foreground)", borderLeft: "1px solid var(--border)" }}>
                          {isService ? "—" : t.stock.toLocaleString()}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* ── LOW STOCK VIEW: Simplified table with totals ── */}
          {viewMode === "lowstock" && (
            <table className="inv-table w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap" style={{ position: "sticky", top: 0, zIndex: 2 }}>#</th>
                  <th className="py-2 px-5 text-left text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap cursor-pointer select-none" style={{ position: "sticky", top: 0, zIndex: 2 }} onClick={() => handleSort("sku")}>
                    SKU <SortIndicator col="sku" />
                  </th>
                  <th className="py-2 px-5 text-left text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap cursor-pointer select-none" style={{ position: "sticky", top: 0, zIndex: 2 }} onClick={() => handleSort("name")}>
                    PRODUCT <SortIndicator col="name" />
                  </th>
                  <th className="py-2 px-5 text-left text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap" style={{ position: "sticky", top: 0, zIndex: 2 }}>CATEGORY</th>
                  <th className="py-2 px-3 text-right text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap cursor-pointer select-none" style={{ position: "sticky", top: 0, zIndex: 2 }} onClick={() => handleSort("totalStock")}>
                    STOCK <SortIndicator col="totalStock" />
                  </th>
                  <th className="py-2 px-3 text-right text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap" style={{ position: "sticky", top: 0, zIndex: 2 }}>CAPACITY</th>
                  <th className="py-2 px-3 text-right text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap cursor-pointer select-none" style={{ position: "sticky", top: 0, zIndex: 2 }} onClick={() => handleSort("capPct")}>
                    CAP% <SortIndicator col="capPct" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {!lowStockLoading && sortedLowStock.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-sm text-muted uppercase tracking-wider">No low stock alerts</td>
                  </tr>
                )}
                {paginatedLowStock.map((item, index) => (
                  <tr key={item.sku} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-3 py-3 text-xs text-muted whitespace-nowrap">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                    <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">{item.sku}</td>
                    <td className="px-5 py-3 text-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.name}
                        <span style={{ color: "var(--accent)" }}>{icons.alert}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{item.category}</td>
                    <td className="px-3 py-3 text-right whitespace-nowrap font-bold tabular-nums" style={{ color: "var(--accent)" }}>
                      {item.totalStock.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-right text-muted whitespace-nowrap tabular-nums">
                      {item.capacity.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <CapacityBar pct={item.pct} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Table footer with pagination + export */}
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
          <span className="text-xs text-muted uppercase tracking-wider">
            {viewMode === "overview"
              ? "No category selected"
              : viewMode === "lowstock"
                ? `${sortedLowStock.length} alert${sortedLowStock.length !== 1 ? "s" : ""}`
                : filteredItems.length !== inventoryItems.length
                  ? `${filteredItems.length} of ${inventoryItems.length} items`
                  : `${inventoryItems.length} items`
            }
          </span>
          <div className="flex items-center gap-2">
            {totalPages > 1 && (
              <>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2.5 text-xs uppercase tracking-wider"
                  style={{
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--background)",
                    color: currentPage === 1 ? "var(--muted)" : "var(--foreground)",
                    cursor: currentPage === 1 ? "default" : "pointer",
                    opacity: currentPage === 1 ? 0.5 : 1,
                    minHeight: 44,
                    minWidth: 44,
                  }}
                >
                  Prev
                </button>
                <span className="text-xs text-muted uppercase tracking-wider px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2.5 text-xs uppercase tracking-wider"
                  style={{
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--background)",
                    color: currentPage === totalPages ? "var(--muted)" : "var(--foreground)",
                    cursor: currentPage === totalPages ? "default" : "pointer",
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    minHeight: 44,
                    minWidth: 44,
                  }}
                >
                  Next
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
