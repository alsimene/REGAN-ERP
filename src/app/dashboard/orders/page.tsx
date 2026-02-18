"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOrders, computeOrderStats } from "@/lib/queries";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import { getDrafts, deleteDraft as removeDraft, type OrderDraft } from "@/lib/orderDrafts";

/* ── icons ── */
const icons = {
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  clipboard: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  file: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  x: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  resume: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.855z" />
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  arrowRight: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
};

function statusColor(status: string) {
  switch (status) {
    case "Pending Approval": return "var(--draft)";
    case "Approved": return "var(--class-c1)";
    case "Processing": return "var(--muted)";
    case "Partial Delivered": return "var(--draft)";
    case "Delivered": return "var(--foreground)";
    case "Completed": return "var(--class-c1)";
    case "Cancelled": return "var(--accent)";
    case "Rejected": return "var(--accent)";
    default: return "var(--foreground)";
  }
}

function paymentColor(payment: string) {
  return payment === "Paid" ? "var(--class-c1)" : "var(--accent)";
}

// Stat card labels → filter mapping
const statFilterMap: Record<string, string> = {
  "Total Orders": "All",
  "Pending Approval": "Pending Approval",
  "Approved": "Approved",
  "Processing": "Processing",
  "Delivered": "Delivered",
  "Completed": "Completed",
  "Drafts": "Drafts",
};

type Order = {
  id: string;
  date: string;
  client: string;
  product: string;
  qty: string;
  total: string;
  status: string;
  payment: string;
};

const PAGE_SIZE = 20;

