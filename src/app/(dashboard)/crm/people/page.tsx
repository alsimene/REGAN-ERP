"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { CrmPerson, CrmCompany } from "@/lib/crmTypes";
import {
  getCrmPeople,
  getCrmCompanies,
  createCrmPerson,
  updateCrmPerson,
  deleteCrmPerson,
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
  users: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
  edit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838.838-2.872a2 2 0 0 1 .506-.855z" />
    </svg>
  ),
  company: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V3a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4" />
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
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  note: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  mapPin: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  chevRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
};

/* ── helpers ── */
function getInitials(first: string, last: string): string {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "?";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type SortKey = "name" | "email" | "phone" | "job_title" | "company_name" | "city" | "created_at";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

const emptyPerson: Omit<CrmPerson, "id" | "created_at" | "updated_at"> = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  job_title: "",
  city: "",
  company_id: null,
  company_name: null,
  avatar_url: "",
  notes: "",
  created_by: "",
};

/* ── Activity type label/color map ── */
const activityMeta: Record<string, { label: string; color: string }> = {
  note: { label: "Note", color: "var(--muted)" },
  call: { label: "Call", color: "#3b82f6" },
  email: { label: "Email", color: "#8b5cf6" },
  meeting: { label: "Meeting", color: "#f59e0b" },
  task: { label: "Task", color: "var(--class-c1)" },
};

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
    <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
      {label}
    </label>
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

/* ════════════════════════════════════════
   PEOPLE PAGE
   ════════════════════════════════════════ */
