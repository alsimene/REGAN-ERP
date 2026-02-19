"use client";

import { useState, useMemo, useEffect } from "react";
import { products, categories } from "./data";
import { matchesSearch } from "../inventory2/utils";

/* ── inline SVG icons (no external deps) ── */
const icons = {
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
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

/* ── stock status helpers ── */
function stockStatus(stock: number, capacity: number) {
  const pct = capacity > 0 ? (stock / capacity) * 100 : 0;
  if (pct >= 70) return { label: "In Stock", color: "var(--class-c1, #22c55e)" };
  if (pct >= 30) return { label: "Low Stock", color: "var(--class-c2, #f59e0b)" };
  return { label: "Critical", color: "var(--accent, #ef4444)" };
}

/* ── search helpers ── */
function buildProductSearchIndex(p: { sku: string; name: string; category: string; description: string }): string {
  return [p.sku, p.name, p.category, p.description].join(" ").toLowerCase();
}

/**
 * Parse search query supporting category aliases + AxBxC dimensions.
 * e.g. "angle bar 75x75x6.0" → category: "Angle Bars", dims: ["75 x 75"], words: ["6.0"]
 *      "rebar 16"             → category: "Deformed Bars", dims: [], words: ["16"]
 *      "75x75"                → category: null, dims: ["75 x 75"], words: []
 */
function parseProductSearch(query: string): {
  category: string | null;
  dims: string[];
  words: string[];
} {
  let q = query.toLowerCase().trim();
  if (!q) return { category: null, dims: [], words: [] };

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

  // 2. Three-part dimensions: "75x75x6.0" → dim "75 x 75" + thickness word "6.0"
  q = q.replace(
    /(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)/g,
    (_, a, b, c) => { dims.push(`${a} x ${b}`); return ` ${c} `; }
  );

  // 3. Two-part dimensions: "50x75" → "50 x 75"
  q = q.replace(/(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)/g, "$1 x $2");
  q = q.replace(/\d+(?:\.\d+)? x \d+(?:\.\d+)?/g, (m) => { dims.push(m); return " "; });

  const words = q.split(/\s+/).filter(Boolean);
  return { category: matchedCategory, dims, words };
}

export default function Inventory3Page() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  /* ── debounce search input ── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  /* ── parse the debounced search ── */
  const parsed = useMemo(() => parseProductSearch(debouncedSearch), [debouncedSearch]);

  /* ── pre-build search index (once) ── */
  const indexMap = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((p) => map.set(p.sku, buildProductSearchIndex(p)));
    return map;
  }, []);

  /* ── filtering ── */
  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return products;
    const { category, dims, words } = parsed;
    // When a category alias was detected and stripped, inject category name
    // words back so they match against the search index
    const searchWords = category
      ? [...words, ...category.toLowerCase().split(/\s+/)]
      : words;
    if (dims.length === 0 && searchWords.length === 0) return products;
    return products.filter((p) => {
      const idx = indexMap.get(p.sku) ?? "";
      return matchesSearch(idx, dims, searchWords);
    });
  }, [debouncedSearch, parsed, indexMap]);

  /* ── stats ── */
  const totalProducts = products.length;
  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const totalCategories = categories.length;

  return (
    <div className="animate-fade-up space-y-5">
      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: icons.package, label: "Total Products", value: totalProducts.toLocaleString() },
          { icon: icons.barChart, label: "Total Stock", value: totalStock.toLocaleString() },
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
        <div className="relative">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--muted)" }}
          >
            {icons.search}
          </span>
          <input
            type="text"
            placeholder="e.g. angle bar 75x75x6.0"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm outline-none"
            style={{
              backgroundColor: "var(--input-bg)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-body)",
              transition: "background-color 0.3s ease, border-color 0.3s ease",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--foreground)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer p-0.5"
              style={{ color: "var(--muted)" }}
            >
              {icons.x}
            </button>
          )}
        </div>

        {/* ── Parsed tokens row ── */}
        {debouncedSearch.trim() && (parsed.category || parsed.dims.length > 0 || parsed.words.length > 0) && (
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
        Showing {filtered.length} of {products.length} products
      </p>

      {/* ── Product Table ── */}
      <div style={{ border: "1px solid var(--border)", overflow: "hidden" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: "var(--font-body)", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {["SKU", "Name", "Category", "Description", "Stock", "Capacity", "Status"].map(
                  (header) => (
                    <th
                      key={header}
                      className="text-left px-4 py-3 text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap"
                      style={{ color: "var(--muted)" }}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-sm"
                    style={{ color: "var(--muted)" }}
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => {
                  const status = stockStatus(p.stock, p.capacity);
                  const pct = p.capacity > 0 ? Math.round((p.stock / p.capacity) * 100) : 0;
                  return (
                    <tr
                      key={p.sku}
                      style={{
                        backgroundColor: i % 2 === 0 ? "var(--row-even)" : "var(--row-odd)",
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
                    >
                      <td
                        className="px-4 py-3 font-mono text-xs whitespace-nowrap"
                        style={{ color: "var(--accent)" }}
                      >
                        {p.sku}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        {p.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--muted)" }}>
                        {p.category}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
                        {p.description}
                      </td>
                      <td className="px-4 py-3 tabular-nums whitespace-nowrap" style={{ color: "var(--foreground)" }}>
                        {p.stock.toLocaleString()} <span className="text-[10px]" style={{ color: "var(--muted)" }}>{p.unit}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: 48,
                              backgroundColor: "var(--border)",
                            }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(pct, 100)}%`,
                                backgroundColor: status.color,
                                transition: "width 0.3s ease",
                              }}
                            />
                          </div>
                          <span
                            className="text-[10px] tabular-nums"
                            style={{ color: "var(--muted)", minWidth: 28, textAlign: "right" }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium"
                          style={{
                            backgroundColor: `${status.color}18`,
                            color: status.color,
                            border: `1px solid ${status.color}30`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: status.color }}
                          />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