export default function OrdersPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [drafts, setDrafts] = useState<OrderDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getOrders().then((data) => {
      setAllOrders(data);
      setLoading(false);
    }).catch((err) => {
      console.error("Orders load error:", err);
      setLoading(false);
    });
    setDrafts(getDrafts());
  }, []);

  const orderStats = computeOrderStats(allOrders);

  // Filter by status
  const statusFiltered = activeFilter === "All"
    ? allOrders
    : allOrders.filter((o) => o.status === activeFilter);

  // Filter by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return statusFiltered;
    const q = searchQuery.toLowerCase();
    return statusFiltered.filter((o) =>
      o.id.toLowerCase().includes(q) ||
      o.client.toLowerCase().includes(q) ||
      o.product.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q)
    );
  }, [statusFiltered, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery]);

  return (
    <>
      <LoadingOverlay open={loading} message="Loading orders" />
      {/* ── STAT CARDS (clickable filters) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-4">
        {[...orderStats, { label: "Drafts", value: drafts.length.toLocaleString() }].map((stat, i) => {
          const filterKey = statFilterMap[stat.label] ?? "All";
          const isActive = activeFilter === filterKey;
          return (
            <div
              key={stat.label}
              onClick={() => { setActiveFilter(filterKey); setSearchQuery(""); }}
              className="relative p-5 animate-fade-up cursor-pointer"
              style={{
                backgroundColor: "var(--input-bg)",
                borderBottom: isActive ? "2px solid var(--accent)" : "2px solid var(--border)",
                animationDelay: `${i * 0.1}s`,
                transition: "background-color 0.4s ease, border-color 0.4s ease",
              }}
            >
              <div
                className="absolute top-2 right-2 rounded-full"
                style={{ width: "4px", height: "4px", backgroundColor: isActive ? "var(--accent)" : "var(--border)" }}
              />
              <p
                className="text-xs uppercase tracking-widest font-[family-name:var(--font-body)]"
                style={{ color: isActive ? "var(--accent)" : "var(--muted)" }}
              >
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-[family-name:var(--font-display)] text-foreground tracking-tight">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── ORDERS TABLE ── */}
      <div
        className="animate-fade-up delay-400"
        style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
      >
        {/* Header bar */}
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground">
              {activeFilter === "All" ? "All Orders" : activeFilter === "Drafts" ? "Drafts" : `${activeFilter} Orders`}
            </h3>
            <div className="flex items-center gap-3">
              {/* Search */}
              {activeFilter !== "Drafts" && (
                <div
                  className="flex items-center gap-1.5 px-3 py-2"
                  style={{
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--background)",
                    transition: "border-color 0.2s ease",
                    minWidth: 220,
                  }}
                >
                  <span className="text-muted shrink-0">{icons.search}</span>
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search orders..."
                    className="bg-transparent outline-none text-sm w-full"
                    style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
                      className="text-muted cursor-pointer shrink-0"
                      style={{ transition: "color 0.2s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                    >
                      {icons.x}
                    </button>
                  )}
                </div>
              )}
              <Link
                href="/dashboard/orders/new"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-wider"
                style={{
                  backgroundColor: "var(--btn-bg)",
                  color: "var(--btn-text)",
                  fontFamily: "var(--font-body)",
                  transition: "background-color 0.3s ease",
                }}
              >
                {icons.plus}
                New Order
              </Link>
            </div>
          </div>
        </div>

        {activeFilter === "Drafts" ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["#", "Draft ID", "Client", "Saved", "Items", "Total", "Status", "Actions"].map((h) => (
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
                  {drafts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-14 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span style={{ color: "var(--border)" }}>{icons.file}</span>
                          <span className="text-sm text-muted">No drafts saved</span>
                          <span className="text-xs text-muted opacity-60">Drafts will appear here when you save orders in progress</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    drafts.map((draft, idx) => {
                      const draftTotal = draft.items.reduce(
                        (s, i) => s + i.quantity * i.weight_per_piece * i.price_per_kg,
                        0
                      );
                      const taxed = draftTotal + Math.round(draftTotal * 0.12 * 100) / 100;
                      return (
                        <tr
                          key={draft.draftId}
                          className="transition-colors"
                          style={{ borderBottom: "1px solid var(--border)" }}
                        >
                          <td className="px-3 py-3 text-xs text-muted whitespace-nowrap">{idx + 1}</td>
                          <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">{draft.draftId}</td>
                          <td className="px-5 py-3 text-foreground whitespace-nowrap">{draft.clientName || <span className="text-muted">{"\u2014"}</span>}</td>
                          <td className="px-5 py-3 text-muted whitespace-nowrap">
                            {new Date(draft.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="px-5 py-3 text-muted whitespace-nowrap">{draft.items.length} item(s)</td>
                          <td className="px-5 py-3 text-foreground font-medium whitespace-nowrap">
                            {"\u20B1"}{taxed.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span
                              className="text-xs uppercase tracking-wider font-medium"
                              style={{ color: "var(--draft)" }}
                            >
                              Draft
                            </span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="flex gap-3">
                              <button
                                onClick={() => router.push(`/dashboard/orders/new?draft=${draft.draftId}`)}
                                className="inline-flex items-center gap-1 text-xs uppercase tracking-wider cursor-pointer"
                                style={{ color: "var(--foreground)", fontFamily: "var(--font-body)", transition: "opacity 0.2s ease" }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                              >
                                {icons.resume}
                                Resume
                              </button>
                              <button
                                onClick={() => {
                                  removeDraft(draft.draftId);
                                  setDrafts(getDrafts());
                                }}
                                className="inline-flex items-center gap-1 text-xs uppercase tracking-wider cursor-pointer"
                                style={{ color: "var(--accent)", fontFamily: "var(--font-body)", transition: "opacity 0.2s ease" }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                              >
                                {icons.trash}
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
              <span className="text-xs text-muted uppercase tracking-wider">
                {drafts.length} draft{drafts.length !== 1 ? "s" : ""}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["#", "Order ID", "Date", "Client", "Product", "Qty", "Total", "Status", "Payment"].map((h) => (
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
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-14 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span style={{ color: "var(--border)" }}>{icons.clipboard}</span>
                          <span className="text-sm text-muted">
                            {searchQuery ? "No orders match your search" : "No orders found"}
                          </span>
                          <span className="text-xs text-muted opacity-60">
                            {searchQuery ? "Try a different search term" : "Create a new order to get started"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedOrders.map((order, index) => (
                      <tr
                        key={order.id}
                        className="transition-colors cursor-pointer"
                        style={{ borderBottom: "1px solid var(--border)" }}
                        onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--background)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td className="px-3 py-3 text-xs text-muted whitespace-nowrap">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                        <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">{order.id}</td>
                        <td className="px-5 py-3 text-muted whitespace-nowrap">{order.date}</td>
                        <td className="px-5 py-3 text-foreground whitespace-nowrap">{order.client}</td>
                        <td className="px-5 py-3 text-muted whitespace-nowrap">{order.product}</td>
                        <td className="px-5 py-3 text-muted whitespace-nowrap">{order.qty}</td>
                        <td className="px-5 py-3 text-foreground font-medium whitespace-nowrap">{order.total}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span
                            className="text-xs uppercase tracking-wider font-medium"
                            style={{ color: statusColor(order.status) }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span
                            className="text-xs uppercase tracking-wider font-medium"
                            style={{ color: paymentColor(order.payment) }}
                          >
                            {order.payment}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table footer with pagination */}
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
              <span className="text-xs text-muted uppercase tracking-wider">
                {searchQuery
                  ? `${filteredOrders.length} result${filteredOrders.length !== 1 ? "s" : ""}`
                  : `Showing ${filteredOrders.length} of ${allOrders.length} orders`
                }
              </span>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-xs uppercase tracking-wider cursor-pointer"
                    style={{
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--background)",
                      color: currentPage === 1 ? "var(--muted)" : "var(--foreground)",
                      cursor: currentPage === 1 ? "default" : "pointer",
                      opacity: currentPage === 1 ? 0.5 : 1,
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    Prev
                  </button>
                  <span className="text-xs text-muted uppercase tracking-wider">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-xs uppercase tracking-wider cursor-pointer"
                    style={{
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--background)",
                      color: currentPage === totalPages ? "var(--muted)" : "var(--foreground)",
                      cursor: currentPage === totalPages ? "default" : "pointer",
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
