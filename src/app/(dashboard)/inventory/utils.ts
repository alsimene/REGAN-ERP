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
  const remainder = decimal - whole;
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

/* ── Category alias map ── */
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

const ALIAS_KEYS = Object.keys(CATEGORY_ALIASES).sort((a, b) => b.length - a.length);

// Part pattern: decimals (75.5), fractions (1/8), mixed fractions (1-3/8)
const PART = String.raw`\d+(?:\.\d+|(?:-\d+)?/\d+)?`;

/* ── Search ── */
export function buildSearchIndex(p: { sku: string; name: string; category: string; sizeMm: string | null; sizeInch: string | null; thicknessMm: string | null }): string {
  return [p.sku, p.name, p.category, p.sizeMm ?? "", p.sizeInch ?? "", p.thicknessMm ?? ""]
    .join(" ")
    .toLowerCase();
}

export function parseSearchTokens(query: string): { category: string | null; dims: string[]; partialDims: string[]; words: string[] } {
  let q = query.toLowerCase().trim();
  if (!q) return { category: null, dims: [], partialDims: [], words: [] };

  // 1. Try longest alias match first (greedy)
  let category: string | null = null;
  for (const alias of ALIAS_KEYS) {
    if (q === alias || q.startsWith(alias + " ")) {
      category = CATEGORY_ALIASES[alias];
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
  return { category, dims, partialDims, words };
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function matchesSearch(idx: string, dims: string[], words: string[], partialDims: string[] = []): boolean {
  // Dimension tokens: exact substring match ("20 x 20" must appear literally)
  for (const d of dims) {
    if (!idx.includes(d)) return false;
  }
  // Partial dimension tokens: prefix match ("75 x " matches "75 x 75", "75 x 50", etc.)
  for (const pd of partialDims) {
    if (!idx.includes(pd)) return false;
  }
  // Word tokens: boundary matching
  for (const t of words) {
    const escaped = escapeRe(t);
    // Numeric tokens use strict boundaries to prevent:
    //   "3" matching inside "3.75" (dot boundary) or "1-3/8" (fraction)
    // Text tokens use start boundary only so "bar" matches "bars"
    const isNumeric = /^\d+(\.\d+)?$/.test(t);
    const pattern = isNumeric
      ? `(?<![\\d.])${escaped}(?![\\d./])`
      : `\\b${escaped}`;
    if (!new RegExp(pattern).test(idx)) return false;
  }
  return true;
}

/* ── Formatting ── */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

