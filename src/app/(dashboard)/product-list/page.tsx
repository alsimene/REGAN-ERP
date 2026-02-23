"use client";

import { useState, useMemo, useEffect } from "react";
import { getAllProductsCatalog, getCatalogCategories, updateProductStatus } from "@/lib/queries";
import { matchesSearch } from "../inventory/utils";
import { usePagination } from "../inventory/hooks/usePagination";
import Pagination from "../inventory/shared/Pagination";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import SearchInput from "@/app/components/SearchInput";
import DataTable, { type ColumnDef } from "@/app/components/DataTable";

type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  enabled: boolean;
};

/* ── inline SVG icons (no external deps) ── */
const icons = {
  package: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  layers: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  barChart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  x: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

/* ── category alias map ── */
const CATEGORY_ALIASES: Record<string, string> = {
  "angle bar": "Angle Bars", "angle bars": "Angle Bars", "angle": "Angle Bars",
  "channel bar": "Channel Bars", "channel bars": "Channel Bars", "channel": "Channel Bars",
  "c-channel": "Channel Bars",
  "deformed bar": "Deformed Bars", "deformed bars": "Deformed Bars",
  "deformed": "Deformed Bars", "rebar": "Deformed Bars",
  "flat bar": "Flat Bars", "flat bars": "Flat Bars", "flat": "Flat Bars",
  "gi pipe": "Pipes", "bi pipe": "Pipes", "pipe": "Pipes", "pipes": "Pipes",
  "square tube": "Tubings", "rect tube": "Tubings",
  "tube": "Tubings", "tubing": "Tubings", "tubings": "Tubings",
  "ms plate": "Plates", "checkered plate": "Plates",
  "plate": "Plates", "plates": "Plates",
  "wide flange": "Wide Flanges", "wide flanges": "Wide Flanges", "flange": "Wide Flanges",
  "c-purlin": "Purlins", "purlin": "Purlins", "purlins": "Purlins",
  // SKU prefixes
  "ab": "Angle Bars", "ua": "Angle Bars",
  "cb": "Channel Bars",
  "db": "Deformed Bars",
  "fb": "Flat Bars",
  "pi": "Pipes",
  "tu": "Tubings",
  "pl": "Plates",
  "wf": "Wide Flanges",
  "cp": "Purlins",
};

// Pre-sort alias keys by length descending (greedy match)
const ALIAS_KEYS = Object.keys(CATEGORY_ALIASES).sort((a, b) => b.length - a.length);

/* ── search helpers ── */
function buildProductSearchIndex(p: { sku: string; name: string; category: string; description: string }): string {
  return [p.sku, p.name, p.category, p.description]
    .join(" ")
    .toLowerCase()
    .replace(/"/g, ""); // strip inch marks so "3 x 1-3/8" matches
}

// Part pattern: decimals (75.5), fractions (1/8), mixed fractions (1-3/8)
const PART = String.raw`\d+(?:\.\d+|(?:-\d+)?/\d+)?`;

/**
 * Parse search query supporting category aliases + dimensions.
 * Supports metric (75x75x6.0) and fractional-inch (3x1-3/8) sizes.
 *
 * e.g. "angle bar 75x75x6.0"   → category: "Angle Bars", dims: ["75 x 75"], words: ["6.0"]
 *      "channel 3x1-3/8"       → category: "Channel Bars", dims: ["3 x 1-3/8"], words: []
 *      "rebar 16"              → category: "Deformed Bars", dims: [], words: ["16"]
 *      "1/8x1"                 → category: null, dims: ["1/8 x 1"], words: []
 */
function parseProductSearch(query: string): {
  category: string | null;
  dims: string[];
  partialDims: string[];
  words: string[];
} {
  let q = query.toLowerCase().trim();
  if (!q) return { category: null, dims: [], partialDims: [], words: [] };

  // 1. Try longest alias match first (greedy)
  let matchedCategory: string | null = null;
  for (const alias of ALIAS_KEYS) {
    if (q === alias || q.startsWith(alias + " ")) {
      matchedCategory = CATEGORY_ALIASES[alias];
      q = q.slice(alias.length).trim();
      break;
    }
  }

  const dims: string[] = [];
  const partialDims: string[] = [];

  // 2. Three-part dimensions: "75x75x6.0" → dim "75 x 75" + thickness word "6.0"
  const re3 = new RegExp(`(${PART})\\s*[xX×]\\s*(${PART})\\s*[xX×]\\s*(${PART})`, "g");
  q = q.replace(re3, (_, a, b, c) => { dims.push(`${a} x ${b}`); return ` ${c} `; });

  // 3. Two-part dimensions: "50x75", "3x1-3/8", "1/8x1"
  const re2 = new RegExp(`(${PART})\\s*[xX×]\\s*(${PART})`, "g");
  q = q.replace(re2, "$1 x $2");
  const reDim = new RegExp(`${PART} x ${PART}`, "g");
  q = q.replace(reDim, (m) => { dims.push(m); return " "; });

  // 4. Partial dimensions: "75x" or "75 x" (number followed by x with nothing after)
  const rePartial = new RegExp(`(${PART})\\s*[xX×]\\s*$`);
  const partialMatch = q.match(rePartial);
  if (partialMatch) {
    partialDims.push(`${partialMatch[1]} x `);
    q = q.replace(rePartial, " ");
  }

  const words = q.split(/\s+/).filter(Boolean);
  return { category: matchedCategory, dims, partialDims, words };
}

/* ── column definitions for DataTable ── */
const TABLE_COLUMNS: ColumnDef<Product>[] = [
  { key: "#", header: "#", align: "center", minWidth: 50 },
  { key: "sku", header: "SKU", minWidth: 100 },
  { key: "name", header: "Product Name", minWidth: 200 },
  { key: "category", header: "Category", minWidth: 120 },
  { key: "description", header: "Description", minWidth: 220 },
  { key: "status", header: "Status", align: "center", minWidth: 80 },
];

export default function Inventory3Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /* ── fetch live data from Supabase ── */
  useEffect(() => {
    Promise.all([getAllProductsCatalog(), getCatalogCategories()])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .catch((err) => console.error("Failed to load products:", err))
      .finally(() => setLoading(false));
  }, []);

  /* ── debounce search input ── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  /* ── parse the debounced search ── */
  const parsed = useMemo(() => parseProductSearch(debouncedSearch), [debouncedSearch]);

  /* ── pre-build search index (once per products change) ── */
  const indexMap = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => map.set(p.sku, buildProductSearchIndex(p)));
    return map;
  }, [products]);

  /* ── filtering ── */
  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return products;
    const { category, dims, partialDims, words } = parsed;
    const searchWords = category
      ? [...words, ...category.toLowerCase().split(/\s+/)]
      : words;
    if (dims.length === 0 && partialDims.length === 0 && searchWords.length === 0) return products;
    return products.filter((p) => {
      const idx = indexMap.get(p.sku) ?? "";
      return matchesSearch(idx, dims, searchWords, partialDims);
    });
  }, [debouncedSearch, parsed, indexMap, products]);

  /* ── pagination ── */
  const { currentPage, totalPages, prevPage, nextPage, pageSlice } = usePagination(filtered.length);
  const pageProducts = useMemo(
    () => filtered.slice(pageSlice.start, pageSlice.end),
    [filtered, pageSlice],
  );

  /* ── toggle enable/disable ── */
  function handleToggle(product: Product) {
    const newStatus = !product.enabled;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, enabled: newStatus } : p))
    );
    updateProductStatus(product.id, newStatus).catch((err) => {
      console.error("Failed to update product status:", err);
      // revert on failure
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, enabled: product.enabled } : p))
      );
    });
  }

  /* ── stats ── */
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.enabled).length;
  const disabledProducts = totalProducts - activeProducts;
  const totalCategories = categories.length;

  return (
    <>
    <LoadingOverlay open={loading} message="Loading products" />
    <div className="animate-fade-up space-y-5">
      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: icons.package, label: "Total Products", value: totalProducts.toLocaleString() },
          { icon: icons.barChart, label: "Active", value: activeProducts.toLocaleString() },
          { icon: icons.x, label: "Disabled", value: disabledProducts.toLocaleString() },
          { icon: icons.layers, label: "Categories", value: totalCategories.toString() },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 px-5 py-4"
            style={{
              backgroundColor: "var(--input-bg)",
              border: "1px solid var(--border)",
              transition: "background-color 0.3s ease",
            }}
          >
            <div
              className="w-10 h-10 flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--accent)", color: "#fff", borderRadius: "2px" }}
            >
              {stat.icon}
            </div>
            <div>
              <p
                className="text-[11px] uppercase tracking-wider"
                style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
              >
                {stat.label}
              </p>
              <p
                className="text-xl font-semibold tabular-nums"
                style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}
              >
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="w-full sm:w-80">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="e.g. channel 3x1-3/8, angle 75x75x6"
        />

        {/* ── Parsed tokens row ── */}
        {debouncedSearch.trim() && (parsed.category || parsed.dims.length > 0 || parsed.partialDims.length > 0 || parsed.words.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {parsed.category && (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "#fff",
                }}
              >
                {parsed.category}
              </span>
            )}
            {parsed.dims.map((d, i) => (
              <span
                key={`dim-${i}`}
                className="inline-flex items-center px-2 py-0.5 text-[10px] tracking-wider font-mono"
                style={{
                  backgroundColor: "var(--input-bg)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
              >
                {d}
              </span>
            ))}
            {parsed.partialDims.map((d, i) => (
              <span
                key={`pdim-${i}`}
                className="inline-flex items-center px-2 py-0.5 text-[10px] tracking-wider font-mono"
                style={{
                  backgroundColor: "var(--input-bg)",
                  color: "var(--foreground)",
                  border: "1px solid var(--border)",
                }}
              >
                {d.trim()}…
              </span>
            ))}
            {parsed.words.map((w, i) => (
              <span
                key={`word-${i}`}
                className="inline-flex items-center px-2 py-0.5 text-[10px] tracking-wider"
                style={{
                  backgroundColor: "var(--input-bg)",
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
              >
                {/^\d+(\.\d+)?$/.test(w) ? `${w} mm` : w}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Results count ── */}
      <p
        className="text-[11px] uppercase tracking-wider"
        style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
      >
        Showing {pageSlice.start + 1}–{Math.min(pageSlice.end, filtered.length)} of {filtered.length} products
      </p>

      {/* ── Product Table ── */}
      <DataTable<Product>
        columns={TABLE_COLUMNS}
        data={pageProducts}
        rowKey={(row) => row.sku}
        renderCell={(row, col, rowIndex) => {
          switch (col.key) {
            case "#":
              return (
                <span className="font-mono text-xs font-semibold" style={{ color: "var(--foreground)" }}>
                  {pageSlice.start + rowIndex + 1}
                </span>
              );
            case "sku":
              return (
                <span className="font-mono text-xs" style={{ color: "var(--accent)" }}>
                  {row.sku}
                </span>
              );
            case "name":
              return <span className="font-medium">{row.name}</span>;
            case "category":
              return <span style={{ color: "var(--muted)" }}>{row.category}</span>;
            case "description":
              return (
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  {row.description}
                </span>
              );
            case "status":
              return (
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(row); }}
                  className="relative inline-flex items-center h-5 w-9 shrink-0 cursor-pointer"
                  style={{ outline: "none" }}
                  title={row.enabled ? "Disable product" : "Enable product"}
                >
                  <span
                    className="block h-5 w-9 rounded-full transition-colors duration-200"
                    style={{ backgroundColor: row.enabled ? "var(--accent)" : "var(--border)" }}
                  />
                  <span
                    className="absolute left-0.5 top-0.5 block h-4 w-4 rounded-full bg-white transition-transform duration-200"
                    style={{ transform: row.enabled ? "translateX(16px)" : "translateX(0)" }}
                  />
                </button>
              );
            default:
              return null;
          }
        }}
        emptyMessage="No products found."
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={products.length}
        filteredItems={filtered.length}
        onPrev={prevPage}
        onNext={nextPage}
      />
    </div>
    </>
  );
}
