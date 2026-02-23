"use client";

import { useState, useEffect } from "react";
import {
  getAllMarketPrices,
  updateMarketPrice,
  getMarketPriceHistory,
  getCategoriesWithIds,
} from "@/lib/queries";
import { useAuth } from "@/app/context/AuthContext";
import LoadingOverlay from "@/app/components/LoadingOverlay";

type MarketPrice = {
  category_id: string | null;
  category_name: string | null;
  effective_date: string | null;
  price_per_kg: number | null;
  price_source: string | null;
};

type PriceHistoryRow = {
  id: string;
  category: string;
  price: number;
  date: string;
  isActive: boolean | null;
  notes: string;
};

type Category = { id: string; name: string };

const inputStyle: React.CSSProperties = {
  backgroundColor: "var(--input-bg)",
  color: "var(--foreground)",
  border: "1px solid var(--border)",
  fontFamily: "var(--font-body)",
  transition: "background-color 0.4s ease, border-color 0.4s ease, color 0.4s ease",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  color: "var(--muted)",
};

export default function PricesPage() {
  const { user } = useAuth();
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [history, setHistory] = useState<PriceHistoryRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [formCategoryId, setFormCategoryId] = useState<string | "">("");
  const [formPrice, setFormPrice] = useState<number | "">("");
  const [formNotes, setFormNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadData() {
    try {
      const [p, h, c] = await Promise.all([
        getAllMarketPrices(),
        getMarketPriceHistory(),
        getCategoriesWithIds(),
      ]);
      setPrices(p);
      setHistory(h);
      setCategories(c);
    } catch (err) {
      console.error("Prices load error:", err);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleUpdate() {
    setError("");
    setSuccess("");
    if (!formCategoryId) { setError("Select a category."); return; }
    if (!formPrice || Number(formPrice) <= 0) { setError("Enter a valid price."); return; }

    setSubmitting(true);
    try {
      const userName = user?.user_metadata?.full_name || user?.email || "Unknown";
      await updateMarketPrice(formCategoryId as string, Number(formPrice), formNotes || undefined, userName);
      setSuccess("Price updated successfully.");
      setFormCategoryId("");
      setFormPrice("");
      setFormNotes("");
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update price";
      setError(msg);
    }
    setSubmitting(false);
  }

  function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  }

  return (
    <>
      <LoadingOverlay open={loading} message="Loading prices" />
      {/* ── UPDATE PRICE FORM ── */}
      <div
        className="p-5 animate-fade-up space-y-4"
        style={{ backgroundColor: "var(--input-bg)", borderBottom: "2px solid var(--border)", transition: "background-color 0.4s ease" }}
      >
        <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground">
          Update Price
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs uppercase tracking-widest mb-1.5" style={labelStyle}>Category</label>
            <select
              value={formCategoryId}
              onChange={(e) => setFormCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm"
              style={inputStyle}
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest mb-1.5" style={labelStyle}>New Price (₱/kg)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-3 py-2 text-sm"
              style={inputStyle}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest mb-1.5" style={labelStyle}>Notes</label>
            <input
              type="text"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm"
              style={inputStyle}
              placeholder="Optional"
            />
          </div>

          <div>
            <button
              onClick={handleUpdate}
              disabled={submitting}
              className="w-full px-4 py-2 text-sm uppercase tracking-wider cursor-pointer disabled:opacity-50"
              style={{
                backgroundColor: "var(--btn-bg)",
                color: "var(--btn-text)",
                fontFamily: "var(--font-body)",
                transition: "background-color 0.3s ease",
              }}
            >
              {submitting ? "Updating..." : "Update Price"}
            </button>
          </div>
        </div>

        {error && <p className="text-sm" style={{ color: "var(--error)" }}>{error}</p>}
        {success && <p className="text-sm" style={{ color: "var(--class-c1)" }}>{success}</p>}
      </div>

      {/* ── CURRENT PRICES TABLE ── */}
      <div
        className="animate-fade-up delay-200"
        style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground">
            Current Market Prices
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Category", "Price/kg (₱)", "Effective Date", "Source"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted">
                    No prices set yet. Use the form above to add prices.
                  </td>
                </tr>
              ) : (
                prices.map((p) => (
                  <tr key={p.category_id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-5 py-3 text-foreground whitespace-nowrap">{p.category_name ?? "—"}</td>
                    <td className="px-5 py-3 text-foreground font-medium whitespace-nowrap">
                      {p.price_per_kg != null
                        ? `₱${Number(p.price_per_kg).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{formatDate(p.effective_date)}</td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap text-xs uppercase tracking-wider">
                      {p.price_source ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          <span className="text-xs text-muted uppercase tracking-wider">
            {prices.length} of {categories.length} categories have prices
          </span>
        </div>
      </div>

      {/* ── PRICE HISTORY TABLE ── */}
      <div
        className="animate-fade-up delay-400"
        style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground">
            Price History
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Category", "Price/kg (₱)", "Date", "Status", "Notes"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted">
                    No price history yet
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-5 py-3 text-foreground whitespace-nowrap">{h.category}</td>
                    <td className="px-5 py-3 text-foreground font-medium whitespace-nowrap">
                      ₱{h.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{h.date}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span
                        className="text-xs uppercase tracking-wider font-medium"
                        style={{ color: h.isActive ? "var(--class-c1)" : "var(--muted)" }}
                      >
                        {h.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted">{h.notes || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          <span className="text-xs text-muted uppercase tracking-wider">
            Showing last {history.length} changes
          </span>
        </div>
      </div>
    </>
  );
}