export default function PeoplePage() {
  const { user } = useAuth();
  const [people, setPeople] = useState<CrmPerson[]>([]);
  const [companies, setCompanies] = useState<CrmCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal/panel state
  const [showCreate, setShowCreate] = useState(false);
  const [detailPerson, setDetailPerson] = useState<CrmPerson | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CrmPerson | null>(null);

  // Form state for create modal
  const [form, setForm] = useState({ ...emptyPerson });
  const [saving, setSaving] = useState(false);

  // Detail panel edit state
  const [editForm, setEditForm] = useState<CrmPerson | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [activities, setActivities] = useState<CrmActivity[]>([]);

  const [pendingDismiss, setPendingDismiss] = useState<(() => void) | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const performedBy = user?.user_metadata?.full_name ?? user?.email ?? "Unknown";

  const isCreateDirty = (): boolean => JSON.stringify(form) !== JSON.stringify(emptyPerson);

  const isEditDirty = (): boolean => {
    if (!editForm || !detailPerson) return false;
    return JSON.stringify(editForm) !== JSON.stringify(detailPerson);
  };

  const requestDismiss = (action: () => void, dirty: boolean) => {
    if (dirty) setPendingDismiss(() => action);
    else action();
  };

  const dismissCreate = () => { setForm({ ...emptyPerson }); setShowCreate(false); };
  const dismissDetail = () => setDetailPerson(null);

  /* ── Load data ── */
  const loadData = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([getCrmPeople(), getCrmCompanies()]);
      setPeople(p);
      setCompanies(c);
    } catch (err) {
      console.error("CRM People load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── Load activities when detail panel opens ── */
  useEffect(() => {
    if (detailPerson) {
      getCrmActivities("person", detailPerson.id).then(setActivities);
      setEditForm({ ...detailPerson });
    } else {
      setActivities([]);
      setEditForm(null);
    }
  }, [detailPerson]);

  /* ── Sorting ── */
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const getSortValue = (p: CrmPerson, key: SortKey): string => {
    switch (key) {
      case "name": return `${p.first_name} ${p.last_name}`.toLowerCase();
      case "company_name": return (p.company_name ?? "").toLowerCase();
      default: return (p[key] ?? "").toString().toLowerCase();
    }
  };

  /* ── Filter + Sort + Paginate ── */
  const filtered = useMemo(() => {
    let result = [...people];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        (p.company_name ?? "").toLowerCase().includes(q) ||
        p.job_title.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const va = getSortValue(a, sortKey);
      const vb = getSortValue(b, sortKey);
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });
    return result;
  }, [people, searchQuery, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, sortKey, sortDir]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const linkedCompanyIds = new Set(people.filter((p) => p.company_id).map((p) => p.company_id));
    return [
      { label: "Total People", value: people.length },
      { label: "Companies Linked", value: linkedCompanyIds.size },
      { label: "New This Month", value: people.filter((p) => new Date(p.created_at) >= monthStart).length },
      { label: "Unlinked", value: people.filter((p) => !p.company_id).length },
    ];
  }, [people]);

  /* ── Checkbox helpers ── */
  const allOnPageSelected = paginated.length > 0 && paginated.every((p) => selectedIds.has(p.id));
  const toggleAll = () => {
    if (allOnPageSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((p) => p.id)));
    }
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  /* ── CRUD handlers ── */
  const handleCreate = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) return;
    setSaving(true);
    try {
      await createCrmPerson({ ...form, created_by: performedBy });
      setForm({ ...emptyPerson });
      setShowCreate(false);
      await loadData();
    } catch (err) {
      console.error("Create person error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editForm || !detailPerson) return;
    setEditSaving(true);
    try {
      const updated = await updateCrmPerson(detailPerson.id, editForm);
      if (updated) {
        setDetailPerson(updated);
        await loadData();
      }
    } catch (err) {
      console.error("Update person error:", err);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCrmPerson(deleteTarget.id);
      setDeleteTarget(null);
      if (detailPerson?.id === deleteTarget.id) setDetailPerson(null);
      await loadData();
    } catch (err) {
      console.error("Delete person error:", err);
    }
  };

  const handleBulkDelete = async () => {
    for (const id of selectedIds) {
      await deleteCrmPerson(id);
    }
    setSelectedIds(new Set());
    if (detailPerson && selectedIds.has(detailPerson.id)) setDetailPerson(null);
    await loadData();
  };

  /* ════════════════════════════════════════
     RENDER
     ════════════════════════════════════════ */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-sm uppercase tracking-widest animate-pulse" style={{ color: "var(--muted)" }}>Loading contacts...</p>
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
            <div
              className="absolute top-2 right-2 rounded-full"
              style={{ width: "4px", height: "4px", backgroundColor: "var(--border)" }}
            />
            <p className="text-xs uppercase tracking-widest font-[family-name:var(--font-body)]" style={{ color: "var(--muted)" }}>
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-[family-name:var(--font-display)] text-foreground tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── TABLE CONTAINER ── */}
      <div
        className="animate-fade-up delay-400"
        style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
      >
        {/* Header bar */}
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground">
              All People
              <span className="ml-2 text-xs" style={{ color: "var(--muted)" }}>({filtered.length})</span>
            </h3>
            <div className="flex items-center gap-3">
              {/* Bulk delete */}
              {selectedIds.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "#fff",
                    fontFamily: "var(--font-body)",
                    transition: "opacity 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {icons.trash}
                  Delete ({selectedIds.size})
                </button>
              )}
              {/* Search */}
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
                  placeholder="Search people..."
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
              {/* Add person */}
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{
                  backgroundColor: "var(--btn-bg)",
                  color: "var(--btn-text)",
                  fontFamily: "var(--font-body)",
                  transition: "background-color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-bg)")}
              >
                {icons.plus}
                Add Person
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleAll}
                    className="cursor-pointer accent-[var(--accent)]"
                  />
                </th>
                <SortHeader label="Name" col="name" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Email" col="email" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Phone" col="phone" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Job Title" col="job_title" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Company" col="company_name" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="City" col="city" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <SortHeader label="Created" col="created_at" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                <th className="px-3 py-3 w-16" />
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <span style={{ color: "var(--border)" }}>{icons.users}</span>
                      <span className="text-sm text-muted">
                        {searchQuery ? "No people match your search" : "No contacts yet"}
                      </span>
                      <span className="text-xs text-muted opacity-60">
                        {searchQuery ? "Try a different search term" : "Add your first contact to get started"}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((person) => {
                  const isSelected = selectedIds.has(person.id);
                  return (
                    <tr
                      key={person.id}
                      className="transition-colors cursor-pointer"
                      style={{
                        borderBottom: "1px solid var(--border)",
                        backgroundColor: isSelected ? "var(--row-hover)" : undefined,
                      }}
                      onClick={() => setDetailPerson(person)}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "var(--row-hover)"; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
                    >
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOne(person.id)}
                          className="cursor-pointer accent-[var(--accent)]"
                        />
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 flex items-center justify-center text-[10px] font-semibold uppercase shrink-0"
                            style={{
                              backgroundColor: "var(--accent)",
                              color: "#fff",
                              borderRadius: "2px",
                            }}
                          >
                            {getInitials(person.first_name, person.last_name)}
                          </div>
                          <span className="font-medium text-foreground">
                            {person.first_name} {person.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted whitespace-nowrap">{person.email || "\u2014"}</td>
                      <td className="px-5 py-3 text-muted whitespace-nowrap">{person.phone || "\u2014"}</td>
                      <td className="px-5 py-3 text-muted whitespace-nowrap">{person.job_title || "\u2014"}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        {person.company_name ? (
                          <span
                            className="inline-flex items-center gap-1 text-xs uppercase tracking-wider px-2 py-0.5"
                            style={{
                              backgroundColor: "var(--background)",
                              border: "1px solid var(--border)",
                              color: "var(--foreground)",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            {icons.company}
                            {person.company_name}
                          </span>
                        ) : (
                          <span className="text-muted">{"\u2014"}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-muted whitespace-nowrap">{person.city || "\u2014"}</td>
                      <td className="px-5 py-3 text-muted whitespace-nowrap">{formatDate(person.created_at)}</td>
                      <td className="px-3 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setDeleteTarget(person)}
                          className="p-1.5 cursor-pointer"
                          style={{ color: "var(--muted)", transition: "color 0.2s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                          title="Delete"
                        >
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

        {/* Pagination footer */}
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
          <span className="text-xs text-muted uppercase tracking-wider">
            {searchQuery
              ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
              : `Showing ${paginated.length} of ${people.length} people`}
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
      </div>

      {/* ════════════════════════════════════════
         CREATE PERSON MODAL
         ════════════════════════════════════════ */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
          onClick={() => requestDismiss(dismissCreate, isCreateDirty())}
        >
          <div
            className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-fade-up"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <h3 className="font-[family-name:var(--font-display)] text-base uppercase tracking-wider text-foreground">
                Add Person
              </h3>
              <button
                onClick={() => requestDismiss(dismissCreate, isCreateDirty())}
                className="cursor-pointer p-1"
                style={{ color: "var(--muted)", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                {icons.xLg}
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name *" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} placeholder="Carlos" />
                <Field label="Last Name *" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} placeholder="Reyes" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" placeholder="carlos@company.ph" />
                <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+63 917 555 1234" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Job Title" value={form.job_title} onChange={(v) => setForm({ ...form, job_title: v })} placeholder="Procurement Manager" />
                <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="Makati" />
              </div>
              {/* Company select */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                  Company
                </label>
                <select
                  value={form.company_id ?? ""}
                  onChange={(e) => {
                    const id = e.target.value || null;
                    const comp = companies.find((c) => c.id === id);
                    setForm({ ...form, company_id: id, company_name: comp?.name ?? null });
                  }}
                  className="w-full px-3 py-2 text-sm outline-none cursor-pointer"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <option value="">No Company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Field label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} textarea placeholder="Additional notes..." />
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: "1px solid var(--border)" }}>
              <button
                onClick={() => requestDismiss(dismissCreate, isCreateDirty())}
                className="px-4 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-body)",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--input-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--background)")}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.first_name.trim() || !form.last_name.trim() || saving}
                className="px-4 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{
                  backgroundColor: saving ? "var(--muted)" : "var(--btn-bg)",
                  color: "var(--btn-text)",
                  fontFamily: "var(--font-body)",
                  opacity: !form.first_name.trim() || !form.last_name.trim() ? 0.5 : 1,
                  transition: "background-color 0.3s, opacity 0.2s",
                }}
              >
                {saving ? "Saving..." : "Create Person"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
         DETAIL SLIDE-OVER PANEL
         ════════════════════════════════════════ */}
      {detailPerson && editForm && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }}
          onClick={() => requestDismiss(dismissDetail, isEditDirty())}
        >
          <div
            className="w-full max-w-xl h-full overflow-y-auto"
            style={{
              backgroundColor: "var(--background)",
              borderLeft: "1px solid var(--border)",
              boxShadow: "-8px 0 30px rgba(0,0,0,0.2)",
              animation: "slideInRight 0.3s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel header */}
            <div
              className="px-6 py-4 flex items-center justify-between sticky top-0 z-10"
              style={{
                backgroundColor: "var(--background)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 flex items-center justify-center text-xs font-semibold uppercase"
                  style={{ backgroundColor: "var(--accent)", color: "#fff", borderRadius: "2px" }}
                >
                  {getInitials(detailPerson.first_name, detailPerson.last_name)}
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-base uppercase tracking-wider text-foreground">
                    {detailPerson.first_name} {detailPerson.last_name}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--muted)" }}>{detailPerson.job_title || "No title"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDeleteTarget(detailPerson)}
                  className="p-1.5 cursor-pointer"
                  style={{ color: "var(--muted)", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                  title="Delete"
                >
                  {icons.trash}
                </button>
                <button
                  onClick={() => requestDismiss(dismissDetail, isEditDirty())}
                  className="p-1.5 cursor-pointer"
                  style={{ color: "var(--muted)", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                >
                  {icons.xLg}
                </button>
              </div>
            </div>

            {/* Detail fields */}
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" value={editForm.first_name} onChange={(v) => setEditForm({ ...editForm, first_name: v })} />
                <Field label="Last Name" value={editForm.last_name} onChange={(v) => setEditForm({ ...editForm, last_name: v })} />
              </div>

              {/* Contact info with icons */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--muted)" }}>{icons.mail}</span>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: "var(--input-bg)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontFamily: "var(--font-body)",
                    }}
                    placeholder="Email"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--muted)" }}>{icons.phone}</span>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: "var(--input-bg)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontFamily: "var(--font-body)",
                    }}
                    placeholder="Phone"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--muted)" }}>{icons.mapPin}</span>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: "var(--input-bg)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontFamily: "var(--font-body)",
                    }}
                    placeholder="City"
                  />
                </div>
              </div>

              <Field label="Job Title" value={editForm.job_title} onChange={(v) => setEditForm({ ...editForm, job_title: v })} />

              {/* Company select */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                  Company
                </label>
                <select
                  value={editForm.company_id ?? ""}
                  onChange={(e) => {
                    const id = e.target.value || null;
                    const comp = companies.find((c) => c.id === id);
                    setEditForm({ ...editForm, company_id: id, company_name: comp?.name ?? null });
                  }}
                  className="w-full px-3 py-2 text-sm outline-none cursor-pointer"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  <option value="">No Company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Company link */}
              {editForm.company_name && (
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{
                    backgroundColor: "var(--input-bg)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span style={{ color: "var(--accent)" }}>{icons.company}</span>
                    <span className="text-sm font-medium text-foreground">{editForm.company_name}</span>
                  </div>
                  <span style={{ color: "var(--muted)" }}>{icons.chevRight}</span>
                </div>
              )}

              <Field label="Notes" value={editForm.notes} onChange={(v) => setEditForm({ ...editForm, notes: v })} textarea />

              {/* Save button */}
              <button
                onClick={handleUpdate}
                disabled={editSaving}
                className="w-full py-2.5 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{
                  backgroundColor: editSaving ? "var(--muted)" : "var(--btn-bg)",
                  color: "var(--btn-text)",
                  fontFamily: "var(--font-body)",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) => { if (!editSaving) e.currentTarget.style.backgroundColor = "var(--btn-hover)"; }}
                onMouseLeave={(e) => { if (!editSaving) e.currentTarget.style.backgroundColor = "var(--btn-bg)"; }}
              >
                {editSaving ? "Saving..." : "Save Changes"}
              </button>

              {/* Divider */}
              <div className="pt-2">
                <div className="h-px" style={{ backgroundColor: "var(--border)" }} />
              </div>

              {/* ── Activity Timeline ── */}
              <div>
                <h4 className="font-[family-name:var(--font-display)] text-xs uppercase tracking-wider text-foreground mb-3">
                  Activity
                </h4>
                {activities.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-xs text-muted">No activity recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((act) => {
                      const meta = activityMeta[act.type] ?? { label: act.type, color: "var(--muted)" };
                      return (
                        <div
                          key={act.id}
                          className="px-4 py-3"
                          style={{
                            backgroundColor: "var(--input-bg)",
                            borderLeft: `3px solid ${meta.color}`,
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="text-[10px] uppercase tracking-widest font-medium"
                              style={{ color: meta.color, fontFamily: "var(--font-body)" }}
                            >
                              {meta.label}
                            </span>
                            <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                              {formatDate(act.created_at)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{act.subject}</p>
                          {act.description && (
                            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>{act.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Meta info */}
              <div className="pt-2 space-y-1">
                <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--muted)" }}>
                  <span>{icons.clock}</span>
                  <span>Created {formatDate(detailPerson.created_at)} by {detailPerson.created_by}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--muted)" }}>
                  <span>{icons.edit}</span>
                  <span>Updated {formatDate(detailPerson.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
         DELETE CONFIRMATION DIALOG
         ════════════════════════════════════════ */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm mx-4 animate-fade-up"
            style={{
              backgroundColor: "var(--background)",
              border: "1px solid var(--border)",
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5">
              <h3 className="font-[family-name:var(--font-display)] text-base uppercase tracking-wider text-foreground mb-2">
                Delete Contact
              </h3>
              <p className="text-sm" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                Are you sure you want to delete <strong className="text-foreground">{deleteTarget.first_name} {deleteTarget.last_name}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: "1px solid var(--border)" }}>
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "#fff",
                  fontFamily: "var(--font-body)",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
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

      {/* ── Slide-in animation keyframe ── */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
