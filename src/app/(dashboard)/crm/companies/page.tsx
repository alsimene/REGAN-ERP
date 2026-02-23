"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { CrmCompany, CrmPerson } from "@/lib/crmTypes";
import {
  getCrmCompanies,
  getCrmPeople,
  createCrmCompany,
  updateCrmCompany,
  deleteCrmCompany,
  getCrmActivities,
} from "@/lib/crmQueries";
import { CrmActivity } from "@/lib/crmTypes";
import ConfirmModal from "@/app/components/ConfirmModal";

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
  x: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  xLg: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  building: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V3a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4" /><line x1="12" y1="12" x2="12" y2="12.01" />
    </svg>
  ),
  sortAsc: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ),
  sortDesc: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  globe: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  users: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  phone: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  mail: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  mapPin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  edit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.855z" />
    </svg>
  ),
  star: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  starFilled: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

/* ── helpers ── */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatRevenue(amount: number | null): string {
  if (!amount) return "\u2014";
  return "\u20B1" + amount.toLocaleString();
}
function getCompanyInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "?";
}
function getAvailableCredit(c: CrmCompany): number | null {
  if (c.credit_limit == null) return null;
  return c.credit_limit - (c.outstanding_balance ?? 0);
}
function getUtilizationPct(c: CrmCompany): number | null {
  if (c.credit_limit == null || c.credit_limit === 0) return null;
  return Math.round(((c.outstanding_balance ?? 0) / c.credit_limit) * 100);
}
function creditColor(pct: number): string {
  if (pct >= 80) return "var(--class-c3)";
  if (pct >= 50) return "var(--class-c2)";
  return "var(--class-c1)";
}

type SortKey = "name" | "industry" | "city" | "outstanding_balance" | "credit_limit" | "created_at";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

const activityMeta: Record<string, { label: string; color: string }> = {
  note: { label: "Note", color: "var(--muted)" },
  call: { label: "Call", color: "#3b82f6" },
  email: { label: "Email", color: "#8b5cf6" },
  meeting: { label: "Meeting", color: "#f59e0b" },
  task: { label: "Task", color: "var(--class-c1)" },
};

const emptyCompany: Omit<CrmCompany, "id" | "created_at" | "updated_at"> = {
  name: "",
  domain: "",
  industry: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  country: "Philippines",
  logo_url: "",
  annual_revenue: null,
  credit_limit: null,
  outstanding_balance: null,
  payment_terms: null,
  is_icp: false,
  notes: "",
  created_by: "",
};

const TERMS_OPTIONS = ["COD", "CBD", "Net 15", "Net 30", "Net 60", "Net 90"];

/* ── Extracted components (module scope to prevent re-mount on state change) ── */
const SortHeader = ({ label, col, className = "", sortKey, sortDir, onSort }: {
  label: string; col: SortKey; className?: string; sortKey: SortKey; sortDir: SortDir; onSort: (key: SortKey) => void;
}) => (
  <th
    className={`py-3 text-left text-xs font-medium uppercase tracking-widest whitespace-nowrap cursor-pointer select-none ${className}`}
    style={{ color: sortKey === col ? "var(--accent)" : "var(--muted)", transition: "color 0.2s" }}
    onClick={() => onSort(col)}
  >
    <span className="inline-flex items-center gap-1">
      {label}
      {sortKey === col && (sortDir === "asc" ? icons.sortAsc : icons.sortDesc)}
    </span>
  </th>
);

const Field = ({ label, value, onChange, type = "text", placeholder = "", textarea = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; textarea?: boolean;
}) => (
  <div>
    <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>{label}</label>
    {textarea ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
        className="w-full px-3 py-2 text-sm outline-none resize-none"
        style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)", transition: "border-color 0.2s" }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
    ) : (
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm outline-none"
        style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)", transition: "border-color 0.2s" }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
    )}
  </div>
);

