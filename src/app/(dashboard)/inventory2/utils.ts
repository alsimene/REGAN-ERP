import type { Classification, SizeUnit } from "./types";

/* ── Classification ── */
export const classLabels: Record<Classification, string> = {
  C1: "Good to Sell",
  C2: "Needs Repair",
  C3: "Not for Sale",
};

export function classColor(c: Classification): string {
  switch (c) {
    case "C1": return "var(--class-c1)";
    case "C2": return "var(--class-c2)";
    case "C3": return "var(--class-c3)";
  }
}

/* ── Decimal → Fraction (nearest 1/16) ── */
function toFraction(decimal: number): string {
  const whole = Math.floor(decimal);
  let remainder = decimal - whole;
  if (remainder < 0.01) return whole === 0 ? '0"' : `${whole}"`;

  // Snap to nearest 1/16
  const sixteenths = Math.round(remainder * 16);
  if (sixteenths === 0) return `${whole}"`;
  if (sixteenths === 16) return `${whole + 1}"`;

  // Reduce fraction
  let num = sixteenths;
  let den = 16;
  while (num % 2 === 0) { num /= 2; den /= 2; }

  if (whole === 0) return `${num}/${den}"`;
  return `${whole} ${num}/${den}"`;
}

/* ── Size Conversion ── */
export function convertSizePart(part: string, target: "in" | "mm"): string {
  const trimmed = part.trim();
  // Match fractional inches: 4", 3/4", 1 5/8", 1-5/8", etc.
  const inchMatch = trimmed.match(/^(\d+)?[\s-]*(?:(\d+)\/(\d+))?\s*"$/);
  if (inchMatch && (inchMatch[1] || inchMatch[2])) {
    const whole = inchMatch[1] ? parseFloat(inchMatch[1]) : 0;
    const num = inchMatch[2] ? parseFloat(inchMatch[2]) : 0;
    const den = inchMatch[3] ? parseFloat(inchMatch[3]) : 1;
    const val = whole + num / den;
    if (target === "mm") return parseFloat((val * 25.4).toFixed(3)).toString();
    return trimmed;
  }
  // Match plain numbers (mm values)
  const mmMatch = trimmed.match(/^([\d.]+)/);
  if (mmMatch) {
    const val = parseFloat(mmMatch[1]);
    if (target === "in") return toFraction(val / 25.4);
    return trimmed;
  }
  return trimmed;
}

export function convertSize(raw: string | null, target: "original" | "in" | "mm"): string {
  if (!raw || raw === "—" || target === "original") return raw ?? "—";
  const parts = raw.split(/\s*[x×]\s*/i);
  return parts.map((p) => convertSizePart(p, target)).join(" x ");
}

/* ── Display Size (picks inch vs mm authority) ── */
export function displaySize(
  sizeMm: string | null,
  sizeInch: string | null,
  unit: SizeUnit,
): string {
  if (unit === "in") {
    if (sizeInch) return sizeInch;
    return convertSize(sizeMm, "in");
  }
  if (unit === "mm") {
    if (sizeMm) return sizeMm;
    return convertSize(sizeInch, "mm");
  }
  // "original" — prefer inch notation when available (pipes, tubings, flat bars)
  return sizeInch ?? sizeMm ?? "—";
}

export function sizeColumnLabel(unit: SizeUnit): string {
  if (unit === "in") return 'SIZE (")';
  if (unit === "mm") return "SIZE (MM)";
  return "SIZE";
}

export function thickColumnLabel(unit: SizeUnit): string {
  if (unit === "in") return 'THICK (")';
  if (unit === "mm") return "THICK (MM)";
  return "THICK (MM)";
}

/* ── Search ── */
export function buildSearchIndex(p: { sku: string; name: string; category: string; sizeMm: string | null; sizeInch: string | null; thicknessMm: string | null }): string {
  return [p.sku, p.name, p.category, p.sizeMm ?? "", p.sizeInch ?? "", p.thicknessMm ?? ""]
    .join(" ")
    .toLowerCase();
}

export function parseSearchTokens(query: string): { dims: string[]; words: string[] } {
  let q = query.toLowerCase().trim();
  if (!q) return { dims: [], words: [] };
  // Normalize "50x75" / "50X75" / "50×75" → "50 x 75"
  q = q.replace(/(\d+(?:\.\d+)?)\s*[xX×]\s*(\d+(?:\.\d+)?)/g, "$1 x $2");

  // Extract dimension patterns as single tokens (e.g. "20 x 20")
  const dims: string[] = [];
  const remaining = q.replace(/\d+(?:\.\d+)? x \d+(?:\.\d+)?/g, (m) => { dims.push(m); return " "; });

  // Split remaining into word tokens
  const words = remaining.split(/\s+/).filter(Boolean);
  return { dims, words };
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function matchesSearch(idx: string, dims: string[], words: string[]): boolean {
  // Dimension tokens: exact substring match ("20 x 20" must appear literally)
  for (const d of dims) {
    if (!idx.includes(d)) return false;
  }
  // Word tokens: word-boundary matching
  for (const t of words) {
    const escaped = escapeRe(t);
    // Numeric tokens (e.g. "2.0", "16") use boundaries on both sides to prevent "20" matching "200"
    // Text tokens (e.g. "bar") use start boundary only so "bar" matches "bars"
    const isNumeric = /^\d+(\.\d+)?$/.test(t);
    const pattern = isNumeric ? `\\b${escaped}\\b` : `\\b${escaped}`;
    if (!new RegExp(pattern).test(idx)) return false;
  }
  return true;
}

/* ── Formatting ── */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}