export default function CompaniesPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<CrmCompany[]>([]);
  const [people, setPeople] = useState<CrmPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [showCreate, setShowCreate] = useState(false);
  const [detailCompany, setDetailCompany] = useState<CrmCompany | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CrmCompany | null>(null);

  const [form, setForm] = useState({ ...emptyCompany });
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState<CrmCompany | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [relatedPeople, setRelatedPeople] = useState<CrmPerson[]>([]);

  const [pendingDismiss, setPendingDismiss] = useState<(() => void) | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const performedBy = user?.user_metadata?.full_name ?? user?.email ?? "Unknown";

  const isCreateDirty = (): boolean => JSON.stringify(form) !== JSON.stringify(emptyCompany);

  const isEditDirty = (): boolean => {
    if (!editForm || !detailCompany) return false;
    return JSON.stringify(editForm) !== JSON.stringify(detailCompany);
  };

  const requestDismiss = (action: () => void, dirty: boolean) => {
    if (dirty) setPendingDismiss(() => action);
    else action();
  };

  const dismissCreate = () => { setForm({ ...emptyCompany }); setShowCreate(false); };
  const dismissDetail = () => setDetailCompany(null);

  const loadData = useCallback(async () => {
    try {
      const [c, p] = await Promise.all([getCrmCompanies(), getCrmPeople()]);
      setCompanies(c);
      setPeople(p);
    } catch (err) {
      console.error("CRM Companies load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (detailCompany) {
      getCrmActivities("company", detailCompany.id).then(setActivities);
      setEditForm({ ...detailCompany });
      setRelatedPeople(people.filter((p) => p.company_id === detailCompany.id));
    } else {
      setActivities([]);
      setEditForm(null);
      setRelatedPeople([]);
    }
  }, [detailCompany, people]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const getSortValue = (c: CrmCompany, key: SortKey): string | number => {
    switch (key) {
      case "outstanding_balance": return getAvailableCredit(c) ?? Infinity;
      case "credit_limit": return c.credit_limit ?? 0;
      default: return (c[key] ?? "").toString().toLowerCase();
    }
  };

  const filtered = useMemo(() => {
    let result = [...companies];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const va = getSortValue(a, sortKey);
      const vb = getSortValue(b, sortKey);
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return result;
  }, [companies, searchQuery, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, sortKey, sortDir]);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalExposure = companies.reduce((s, c) => s + (c.outstanding_balance ?? 0), 0);
    return [
      { label: "Total Companies", value: companies.length.toString() },
      { label: "ICP Accounts", value: companies.filter((c) => c.is_icp).length.toString() },
      { label: "Credit Exposure", value: "\u20B1" + totalExposure.toLocaleString() },
      { label: "New This Month", value: companies.filter((c) => new Date(c.created_at) >= monthStart).length.toString() },
    ];
  }, [companies]);

  const allOnPageSelected = paginated.length > 0 && paginated.every((c) => selectedIds.has(c.id));
  const toggleAll = () => {
    if (allOnPageSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map((c) => c.id)));
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await createCrmCompany({ ...form, created_by: performedBy });
      setForm({ ...emptyCompany });
      setShowCreate(false);
      await loadData();
    } catch (err) {
      console.error("Create company error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editForm || !detailCompany) return;
    setEditSaving(true);
    try {
      const updated = await updateCrmCompany(detailCompany.id, editForm);
      if (updated) {
        setDetailCompany(updated);
        await loadData();
      }
    } catch (err) {
      console.error("Update company error:", err);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCrmCompany(deleteTarget.id);
      setDeleteTarget(null);
      if (detailCompany?.id === deleteTarget.id) setDetailCompany(null);
      await loadData();
    } catch (err) {
      console.error("Delete company error:", err);
    }
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) await deleteCrmCompany(id);
    setSelectedIds(new Set());
    if (detailCompany && selectedIds.has(detailCompany.id)) setDetailCompany(null);
    await loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-sm uppercase tracking-widest animate-pulse" style={{ color: "var(--muted)" }}>Loading companies...</p>
      </div>
    );
  }

  return (
    <>
      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="relative p-5 animate-fade-up"
            style={{
              backgroundColor: "var(--input-bg)",
              borderBottom: "2px solid var(--border)",
              animationDelay: `${i * 0.1}s`,
              transition: "background-color 0.4s ease",
            }}
          >
            <div className="absolute top-2 right-2 rounded-full" style={{ width: "4px", height: "4px", backgroundColor: "var(--border)" }} />
            <p className="text-xs uppercase tracking-widest font-[family-name:var(--font-body)]" style={{ color: "var(--muted)" }}>{stat.label}</p>
            <p className="mt-2 text-2xl font-[family-name:var(--font-display)] text-foreground tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── TABLE ── */}
      <div className="animate-fade-up delay-400" style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}>
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground">
              All Companies <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>({filtered.length})</span>
            </h3>
            <div className="flex items-center gap-3 flex-wrap">
              {selectedIds.size > 0 && (
                <button onClick={handleBulkDelete} className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                  style={{ backgroundColor: "var(--accent)", color: "#fff", fontFamily: "var(--font-body)", transition: "opacity 0.3s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                  {icons.trash} Delete ({selectedIds.size})
                </button>
              )}
              <div className="flex items-center gap-1.5 px-3 py-2 w-full sm:w-56"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)" }}>
                <span className="text-muted shrink-0">{icons.search}</span>
                <input ref={searchRef} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search companies..."
                  className="bg-transparent outline-none text-sm w-full" style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }} />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }} className="text-muted cursor-pointer shrink-0"
                    style={{ transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
                    {icons.x}
                  </button>
                )}
              </div>
              <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{ backgroundColor: "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)", transition: "background-color 0.3s" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-hover)")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-bg)")}>
                {icons.plus} Add Company
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="px-3 py-3 w-10">
                  <input type="checkbox" checked={allOnPageSelected} onChange={toggleAll} className="cursor-pointer accent-[var(--accent)]" />
                </th>
                <SortHeader label="Company" col="name" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Industry" col="industry" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="City" col="city" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Balance" col="outstanding_balance" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Credit Limit" col="credit_limit" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--muted)" }}>Terms</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--muted)" }}>ICP</th>
                <SortHeader label="Created" col="created_at" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-3 py-3 w-16" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span style={{ color: "var(--border)" }}>{icons.building}</span>
                      <span className="text-sm text-muted">{searchQuery ? "No companies match your search" : "No companies yet"}</span>
                      <span className="text-xs text-muted opacity-60">{searchQuery ? "Try a different search term" : "Add your first company to get started"}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((company) => {
                  const isSelected = selectedIds.has(company.id);
                  return (
                    <tr key={company.id} className="transition-colors cursor-pointer"
                      style={{ borderBottom: "1px solid var(--border)", backgroundColor: isSelected ? "var(--row-hover)" : undefined }}
                      onClick={() => setDetailCompany(company)}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "var(--row-hover)"; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleOne(company.id)} className="cursor-pointer accent-[var(--accent)]" />
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 flex items-center justify-center text-[10px] font-semibold uppercase shrink-0"
                            style={{ backgroundColor: company.is_icp ? "var(--class-c1)" : "var(--accent)", color: "#fff", borderRadius: "2px" }}>
                            {getCompanyInitials(company.name)}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">{company.name}</span>
                            {company.domain && (
                              <span className="block text-[10px]" style={{ color: "var(--muted)" }}>{company.domain}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted whitespace-nowrap">{company.industry || "\u2014"}</td>
                      <td className="px-5 py-3 text-muted whitespace-nowrap">{company.city || "\u2014"}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        {company.credit_limit != null ? (() => {
                          const avail = getAvailableCredit(company)!;
                          const pct = getUtilizationPct(company)!;
                          const clr = creditColor(pct);
                          return (
                            <div className="space-y-1">
                              <span className="font-medium text-sm" style={{ color: clr, fontVariantNumeric: "tabular-nums" }}>
                                {"\u20B1" + avail.toLocaleString()}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <div className="capacity-bar" style={{ width: 48, height: 6 }}>
                                  <div className="capacity-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: clr }} />
                                </div>
                                <span className="text-[10px]" style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
                              </div>
                            </div>
                          );
                        })() : (
                          <span className="text-xs" style={{ color: "var(--muted)" }}>No limit</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-foreground font-medium whitespace-nowrap">{formatRevenue(company.credit_limit)}</td>
                      <td className="px-5 py-3 text-muted whitespace-nowrap">{company.payment_terms || "\u2014"}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        {company.is_icp ? (
                          <span style={{ color: "var(--class-c1)" }}>{icons.starFilled}</span>
                        ) : (
                          <span style={{ color: "var(--border)" }}>{icons.star}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted whitespace-nowrap">{formatDate(company.created_at)}</td>
                      <td className="px-3 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setDeleteTarget(company)} className="p-1.5 cursor-pointer"
                          style={{ color: "var(--muted)", transition: "color 0.2s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")} title="Delete">
                          {icons.trash}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
          <span className="text-xs text-muted uppercase tracking-wider">
            {searchQuery ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : `Showing ${paginated.length} of ${companies.length} companies`}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-2 py-1 text-xs uppercase tracking-wider cursor-pointer"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)", color: currentPage === 1 ? "var(--muted)" : "var(--foreground)", opacity: currentPage === 1 ? 0.5 : 1, transition: "opacity 0.2s" }}>
                Prev
              </button>
              <span className="text-xs text-muted uppercase tracking-wider">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs uppercase tracking-wider cursor-pointer"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)", color: currentPage === totalPages ? "var(--muted)" : "var(--foreground)", opacity: currentPage === totalPages ? 0.5 : 1, transition: "opacity 0.2s" }}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE MODAL ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }} onClick={() => requestDismiss(dismissCreate, isCreateDirty())}>
          <div className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-fade-up"
            style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <h3 className="font-[family-name:var(--font-display)] text-base uppercase tracking-wider text-foreground">Add Company</h3>
              <button onClick={() => requestDismiss(dismissCreate, isCreateDirty())} className="cursor-pointer p-1" style={{ color: "var(--muted)", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
                {icons.xLg}
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <Field label="Company Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Manila Steel Corp" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Domain" value={form.domain} onChange={(v) => setForm({ ...form, domain: v })} placeholder="manilasteel.ph" />
                <Field label="Industry" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} placeholder="Steel Manufacturing" />
              </div>
              <Field label="Annual Revenue (₱)" value={form.annual_revenue?.toString() ?? ""} onChange={(v) => setForm({ ...form, annual_revenue: v ? parseInt(v) || null : null })} type="number" placeholder="85000000" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Credit Limit (₱)" value={form.credit_limit?.toString() ?? ""} onChange={(v) => setForm({ ...form, credit_limit: v ? parseInt(v) || null : null })} type="number" placeholder="10000000" />
                <div>
                  <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Payment Terms</label>
                  <select
                    value={form.payment_terms && !TERMS_OPTIONS.includes(form.payment_terms) ? "__other__" : (form.payment_terms ?? "")}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "__other__") setForm({ ...form, payment_terms: "" });
                      else if (v === "") setForm({ ...form, payment_terms: null });
                      else setForm({ ...form, payment_terms: v });
                    }}
                    className="w-full px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}
                  >
                    <option value="">— Select —</option>
                    {TERMS_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    <option value="__other__">Other</option>
                  </select>
                </div>
              </div>
              {form.payment_terms !== null && !TERMS_OPTIONS.includes(form.payment_terms ?? "") && form.payment_terms !== null && (
                <Field label="Custom Payment Terms" value={form.payment_terms ?? ""} onChange={(v) => setForm({ ...form, payment_terms: v })} placeholder="e.g. 2/10 Net 30" />
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+63 2 8555 1234" />
                <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" placeholder="info@company.ph" />
              </div>
              <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="123 Industrial Blvd" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="Makati" />
                <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} placeholder="Philippines" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                  Ideal Customer Profile
                </label>
                <button
                  onClick={() => setForm({ ...form, is_icp: !form.is_icp })}
                  className="w-8 h-5 rounded-full relative cursor-pointer transition-colors"
                  style={{ backgroundColor: form.is_icp ? "var(--class-c1)" : "var(--border)" }}
                >
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: form.is_icp ? "14px" : "2px" }} />
                </button>
              </div>
              <Field label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} textarea placeholder="Additional notes..." />
            </div>
            <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: "1px solid var(--border)" }}>
              <button onClick={() => requestDismiss(dismissCreate, isCreateDirty())} className="px-4 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                Cancel
              </button>
              <button onClick={handleCreate} disabled={!form.name.trim() || saving}
                className="px-4 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{ backgroundColor: saving ? "var(--muted)" : "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)", opacity: !form.name.trim() ? 0.5 : 1, transition: "background-color 0.3s, opacity 0.2s" }}>
                {saving ? "Saving..." : "Create Company"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DETAIL PANEL ── */}
      {detailCompany && editForm && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }} onClick={() => requestDismiss(dismissDetail, isEditDirty())}>
          <div className="w-full sm:max-w-xl h-full overflow-y-auto"
            style={{ backgroundColor: "var(--background)", borderLeft: "1px solid var(--border)", boxShadow: "-8px 0 30px rgba(0,0,0,0.2)", animation: "slideInRight 0.3s ease-out" }}
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between sticky top-0 z-10"
              style={{ backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center text-xs font-semibold uppercase"
                  style={{ backgroundColor: editForm.is_icp ? "var(--class-c1)" : "var(--accent)", color: "#fff", borderRadius: "2px" }}>
                  {getCompanyInitials(detailCompany.name)}
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-base uppercase tracking-wider text-foreground">{detailCompany.name}</h3>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{detailCompany.industry || "No industry"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setDeleteTarget(detailCompany)} className="p-1.5 cursor-pointer"
                  style={{ color: "var(--muted)", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")} title="Delete">
                  {icons.trash}
                </button>
                <button onClick={() => requestDismiss(dismissDetail, isEditDirty())} className="p-1.5 cursor-pointer"
                  style={{ color: "var(--muted)", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
                  {icons.xLg}
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <Field label="Company Name" value={editForm.name} onChange={(v) => setEditForm({ ...editForm, name: v })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Domain" value={editForm.domain} onChange={(v) => setEditForm({ ...editForm, domain: v })} />
                <Field label="Industry" value={editForm.industry} onChange={(v) => setEditForm({ ...editForm, industry: v })} />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--muted)" }}>{icons.phone}</span>
                  <input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }} placeholder="Phone" />
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--muted)" }}>{icons.mail}</span>
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }} placeholder="Email" />
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--muted)" }}>{icons.mapPin}</span>
                  <input type="text" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }} placeholder="Address" />
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--muted)" }}>{icons.globe}</span>
                  <input type="text" value={`${editForm.city}${editForm.city && editForm.country ? ", " : ""}${editForm.country}`}
                    onChange={(e) => {
                      const parts = e.target.value.split(",").map((s) => s.trim());
                      setEditForm({ ...editForm, city: parts[0] ?? "", country: parts[1] ?? editForm.country });
                    }}
                    className="flex-1 px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }} placeholder="City, Country" />
                </div>
              </div>

              <Field label="Annual Revenue (₱)" value={editForm.annual_revenue?.toString() ?? ""} onChange={(v) => setEditForm({ ...editForm, annual_revenue: v ? parseInt(v) || null : null })} type="number" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Credit Limit (₱)" value={editForm.credit_limit?.toString() ?? ""} onChange={(v) => setEditForm({ ...editForm, credit_limit: v ? parseInt(v) || null : null })} type="number" />
                <div>
                  <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Payment Terms</label>
                  <select
                    value={editForm.payment_terms && !TERMS_OPTIONS.includes(editForm.payment_terms) ? "__other__" : (editForm.payment_terms ?? "")}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "__other__") setEditForm({ ...editForm, payment_terms: "" });
                      else if (v === "") setEditForm({ ...editForm, payment_terms: null });
                      else setEditForm({ ...editForm, payment_terms: v });
                    }}
                    className="w-full px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}
                  >
                    <option value="">— Select —</option>
                    {TERMS_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                    <option value="__other__">Other</option>
                  </select>
                </div>
              </div>
              {editForm.payment_terms !== null && !TERMS_OPTIONS.includes(editForm.payment_terms ?? "") && (
                <Field label="Custom Payment Terms" value={editForm.payment_terms ?? ""} onChange={(v) => setEditForm({ ...editForm, payment_terms: v })} placeholder="e.g. 2/10 Net 30" />
              )}

              {/* Credit Balance Summary */}
              {detailCompany.credit_limit != null && (() => {
                const avail = getAvailableCredit(detailCompany)!;
                const outstanding = detailCompany.outstanding_balance ?? 0;
                const pct = getUtilizationPct(detailCompany)!;
                const clr = creditColor(pct);
                return (
                  <div className="p-4" style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)" }}>
                    <label className="block text-[10px] uppercase tracking-widest mb-3" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Credit Balance</label>
                    <div className="capacity-bar mb-2" style={{ width: "100%", height: 8 }}>
                      <div className="capacity-bar-fill" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: clr }} />
                    </div>
                    <div className="flex items-center justify-between text-xs" style={{ fontVariantNumeric: "tabular-nums" }}>
                      <span style={{ color: clr }} className="font-medium">{"\u20B1" + avail.toLocaleString()} available</span>
                      <span style={{ color: "var(--muted)" }}>{pct}% used</span>
                    </div>
                    <div className="mt-2 text-[10px]" style={{ color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                      {"\u20B1" + outstanding.toLocaleString()} outstanding of {"\u20B1" + detailCompany.credit_limit!.toLocaleString()} limit
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center gap-3">
                <label className="text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Ideal Customer Profile</label>
                <button onClick={() => setEditForm({ ...editForm, is_icp: !editForm.is_icp })}
                  className="w-8 h-5 rounded-full relative cursor-pointer transition-colors"
                  style={{ backgroundColor: editForm.is_icp ? "var(--class-c1)" : "var(--border)" }}>
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: editForm.is_icp ? "14px" : "2px" }} />
                </button>
              </div>

              <Field label="Notes" value={editForm.notes} onChange={(v) => setEditForm({ ...editForm, notes: v })} textarea />

              <button onClick={handleUpdate} disabled={editSaving} className="w-full py-2.5 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{ backgroundColor: editSaving ? "var(--muted)" : "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)", transition: "background-color 0.3s" }}
                onMouseEnter={(e) => { if (!editSaving) e.currentTarget.style.backgroundColor = "var(--btn-hover)"; }}
                onMouseLeave={(e) => { if (!editSaving) e.currentTarget.style.backgroundColor = "var(--btn-bg)"; }}>
                {editSaving ? "Saving..." : "Save Changes"}
              </button>

              {/* Related People */}
              <div className="pt-2">
                <div className="h-px" style={{ backgroundColor: "var(--border)" }} />
              </div>
              <div>
                <h4 className="font-[family-name:var(--font-display)] text-xs uppercase tracking-wider text-foreground mb-3">
                  People ({relatedPeople.length})
                </h4>
                {relatedPeople.length === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-xs text-muted">No contacts linked to this company</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {relatedPeople.map((p) => (
                      <div key={p.id} className="px-4 py-3 flex items-center gap-3"
                        style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)" }}>
                        <div className="w-7 h-7 flex items-center justify-center text-[9px] font-semibold uppercase shrink-0"
                          style={{ backgroundColor: "var(--accent)", color: "#fff", borderRadius: "2px" }}>
                          {((p.first_name?.[0] ?? "") + (p.last_name?.[0] ?? "")).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{p.first_name} {p.last_name}</p>
                          <p className="text-[10px] truncate" style={{ color: "var(--muted)" }}>{p.job_title || p.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Activity Timeline */}
              <div className="pt-2">
                <div className="h-px" style={{ backgroundColor: "var(--border)" }} />
              </div>
              <div>
                <h4 className="font-[family-name:var(--font-display)] text-xs uppercase tracking-wider text-foreground mb-3">Activity</h4>
                {activities.length === 0 ? (
                  <div className="py-6 text-center"><p className="text-xs text-muted">No activity recorded yet</p></div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((act) => {
                      const meta = activityMeta[act.type] ?? { label: act.type, color: "var(--muted)" };
                      return (
                        <div key={act.id} className="px-4 py-3" style={{ backgroundColor: "var(--input-bg)", borderLeft: `3px solid ${meta.color}` }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] uppercase tracking-widest font-medium" style={{ color: meta.color, fontFamily: "var(--font-body)" }}>{meta.label}</span>
                            <span className="text-[10px]" style={{ color: "var(--muted)" }}>{formatDate(act.created_at)}</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{act.subject}</p>
                          {act.description && <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{act.description}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="pt-2 space-y-1">
                <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--muted)" }}>
                  <span>{icons.clock}</span><span>Created {formatDate(detailCompany.created_at)} by {detailCompany.created_by}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--muted)" }}>
                  <span>{icons.edit}</span><span>Updated {formatDate(detailCompany.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE DIALOG ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }} onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-sm mx-4 animate-fade-up" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5">
              <h3 className="font-[family-name:var(--font-display)] text-base uppercase tracking-wider text-foreground mb-2">Delete Company</h3>
              <p className="text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                Are you sure you want to delete <strong className="text-foreground">{deleteTarget.name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{ backgroundColor: "var(--accent)", color: "#fff", fontFamily: "var(--font-body)", transition: "opacity 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")} onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={pendingDismiss !== null}
        title="Unsaved Changes"
        message="You have unsaved changes that will be lost. Are you sure you want to close?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        variant="danger"
        zIndex={70}
        onConfirm={() => { pendingDismiss?.(); setPendingDismiss(null); }}
        onCancel={() => setPendingDismiss(null)}
      />

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
