"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import {
  CrmOpportunity,
  CrmCompany,
  CrmPerson,
  OpportunityStage,
  DEFAULT_STAGES,
  StageConfig,
} from "@/lib/crmTypes";
import {
  getCrmOpportunities,
  getCrmCompanies,
  getCrmPeople,
  createCrmOpportunity,
  updateCrmOpportunity,
  deleteCrmOpportunity,
  createCrmCompany,
  createCrmPerson,
  getCrmActivities,
  saveQuotation,
  getQuotationsByOpportunity,
  approveQuotation,
  rejectQuotation,
  readCustomStages,
  writeCustomStages,
} from "@/lib/crmQueries";
import { CrmActivity, SavedQuotation } from "@/lib/crmTypes";
import ConfirmModal from "@/app/components/ConfirmModal";
import { getProductsForOrder, getMarketPrices } from "@/lib/queries";

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
  kanban: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="18" rx="1" /><rect x="10" y="3" width="5" height="12" rx="1" /><rect x="17" y="3" width="5" height="15" rx="1" />
    </svg>
  ),
  table: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
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
  trendUp: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
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
  company: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V3a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4" />
    </svg>
  ),
  user: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  calendar: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  inquiry: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  eye: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  package: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  ),
  gear: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  arrowUp: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ),
  arrowDown: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  gripDots: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <circle cx="4" cy="2.5" r="1.3" /><circle cx="10" cy="2.5" r="1.3" />
      <circle cx="4" cy="7" r="1.3" /><circle cx="10" cy="7" r="1.3" />
      <circle cx="4" cy="11.5" r="1.3" /><circle cx="10" cy="11.5" r="1.3" />
    </svg>
  ),
};

/* ── helpers ── */
function formatCurrency(amount: number): string {
  return "\u20B1" + amount.toLocaleString();
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function getStageInfo(stage: OpportunityStage, stageList: StageConfig[] = DEFAULT_STAGES) {
  return stageList.find((s) => s.key === stage) ?? { key: stage, label: stage, color: "#6b7280" };
}

type ViewMode = "kanban" | "table";
type SortKey = "name" | "amount" | "stage" | "close_date" | "company_name" | "contact_name" | "created_at";
type SortDir = "asc" | "desc";

type QuotProduct = {
  id: number; sku: string; name: string;
  category_id: number; category_name: string;
  weight_per_piece: number;
  size: string; thickness: string;
};
type QuotLineItem = {
  key: number;
  product_id: number;
  product_name: string;
  sku: string;
  category_name: string;
  quantity: number;
  price_per_kg: number;
  weight_per_piece: number;
};

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

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>([]);
  const [companies, setCompanies] = useState<CrmCompany[]>([]);
  const [people, setPeople] = useState<CrmPerson[]>([]);
  const [stages, setStages] = useState<StageConfig[]>(DEFAULT_STAGES);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [showManageStages, setShowManageStages] = useState(false);
  const [editStages, setEditStages] = useState<StageConfig[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [showCreate, setShowCreate] = useState(false);
  const [createStage, setCreateStage] = useState<OpportunityStage>("incoming");
  const [detailOpp, setDetailOpp] = useState<CrmOpportunity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CrmOpportunity | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<OpportunityStage | null>(null);
  const [draggedColKey, setDraggedColKey] = useState<string | null>(null);
  const [dragOverColKey, setDragOverColKey] = useState<string | null>(null);

  // Create form
  const [formName, setFormName] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formStage, setFormStage] = useState<OpportunityStage>("incoming");
  const [formCloseDate, setFormCloseDate] = useState("");
  const [formProbability, setFormProbability] = useState("50");
  const [formCompanyId, setFormCompanyId] = useState<string>("");
  const [formContactId, setFormContactId] = useState<string>("");
  const [formNotes, setFormNotes] = useState("");
  // New company/person inline create
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyPhone, setNewCompanyPhone] = useState("");
  const [newCompanyEmail, setNewCompanyEmail] = useState("");
  const [newCompanyAddress, setNewCompanyAddress] = useState("");
  const [showNewPerson, setShowNewPerson] = useState(false);
  const [newPersonFirst, setNewPersonFirst] = useState("");
  const [newPersonLast, setNewPersonLast] = useState("");
  const [newPersonEmail, setNewPersonEmail] = useState("");
  const [newPersonPhone, setNewPersonPhone] = useState("");
  const [newPersonCity, setNewPersonCity] = useState("");
  const [saving, setSaving] = useState(false);

  // Detail panel
  const [editForm, setEditForm] = useState<CrmOpportunity | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [activities, setActivities] = useState<CrmActivity[]>([]);

  const [pendingDismiss, setPendingDismiss] = useState<(() => void) | null>(null);

  // Quotation modal state
  const [showQuotation, setShowQuotation] = useState(false);
  const [quotCompanyName, setQuotCompanyName] = useState("");
  const [quotContactName, setQuotContactName] = useState("");
  const [quotDealName, setQuotDealName] = useState("");
  const [quotDate, setQuotDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [quotNotes, setQuotNotes] = useState("");
  const [quotShipping, setQuotShipping] = useState<"pickup" | "truck" | "shipment">("pickup");
  const [quotShippingFee, setQuotShippingFee] = useState<number | "">(0);
  const [quotProducts, setQuotProducts] = useState<QuotProduct[]>([]);
  const [quotMarketPrices, setQuotMarketPrices] = useState<Record<number, number>>({});
  const [quotProductsLoading, setQuotProductsLoading] = useState(false);
  const [quotItems, setQuotItems] = useState<QuotLineItem[]>([]);
  const [quotItemKey, setQuotItemKey] = useState(0);
  const [quotEditingKey, setQuotEditingKey] = useState<number | null>(null);
  const [showQuotAddItem, setShowQuotAddItem] = useState(false);
  // Quotation cascading filters
  const [qCatId, setQCatId] = useState<number | "">("");
  const [qProductType, setQProductType] = useState("All");
  const [qSize, setQSize] = useState("All");
  const [qThickness, setQThickness] = useState("All");
  const [qProductId, setQProductId] = useState<number | "">("");
  const [qQty, setQQty] = useState<number | "">("");
  const [qPrice, setQPrice] = useState<number | "">("");
  const [qCatSearch, setQCatSearch] = useState("");
  const [qCatOpen, setQCatOpen] = useState(false);
  const [qCatHighlight, setQCatHighlight] = useState(-1);
  const qCatRef = useRef<HTMLDivElement>(null);
  const qCatListRef = useRef<HTMLDivElement>(null);

  // Quotation save & approval state
  const [quotSaving, setQuotSaving] = useState(false);
  const [quotSaved, setQuotSaved] = useState<string | null>(null);
  const [oppQuotations, setOppQuotations] = useState<SavedQuotation[]>([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);
  const [rejectModalTarget, setRejectModalTarget] = useState<SavedQuotation | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [approveModalTarget, setApproveModalTarget] = useState<SavedQuotation | null>(null);
  const [approveNotes, setApproveNotes] = useState("");
  const [viewQuotation, setViewQuotation] = useState<SavedQuotation | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const performedBy = user?.user_metadata?.full_name ?? user?.email ?? "Unknown";

  const isCreateDirty = (): boolean =>
    formName !== "" || formAmount !== "" || formStage !== createStage ||
    formCloseDate !== "" || formProbability !== "50" ||
    formCompanyId !== "" || formContactId !== "" || formNotes !== "" ||
    newCompanyName !== "" || newCompanyPhone !== "" || newCompanyEmail !== "" || newCompanyAddress !== "" ||
    newPersonFirst !== "" || newPersonLast !== "" || newPersonEmail !== "" ||
    newPersonPhone !== "" || newPersonCity !== "";

  const isEditDirty = (): boolean => {
    if (!editForm || !detailOpp) return false;
    return JSON.stringify(editForm) !== JSON.stringify(detailOpp);
  };

  const requestDismiss = (action: () => void, dirty: boolean) => {
    if (dirty) setPendingDismiss(() => action);
    else action();
  };

  /* ── Quotation helpers ── */
  const quotCategories = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of quotProducts) {
      if (!map.has(p.category_id)) map.set(p.category_id, p.category_name);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [quotProducts]);

  const qFilteredByCat = useMemo(() => qCatId ? quotProducts.filter((p) => p.category_id === qCatId) : [], [quotProducts, qCatId]);
  const qUniqueTypes = useMemo(() => [...new Set(qFilteredByCat.map((p) => p.name))].sort(), [qFilteredByCat]);
  const qFilteredByType = useMemo(() => qProductType === "All" ? qFilteredByCat : qFilteredByCat.filter((p) => p.name === qProductType), [qFilteredByCat, qProductType]);
  const qUniqueSizes = useMemo(() => {
    const sizes = [...new Set(qFilteredByType.map((p) => p.size).filter((s) => s !== "—"))];
    sizes.sort((a, b) => { const na = parseFloat(a), nb = parseFloat(b); return isNaN(na) || isNaN(nb) ? a.localeCompare(b) : na - nb; });
    return sizes;
  }, [qFilteredByType]);
  const qFilteredBySize = useMemo(() => qSize === "All" ? qFilteredByType : qFilteredByType.filter((p) => p.size === qSize), [qFilteredByType, qSize]);
  const qUniqueThicknesses = useMemo(() => {
    const thk = [...new Set(qFilteredBySize.map((p) => p.thickness).filter((t) => t !== "—"))];
    thk.sort((a, b) => parseFloat(a) - parseFloat(b));
    return thk;
  }, [qFilteredBySize]);
  const qFilteredByThickness = useMemo(() => qThickness === "All" ? qFilteredBySize : qFilteredBySize.filter((p) => p.thickness === qThickness), [qFilteredBySize, qThickness]);
  const qNarrowed = qFilteredByThickness;

  const qSelectedProduct = useMemo(() => qProductId ? quotProducts.find((p) => p.id === qProductId) ?? null : null, [quotProducts, qProductId]);

  // Auto-select product when filters narrow to 1
  useEffect(() => {
    if (qNarrowed.length === 1) setQProductId(qNarrowed[0].id);
    else if (qProductId && !qNarrowed.find((p) => p.id === qProductId)) setQProductId("");
  }, [qNarrowed]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-fill price from market prices
  useEffect(() => {
    if (qCatId && quotMarketPrices[qCatId as number]) setQPrice(quotMarketPrices[qCatId as number]);
    else setQPrice("");
  }, [qCatId, quotMarketPrices]);

  // Close quotation category dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (qCatRef.current && !qCatRef.current.contains(e.target as Node)) setQCatOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function qHandleCatChange(val: number | "") { setQCatId(val); setQProductType("All"); setQSize("All"); setQThickness("All"); setQProductId(""); if (quotEditingKey === null) setQQty(""); }
  function qHandleTypeChange(val: string) { setQProductType(val); setQSize("All"); setQThickness("All"); setQProductId(""); if (quotEditingKey === null) setQQty(""); }
  function qHandleSizeChange(val: string) { setQSize(val); setQThickness("All"); setQProductId(""); if (quotEditingKey === null) setQQty(""); }
  function qHandleThicknessChange(val: string) { setQThickness(val); setQProductId(""); if (quotEditingKey === null) setQQty(""); }

  function qResetForm() { setQCatId(""); setQProductType("All"); setQSize("All"); setQThickness("All"); setQProductId(""); setQQty(""); setQPrice(""); setQCatSearch(""); setQCatOpen(false); setQuotEditingKey(null); }

  function qFormatCategoryLabel(p: QuotProduct): string {
    const parts: string[] = [];
    if (p.size && p.size !== "—") parts.push(p.size.replace(/\s+/g, ""));
    if (p.thickness && p.thickness !== "—") parts.push(`${p.thickness}mm`);
    return parts.length > 0 ? `${p.category_name} (${parts.join(" ")})` : p.category_name;
  }

  function qHandleAddItem() {
    if (!qProductId || !qQty || !qPrice) return;
    const product = quotProducts.find((p) => p.id === qProductId)!;
    const newItem: QuotLineItem = {
      key: quotEditingKey !== null ? quotEditingKey : quotItemKey,
      product_id: product.id, product_name: product.name, sku: product.sku,
      category_name: qFormatCategoryLabel(product),
      quantity: Number(qQty), price_per_kg: Number(qPrice), weight_per_piece: product.weight_per_piece,
    };
    if (quotEditingKey !== null) setQuotItems((prev) => prev.map((i) => (i.key === quotEditingKey ? newItem : i)));
    else { setQuotItems((prev) => [...prev, newItem]); setQuotItemKey((k) => k + 1); }
    qResetForm();
    setShowQuotAddItem(false);
  }

  function qHandleEditItem(key: number) {
    const item = quotItems.find((i) => i.key === key);
    if (!item) return;
    const product = quotProducts.find((p) => p.id === item.product_id);
    if (product) {
      setQCatId(product.category_id); setQProductType(product.name);
      setQSize(product.size !== "—" ? product.size : "All");
      setQThickness(product.thickness !== "—" ? product.thickness : "All");
      setQProductId(product.id);
    }
    setQQty(item.quantity); setQPrice(item.price_per_kg); setQuotEditingKey(key); setShowQuotAddItem(true);
  }

  const quotSubtotal = useMemo(() => quotItems.reduce((s, i) => s + i.quantity * i.weight_per_piece * i.price_per_kg, 0), [quotItems]);
  const quotTax = Math.round(quotSubtotal * 0.12 * 100) / 100;
  const quotShipAmount = quotShipping === "pickup" ? 0 : Number(quotShippingFee) || 0;
  const quotTotal = quotSubtotal + quotTax + quotShipAmount;

  const quotNumber = useMemo(() => `QT-${Date.now().toString(36).toUpperCase().slice(-6)}`, [showQuotation]); // eslint-disable-line react-hooks/exhaustive-deps

  const openQuotation = async () => {
    // Pre-fill from opportunity form
    const compName = showNewCompany && newCompanyName.trim()
      ? newCompanyName.trim()
      : formCompanyId ? companies.find((c) => c.id === formCompanyId)?.name ?? "" : "";
    const contName = showNewPerson && newPersonFirst.trim()
      ? `${newPersonFirst.trim()} ${newPersonLast.trim()}`
      : formContactId ? (() => { const p = people.find((p) => p.id === formContactId); return p ? `${p.first_name} ${p.last_name}` : ""; })() : "";
    setQuotCompanyName(compName);
    setQuotContactName(contName);
    setQuotDealName(formName);
    setQuotDate(new Date().toISOString().split("T")[0]);
    setQuotNotes("");
    setQuotShipping("pickup");
    setQuotShippingFee(0);
    setQuotItems([]);
    setQuotItemKey(0);
    qResetForm();
    setShowQuotation(true);

    // Load products if not yet loaded
    if (quotProducts.length === 0) {
      setQuotProductsLoading(true);
      try {
        const [pData, prices] = await Promise.all([getProductsForOrder(), getMarketPrices()]);
        setQuotProducts(pData.products as unknown as QuotProduct[]);
        const priceMap: Record<number, number> = {};
        for (const p of prices) { if (p.category_id && p.price_per_kg) priceMap[Number(p.category_id)] = Number(p.price_per_kg); }
        setQuotMarketPrices(priceMap);
      } catch (err) { console.error("Load products error:", err); }
      finally { setQuotProductsLoading(false); }
    }
  };

  const openQuotationFromDetail = async (opp: CrmOpportunity) => {
    setQuotCompanyName(opp.company_name ?? "");
    setQuotContactName(opp.contact_name ?? "");
    setQuotDealName(opp.name);
    setQuotDate(new Date().toISOString().split("T")[0]);
    setQuotNotes("");
    setQuotShipping("pickup");
    setQuotShippingFee(0);
    setQuotItems([]);
    setQuotItemKey(0);
    qResetForm();
    setShowQuotation(true);

    if (quotProducts.length === 0) {
      setQuotProductsLoading(true);
      try {
        const [pData, prices] = await Promise.all([getProductsForOrder(), getMarketPrices()]);
        setQuotProducts(pData.products as unknown as QuotProduct[]);
        const priceMap: Record<number, number> = {};
        for (const p of prices) { if (p.category_id && p.price_per_kg) priceMap[Number(p.category_id)] = Number(p.price_per_kg); }
        setQuotMarketPrices(priceMap);
      } catch (err) { console.error("Load products error:", err); }
      finally { setQuotProductsLoading(false); }
    }
  };

  const dismissQuotation = () => {
    setShowQuotation(false);
    setShowQuotAddItem(false);
    qResetForm();
  };

  const isQuotDirty = (): boolean => quotItems.length > 0 || quotNotes !== "";

  const dismissCreate = () => {
    setFormName(""); setFormAmount(""); setFormStage("incoming"); setFormCloseDate("");
    setFormProbability("50"); setFormCompanyId(""); setFormContactId(""); setFormNotes("");
    setShowNewCompany(false); setNewCompanyName("");
    setNewCompanyPhone(""); setNewCompanyEmail(""); setNewCompanyAddress("");
    setShowNewPerson(false); setNewPersonFirst(""); setNewPersonLast(""); setNewPersonEmail("");
    setNewPersonPhone(""); setNewPersonCity("");
    setShowCreate(false);
  };

  const dismissDetail = () => setDetailOpp(null);

  const loadData = useCallback(async () => {
    try {
      const [o, c, p] = await Promise.all([getCrmOpportunities(), getCrmCompanies(), getCrmPeople()]);
      setOpportunities(o);
      setCompanies(c);
      setPeople(p);
      setStages(readCustomStages());
    } catch (err) {
      console.error("CRM Opportunities load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (detailOpp) {
      getCrmActivities("opportunity", detailOpp.id).then(setActivities);
      setEditForm({ ...detailOpp });
      setQuotationsLoading(true);
      getQuotationsByOpportunity(detailOpp.id)
        .then(setOppQuotations)
        .finally(() => setQuotationsLoading(false));
    } else {
      setActivities([]);
      setEditForm(null);
      setOppQuotations([]);
    }
  }, [detailOpp]);

  /* ── Stats ── */
  const stats = useMemo(() => {
    const active = opportunities.filter((o) => o.stage !== "closed_won" && o.stage !== "closed_lost");
    const pipelineValue = active.reduce((s, o) => s + o.amount, 0);
    const wonValue = opportunities.filter((o) => o.stage === "closed_won").reduce((s, o) => s + o.amount, 0);
    const lostValue = opportunities.filter((o) => o.stage === "closed_lost").reduce((s, o) => s + o.amount, 0);
    const avgProb = active.length > 0 ? Math.round(active.reduce((s, o) => s + o.probability, 0) / active.length) : 0;
    return [
      { label: "Pipeline Value", value: formatCurrency(pipelineValue) },
      { label: "Won", value: formatCurrency(wonValue) },
      { label: "Lost", value: formatCurrency(lostValue) },
      { label: "Avg Probability", value: `${avgProb}%` },
    ];
  }, [opportunities]);

  /* ── Filtered/sorted for table ── */
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let result = [...opportunities];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((o) =>
        o.name.toLowerCase().includes(q) ||
        (o.company_name ?? "").toLowerCase().includes(q) ||
        (o.contact_name ?? "").toLowerCase().includes(q) ||
        o.stage.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let va: string | number, vb: string | number;
      switch (sortKey) {
        case "amount": va = a.amount; vb = b.amount; break;
        case "close_date": va = a.close_date; vb = b.close_date; break;
        default: va = (a[sortKey] ?? "").toString().toLowerCase(); vb = (b[sortKey] ?? "").toString().toLowerCase();
      }
      if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return result;
  }, [opportunities, searchQuery, sortKey, sortDir]);

  /* ── Kanban groups ── */
  const kanbanGroups = useMemo(() => {
    const groups: Record<string, CrmOpportunity[]> = {};
    stages.forEach((s) => { groups[s.key] = []; });
    const displayOpps = searchQuery.trim()
      ? opportunities.filter((o) => {
          const q = searchQuery.toLowerCase();
          return o.name.toLowerCase().includes(q) || (o.company_name ?? "").toLowerCase().includes(q);
        })
      : opportunities;
    displayOpps.forEach((o) => {
      if (groups[o.stage]) groups[o.stage].push(o);
    });
    return groups;
  }, [opportunities, searchQuery, stages]);

  /* ── Drag and drop handlers ── */
  const handleDragStart = (id: string) => setDraggedId(id);
  const handleDragOver = (e: React.DragEvent, stage: OpportunityStage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };
  const handleDrop = async (stage: OpportunityStage) => {
    if (!draggedId) return;
    setDragOverStage(null);
    setDraggedId(null);
    const opp = opportunities.find((o) => o.id === draggedId);
    if (!opp || opp.stage === stage) return;
    const prob = stage === "closed_won" ? 100 : stage === "closed_lost" ? 0 : opp.probability;
    await updateCrmOpportunity(draggedId, { stage, probability: prob });
    await loadData();
  };

  /* ── Column drag-and-drop handlers ── */
  const handleColDragStart = (e: React.DragEvent, stageKey: string) => {
    e.dataTransfer.setData("text/column-key", stageKey);
    setDraggedColKey(stageKey);
  };
  const handleColDragOver = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    setDragOverColKey(stageKey);
  };
  const handleColDrop = (targetKey: string) => {
    if (!draggedColKey || draggedColKey === targetKey) {
      setDraggedColKey(null);
      setDragOverColKey(null);
      return;
    }
    const fromIdx = stages.findIndex((s) => s.key === draggedColKey);
    const toIdx = stages.findIndex((s) => s.key === targetKey);
    if (fromIdx === -1 || toIdx === -1) return;
    const newStages = [...stages];
    const [moved] = newStages.splice(fromIdx, 1);
    newStages.splice(toIdx, 0, moved);
    writeCustomStages(newStages);
    setStages(newStages);
    setDraggedColKey(null);
    setDragOverColKey(null);
  };

  /* ── Create handler with auto-create company/person ── */
  const handleCreate = async () => {
    if (!formName.trim()) return;
    setSaving(true);
    try {
      let companyId = formCompanyId || null;
      let companyName: string | null = null;
      let contactId = formContactId || null;
      let contactName: string | null = null;

      // Auto-create new company if needed
      if (showNewCompany && newCompanyName.trim()) {
        const newComp = await createCrmCompany({
          name: newCompanyName.trim(),
          domain: "", industry: "", phone: newCompanyPhone.trim(), email: newCompanyEmail.trim(),
          address: newCompanyAddress.trim(), city: "", country: "Philippines",
          logo_url: "", annual_revenue: null, credit_limit: null, outstanding_balance: null, payment_terms: null, is_icp: false, notes: "",
          created_by: performedBy,
        });
        companyId = newComp.id;
        companyName = newComp.name;
      } else if (companyId) {
        companyName = companies.find((c) => c.id === companyId)?.name ?? null;
      }

      // Auto-create new person if needed
      if (showNewPerson && newPersonFirst.trim() && newPersonLast.trim()) {
        const newPer = await createCrmPerson({
          first_name: newPersonFirst.trim(),
          last_name: newPersonLast.trim(),
          email: newPersonEmail.trim(),
          phone: newPersonPhone.trim(), job_title: "", city: newPersonCity.trim(),
          company_id: companyId, company_name: companyName,
          avatar_url: "", notes: "",
          created_by: performedBy,
        });
        contactId = newPer.id;
        contactName = `${newPer.first_name} ${newPer.last_name}`;
      } else if (contactId) {
        const p = people.find((p) => p.id === contactId);
        contactName = p ? `${p.first_name} ${p.last_name}` : null;
      }

      await createCrmOpportunity({
        name: formName.trim(),
        amount: parseFloat(formAmount) || 0,
        stage: formStage,
        close_date: formCloseDate || new Date().toISOString().split("T")[0],
        probability: parseInt(formProbability) || 50,
        company_id: companyId,
        company_name: companyName,
        contact_id: contactId,
        contact_name: contactName,
        notes: formNotes,
        created_by: performedBy,
      });

      // Reset
      setFormName(""); setFormAmount(""); setFormStage("incoming"); setFormCloseDate("");
      setFormProbability("50"); setFormCompanyId(""); setFormContactId(""); setFormNotes("");
      setShowNewCompany(false); setNewCompanyName("");
      setNewCompanyPhone(""); setNewCompanyEmail(""); setNewCompanyAddress("");
      setShowNewPerson(false); setNewPersonFirst(""); setNewPersonLast(""); setNewPersonEmail("");
      setNewPersonPhone(""); setNewPersonCity("");
      setShowCreate(false);
      await loadData();
    } catch (err) {
      console.error("Create opportunity error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editForm || !detailOpp) return;
    setEditSaving(true);
    try {
      const updated = await updateCrmOpportunity(detailOpp.id, editForm);
      if (updated) { setDetailOpp(updated); await loadData(); }
    } catch (err) { console.error("Update opportunity error:", err); }
    finally { setEditSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteCrmOpportunity(deleteTarget.id);
    setDeleteTarget(null);
    if (detailOpp?.id === deleteTarget.id) setDetailOpp(null);
    await loadData();
  };

  const openCreateForStage = (stage: OpportunityStage) => {
    setFormStage(stage);
    setCreateStage(stage);
    setShowCreate(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-sm uppercase tracking-widest animate-pulse" style={{ color: "var(--muted)" }}>Loading pipeline...</p>
      </div>
    );
  }

  return (
    <>
      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="relative p-5 animate-fade-up"
            style={{ backgroundColor: "var(--input-bg)", borderBottom: "2px solid var(--border)", animationDelay: `${i * 0.1}s`, transition: "background-color 0.4s ease" }}>
            <div className="absolute top-2 right-2 rounded-full" style={{ width: "4px", height: "4px", backgroundColor: "var(--border)" }} />
            <p className="text-xs uppercase tracking-widest font-[family-name:var(--font-body)]" style={{ color: "var(--muted)" }}>{stat.label}</p>
            <p className="mt-2 text-2xl font-[family-name:var(--font-display)] text-foreground tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── TOOLBAR ── */}
      <div className="animate-fade-up delay-300 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {/* View toggle */}
          {(["kanban", "table"] as ViewMode[]).map((mode) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: viewMode === mode ? "var(--btn-bg)" : "var(--background)",
                color: viewMode === mode ? "var(--btn-text)" : "var(--foreground)",
                fontFamily: "var(--font-body)",
                transition: "all 0.2s",
              }}>
              {mode === "kanban" ? icons.kanban : icons.table}
              {mode === "kanban" ? "Pipeline" : "Table"}
            </button>
          ))}
          {/* Manage Stages */}
          <button onClick={() => { setEditStages(stages.map(s => ({ ...s }))); setShowManageStages(true); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
            style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-body)", transition: "all 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--row-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--background)")}>
            {icons.gear} Stages
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-2"
            style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)", minWidth: 200 }}>
            <span className="text-muted shrink-0">{icons.search}</span>
            <input ref={searchRef} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deals..." className="bg-transparent outline-none text-sm w-full"
              style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }} />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); searchRef.current?.focus(); }}
                className="text-muted cursor-pointer shrink-0" style={{ transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
                {icons.x}
              </button>
            )}
          </div>
          <button onClick={() => openCreateForStage("incoming")}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
            style={{ backgroundColor: "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)", transition: "background-color 0.3s" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-bg)")}>
            {icons.plus} New Deal
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════
         KANBAN VIEW
         ════════════════════════════════════════ */}
      {viewMode === "kanban" && (
        <div className="animate-fade-up delay-400 flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
          {stages.map((stage) => {
            const stageOpps = kanbanGroups[stage.key] ?? [];
            const stageTotal = stageOpps.reduce((s, o) => s + o.amount, 0);
            const isDragOver = dragOverStage === stage.key;
            const isColDragged = draggedColKey === stage.key;
            const isColDragOver = dragOverColKey === stage.key && draggedColKey !== stage.key;
            return (
              <div
                key={stage.key}
                className="flex-shrink-0 flex flex-col"
                style={{
                  width: 280,
                  position: "relative",
                  backgroundColor: isDragOver ? "var(--row-hover)" : "var(--input-bg)",
                  border: isDragOver ? "1px dashed var(--accent)" : "1px solid var(--border)",
                  opacity: isColDragged ? 0.5 : 1,
                  transition: "background-color 0.2s, border-color 0.2s, opacity 0.2s",
                  ...(isColDragOver ? { outline: "2px dashed var(--accent)", outlineOffset: -2 } : {}),
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggedColKey) {
                    handleColDragOver(e, stage.key);
                  } else {
                    handleDragOver(e, stage.key);
                  }
                }}
                onDragLeave={() => {
                  setDragOverStage(null);
                  setDragOverColKey(null);
                }}
                onDrop={() => {
                  if (draggedColKey) {
                    handleColDrop(stage.key);
                  } else {
                    handleDrop(stage.key);
                  }
                }}
              >
                {/* Column header */}
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `2px solid ${stage.color}` }}>
                  <div className="flex items-center gap-2">
                    <span
                      draggable
                      onDragStart={(e) => { e.stopPropagation(); handleColDragStart(e, stage.key); }}
                      onDragEnd={() => { setDraggedColKey(null); setDragOverColKey(null); }}
                      className="flex items-center"
                      style={{ cursor: "grab", color: "var(--muted)", transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                    >
                      {icons.gripDots}
                    </span>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-[11px] uppercase tracking-wider font-medium text-foreground" style={{ fontFamily: "var(--font-body)" }}>
                      {stage.label}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5" style={{ backgroundColor: "var(--background)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                      {stageOpps.length}
                    </span>
                  </div>
                  <button onClick={() => openCreateForStage(stage.key)} className="cursor-pointer p-0.5"
                    style={{ color: "var(--muted)", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
                    {icons.plus}
                  </button>
                </div>

                {/* Column total */}
                <div className="px-4 py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                  <span className="text-xs font-medium text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                    {formatCurrency(stageTotal)}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2" style={{ maxHeight: 500 }}>
                  {stageOpps.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)" }}>No deals</p>
                    </div>
                  ) : (
                    stageOpps.map((opp) => (
                      <div
                        key={opp.id}
                        draggable
                        onDragStart={() => handleDragStart(opp.id)}
                        onClick={() => setDetailOpp(opp)}
                        className="p-3 cursor-pointer transition-all"
                        style={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          opacity: draggedId === opp.id ? 0.5 : 1,
                          transition: "opacity 0.2s, box-shadow 0.2s, transform 0.1s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        <p className="text-sm font-medium text-foreground mb-1.5 truncate">{opp.name}</p>
                        <p className="text-base font-[family-name:var(--font-display)] text-foreground mb-2">{formatCurrency(opp.amount)}</p>
                        <div className="space-y-1">
                          {opp.company_name && (
                            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--muted)" }}>
                              {icons.company}
                              <span className="truncate">{opp.company_name}</span>
                            </div>
                          )}
                          {opp.contact_name && (
                            <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--muted)" }}>
                              {icons.user}
                              <span className="truncate">{opp.contact_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: "var(--muted)" }}>
                            {icons.calendar}
                            <span>{formatDate(opp.close_date)}</span>
                          </div>
                        </div>
                        {/* Probability bar */}
                        <div className="mt-2">
                          <div className="h-1 rounded-full" style={{ backgroundColor: "var(--border)" }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${opp.probability}%`, backgroundColor: stage.color }} />
                          </div>
                          <p className="text-[9px] mt-0.5 text-right" style={{ color: "var(--muted)" }}>{opp.probability}%</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ════════════════════════════════════════
         TABLE VIEW
         ════════════════════════════════════════ */}
      {viewMode === "table" && (
        <div className="animate-fade-up delay-400" style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <SortHeader label="Deal" col="name" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Amount" col="amount" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Stage" col="stage" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Close Date" col="close_date" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Company" col="company_name" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <SortHeader label="Contact" col="contact_name" className="px-5" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--muted)" }}>Prob.</th>
                  <th className="px-3 py-3 w-16" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span style={{ color: "var(--border)" }}>{icons.trendUp}</span>
                        <span className="text-sm text-muted">{searchQuery ? "No deals match your search" : "No opportunities yet"}</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((opp) => {
                    const si = getStageInfo(opp.stage, stages);
                    return (
                      <tr key={opp.id} className="transition-colors cursor-pointer"
                        style={{ borderBottom: "1px solid var(--border)" }}
                        onClick={() => setDetailOpp(opp)}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--row-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                        <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">{opp.name}</td>
                        <td className="px-5 py-3 text-foreground font-medium whitespace-nowrap font-[family-name:var(--font-display)]">{formatCurrency(opp.amount)}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-1"
                            style={{ backgroundColor: `${si.color}20`, color: si.color, fontFamily: "var(--font-body)", border: `1px solid ${si.color}40` }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: si.color }} />
                            {si.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-muted whitespace-nowrap">{formatDate(opp.close_date)}</td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          {opp.company_name ? (
                            <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--foreground)" }}>
                              {icons.company} {opp.company_name}
                            </span>
                          ) : <span className="text-muted">{"\u2014"}</span>}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          {opp.contact_name ? (
                            <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--foreground)" }}>
                              {icons.user} {opp.contact_name}
                            </span>
                          ) : <span className="text-muted">{"\u2014"}</span>}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: "var(--border)" }}>
                              <div className="h-full rounded-full" style={{ width: `${opp.probability}%`, backgroundColor: si.color }} />
                            </div>
                            <span className="text-xs text-muted">{opp.probability}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setDeleteTarget(opp)} className="p-1.5 cursor-pointer"
                            style={{ color: "var(--muted)", transition: "color 0.2s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
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
          <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
            <span className="text-xs text-muted uppercase tracking-wider">{filtered.length} deal{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
         CREATE OPPORTUNITY MODAL
         ════════════════════════════════════════ */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }} onClick={() => requestDismiss(dismissCreate, isCreateDirty())}>
          <div className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-fade-up"
            style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <h3 className="font-[family-name:var(--font-display)] text-base uppercase tracking-wider text-foreground">New Opportunity</h3>
              <button onClick={() => requestDismiss(dismissCreate, isCreateDirty())} className="cursor-pointer p-1" style={{ color: "var(--muted)", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
                {icons.xLg}
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <Field label="Deal Name *" value={formName} onChange={setFormName} placeholder="Q1 Bulk Order" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Amount (₱)" value={formAmount} onChange={setFormAmount} type="number" placeholder="2500000" />
                <div>
                  <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Stage</label>
                  <select value={formStage} onChange={(e) => setFormStage(e.target.value as OpportunityStage)}
                    className="w-full px-3 py-2 text-sm outline-none cursor-pointer"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                    {stages.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Close Date" value={formCloseDate} onChange={setFormCloseDate} type="date" />
                <Field label="Probability (%)" value={formProbability} onChange={setFormProbability} type="number" placeholder="50" />
              </div>

              {/* Company — existing or new */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Company</label>
                  <button onClick={() => { setShowNewCompany(!showNewCompany); if (!showNewCompany) setFormCompanyId(""); }}
                    className="text-[10px] uppercase tracking-widest cursor-pointer"
                    style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
                    {showNewCompany ? "Select Existing" : "+ New Company"}
                  </button>
                </div>
                {showNewCompany ? (
                  <div className="space-y-2">
                    <input type="text" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)}
                      placeholder="New company name" className="w-full px-3 py-2 text-sm outline-none"
                      style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--accent)", color: "var(--foreground)", fontFamily: "var(--font-body)" }} />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={newCompanyPhone} onChange={(e) => setNewCompanyPhone(e.target.value)}
                        placeholder="Phone" className="w-full px-3 py-2 text-sm outline-none"
                        style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--accent)", color: "var(--foreground)", fontFamily: "var(--font-body)" }} />
                      <input type="email" value={newCompanyEmail} onChange={(e) => setNewCompanyEmail(e.target.value)}
                        placeholder="Email" className="w-full px-3 py-2 text-sm outline-none"
                        style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--accent)", color: "var(--foreground)", fontFamily: "var(--font-body)" }} />
                    </div>
                    <input type="text" value={newCompanyAddress} onChange={(e) => setNewCompanyAddress(e.target.value)}
                      placeholder="Address" className="w-full px-3 py-2 text-sm outline-none"
                      style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--accent)", color: "var(--foreground)", fontFamily: "var(--font-body)" }} />
                  </div>
                ) : (
                  <select value={formCompanyId} onChange={(e) => setFormCompanyId(e.target.value)}
                    className="w-full px-3 py-2 text-sm outline-none cursor-pointer"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                    <option value="">No Company</option>
                    {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
              </div>

              {/* Contact — existing or new */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] uppercase tracking-widest" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Point of Contact</label>
                  <button onClick={() => { setShowNewPerson(!showNewPerson); if (!showNewPerson) setFormContactId(""); }}
                    className="text-[10px] uppercase tracking-widest cursor-pointer"
                    style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>
                    {showNewPerson ? "Select Existing" : "+ New Person"}
                  </button>
                </div>
                {showNewPerson ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={newPersonFirst} onChange={(e) => setNewPersonFirst(e.target.value)}
                        placeholder="First Name" className="px-3 py-2 text-sm outline-none"
                        style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--accent)", color: "var(--foreground)", fontFamily: "var(--font-body)" }} />
                      <input type="text" value={newPersonLast} onChange={(e) => setNewPersonLast(e.target.value)}
                        placeholder="Last Name" className="px-3 py-2 text-sm outline-none"
                        style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--accent)", color: "var(--foreground)", fontFamily: "var(--font-body)" }} />
                    </div>
                    <input type="email" value={newPersonEmail} onChange={(e) => setNewPersonEmail(e.target.value)}
                      placeholder="Email (optional)" className="w-full px-3 py-2 text-sm outline-none"
                      style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--accent)", color: "var(--foreground)", fontFamily: "var(--font-body)" }} />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={newPersonPhone} onChange={(e) => setNewPersonPhone(e.target.value)}
                        placeholder="Phone" className="px-3 py-2 text-sm outline-none"
                        style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--accent)", color: "var(--foreground)", fontFamily: "var(--font-body)" }} />
                      <input type="text" value={newPersonCity} onChange={(e) => setNewPersonCity(e.target.value)}
                        placeholder="City" className="px-3 py-2 text-sm outline-none"
                        style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--accent)", color: "var(--foreground)", fontFamily: "var(--font-body)" }} />
                    </div>
                  </div>
                ) : (
                  <select value={formContactId} onChange={(e) => setFormContactId(e.target.value)}
                    className="w-full px-3 py-2 text-sm outline-none cursor-pointer"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                    <option value="">No Contact</option>
                    {people.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}{p.company_name ? ` (${p.company_name})` : ""}</option>)}
                  </select>
                )}
              </div>

              <Field label="Notes" value={formNotes} onChange={setFormNotes} textarea placeholder="Deal notes..." />

              {/* Auto-create hint */}
              {(showNewCompany || showNewPerson) && (
                <div className="px-3 py-2 text-[10px] uppercase tracking-widest"
                  style={{ backgroundColor: "var(--row-even)", border: "1px solid var(--border)", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                  {showNewCompany && showNewPerson
                    ? "A new company and contact will be created automatically"
                    : showNewCompany
                    ? "A new company will be created automatically"
                    : "A new contact will be created automatically"}
                </div>
              )}
            </div>
            <div className="px-6 py-4 flex items-center gap-3" style={{ borderTop: "1px solid var(--border)" }}>
              <button onClick={openQuotation}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{ border: "1px solid var(--accent)", backgroundColor: "transparent", color: "var(--accent)", fontFamily: "var(--font-body)", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--accent)"; }}>
                {icons.inquiry} Inquiry
              </button>
              <div className="flex-1" />
              <button onClick={() => requestDismiss(dismissCreate, isCreateDirty())} className="px-4 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                Cancel
              </button>
              <button onClick={handleCreate} disabled={!formName.trim() || saving}
                className="px-4 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{ backgroundColor: saving ? "var(--muted)" : "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)", opacity: !formName.trim() ? 0.5 : 1, transition: "background-color 0.3s, opacity 0.2s" }}>
                {saving ? "Creating..." : "Create Deal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
         DETAIL PANEL
         ════════════════════════════════════════ */}
      {detailOpp && editForm && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }} onClick={() => requestDismiss(dismissDetail, isEditDirty())}>
          <div className="w-full max-w-xl h-full overflow-y-auto"
            style={{ backgroundColor: "var(--background)", borderLeft: "1px solid var(--border)", boxShadow: "-8px 0 30px rgba(0,0,0,0.2)", animation: "slideInRight 0.3s ease-out" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 flex items-center justify-between sticky top-0 z-10"
              style={{ backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)" }}>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-base uppercase tracking-wider text-foreground">{detailOpp.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {(() => { const si = getStageInfo(detailOpp.stage, stages); return (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5"
                      style={{ backgroundColor: `${si.color}20`, color: si.color, border: `1px solid ${si.color}40`, fontFamily: "var(--font-body)" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: si.color }} />{si.label}
                    </span>
                  ); })()}
                  <span className="text-xs font-medium text-foreground font-[family-name:var(--font-display)]">{formatCurrency(detailOpp.amount)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setDeleteTarget(detailOpp)} className="p-1.5 cursor-pointer"
                  style={{ color: "var(--muted)", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
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
              <Field label="Deal Name" value={editForm.name} onChange={(v) => setEditForm({ ...editForm, name: v })} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Amount (₱)" value={editForm.amount.toString()} onChange={(v) => setEditForm({ ...editForm, amount: parseFloat(v) || 0 })} type="number" />
                <div>
                  <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Stage</label>
                  <select value={editForm.stage} onChange={(e) => {
                    const newStage = e.target.value as OpportunityStage;
                    const prob = newStage === "closed_won" ? 100 : newStage === "closed_lost" ? 0 : editForm.probability;
                    setEditForm({ ...editForm, stage: newStage, probability: prob });
                  }}
                    className="w-full px-3 py-2 text-sm outline-none cursor-pointer"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                    {stages.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Close Date" value={editForm.close_date} onChange={(v) => setEditForm({ ...editForm, close_date: v })} type="date" />
                <Field label="Probability (%)" value={editForm.probability.toString()} onChange={(v) => setEditForm({ ...editForm, probability: parseInt(v) || 0 })} type="number" />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Company</label>
                <select value={editForm.company_id ?? ""} onChange={(e) => {
                  const id = e.target.value || null;
                  const comp = companies.find((c) => c.id === id);
                  setEditForm({ ...editForm, company_id: id, company_name: comp?.name ?? null });
                }}
                  className="w-full px-3 py-2 text-sm outline-none cursor-pointer"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                  <option value="">No Company</option>
                  {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest mb-1.5" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Point of Contact</label>
                <select value={editForm.contact_id ?? ""} onChange={(e) => {
                  const id = e.target.value || null;
                  const p = people.find((p) => p.id === id);
                  setEditForm({ ...editForm, contact_id: id, contact_name: p ? `${p.first_name} ${p.last_name}` : null });
                }}
                  className="w-full px-3 py-2 text-sm outline-none cursor-pointer"
                  style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                  <option value="">No Contact</option>
                  {people.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
                </select>
              </div>

              <Field label="Notes" value={editForm.notes} onChange={(v) => setEditForm({ ...editForm, notes: v })} textarea />

              <div className="flex gap-3">
                <button onClick={handleUpdate} disabled={editSaving} className="flex-1 py-2.5 text-[11px] uppercase tracking-wider cursor-pointer"
                  style={{ backgroundColor: editSaving ? "var(--muted)" : "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)", transition: "background-color 0.3s" }}
                  onMouseEnter={(e) => { if (!editSaving) e.currentTarget.style.backgroundColor = "var(--btn-hover)"; }}
                  onMouseLeave={(e) => { if (!editSaving) e.currentTarget.style.backgroundColor = "var(--btn-bg)"; }}>
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
                <button onClick={() => detailOpp && openQuotationFromDetail(detailOpp)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-[11px] uppercase tracking-wider cursor-pointer"
                  style={{ border: "1px solid var(--accent)", backgroundColor: "transparent", color: "var(--accent)", fontFamily: "var(--font-body)", transition: "all 0.2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--accent)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--accent)"; }}>
                  {icons.inquiry} Inquiry
                </button>
              </div>

              <div className="pt-2"><div className="h-px" style={{ backgroundColor: "var(--border)" }} /></div>

              {/* Activity */}
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

              {/* ── Quotations for this opportunity ── */}
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <h4 className="font-[family-name:var(--font-display)] text-xs uppercase tracking-wider text-foreground mb-3">
                  Quotations {oppQuotations.length > 0 && <span style={{ color: "var(--muted)" }}>({oppQuotations.length})</span>}
                </h4>
                {quotationsLoading ? (
                  <p className="text-xs animate-pulse" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Loading...</p>
                ) : oppQuotations.length === 0 ? (
                  <div className="py-4 text-center"><p className="text-xs text-muted" style={{ fontFamily: "var(--font-body)" }}>No quotations yet</p></div>
                ) : (
                  <div className="space-y-2">
                    {oppQuotations.map((q) => {
                      const statusColor = q.status === "approved" ? "#22c55e" : q.status === "rejected" ? "#ef4444" : "var(--muted)";
                      return (
                        <div key={q.id} className="p-3 cursor-pointer" onClick={() => setViewQuotation(q)}
                          style={{ border: "1px solid var(--border)", backgroundColor: "var(--input-bg)", transition: "border-color 0.2s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium font-[family-name:var(--font-display)] tracking-wide text-foreground">
                              <span style={{ color: "var(--muted)", opacity: 0.7 }}>{icons.eye}</span>
                              {q.quotation_number}
                            </span>
                            <span className="text-[9px] px-2 py-0.5 uppercase tracking-widest"
                              style={{
                                backgroundColor: `${statusColor}15`,
                                color: statusColor,
                                border: `1px solid ${statusColor}40`,
                                fontFamily: "var(--font-body)",
                              }}>
                              {q.status}
                            </span>
                          </div>
                          <div className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                            {"\u20B1"}{q.total.toLocaleString(undefined, { minimumFractionDigits: 2 })} &middot; {formatDate(q.created_at)}
                          </div>
                          <div className="text-[10px] mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                            By {q.created_by}
                          </div>
                          {q.status === "draft" && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setApproveModalTarget(q);
                                  setApproveNotes("");
                                }}
                                className="text-[10px] uppercase tracking-wider px-2.5 py-1 cursor-pointer"
                                style={{ backgroundColor: "#22c55e", color: "#fff", fontFamily: "var(--font-body)", transition: "opacity 0.2s" }}
                                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                                Approve
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setRejectModalTarget(q); setRejectNotes(""); }}
                                className="text-[10px] uppercase tracking-wider px-2.5 py-1 cursor-pointer"
                                style={{ border: "1px solid var(--border)", color: "var(--muted)", fontFamily: "var(--font-body)", transition: "all 0.2s" }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}>
                                Reject
                              </button>
                            </div>
                          )}
                          {q.status === "approved" && q.approved_by && (
                            <>
                              <div className="text-[10px] mt-1.5" style={{ color: "#22c55e", fontFamily: "var(--font-body)" }}>
                                Approved by {q.approved_by} &middot; {q.approved_at ? formatDate(q.approved_at) : ""}
                              </div>
                              {q.approval_notes && (
                                <div className="text-[10px] mt-0.5 truncate" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                                  {q.approval_notes}
                                </div>
                              )}
                            </>
                          )}
                          {q.status === "rejected" && (
                            <div className="text-[10px] mt-1.5" style={{ color: "#ef4444", fontFamily: "var(--font-body)" }}>
                              Rejected by {q.rejected_by}{q.rejection_notes ? ` — ${q.rejection_notes}` : ""}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 space-y-1">
                <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--muted)" }}>
                  <span>{icons.clock}</span><span>Created {formatDate(detailOpp.created_at)} by {detailOpp.created_by}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]" style={{ color: "var(--muted)" }}>
                  <span>{icons.edit}</span><span>Updated {formatDate(detailOpp.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
         NEW QUOTATION MODAL
         ════════════════════════════════════════ */}
      {showQuotation && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
          onClick={() => requestDismiss(dismissQuotation, isQuotDirty())}>
          <div className="w-full max-w-5xl mx-4 max-h-[92vh] overflow-y-auto animate-fade-up"
            style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}
            onClick={(e) => e.stopPropagation()}>

            {/* ── Quotation Header ── */}
            <div style={{ backgroundColor: "var(--input-bg)", borderBottom: "1px solid var(--border)" }}>
              <div className="px-6 pt-5 pb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-[family-name:var(--font-display)] uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                      New Quotation
                    </h2>
                    <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                      {quotDealName || "Untitled Deal"}
                    </p>
                  </div>
                  <button onClick={() => requestDismiss(dismissQuotation, isQuotDirty())} className="cursor-pointer p-1" style={{ color: "var(--muted)", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
                    {icons.xLg}
                  </button>
                </div>

                <div className="h-[2px] mt-3 mb-4" style={{ backgroundColor: "var(--accent)" }} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Company & Contact */}
                  <div style={{ border: "1px solid var(--border)" }}>
                    <div className="px-4 py-2 text-[10px] uppercase tracking-[0.15em] font-medium"
                      style={{ backgroundColor: "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)" }}>
                      Client Details
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      {quotCompanyName ? (
                        <div className="flex items-center gap-2 text-sm text-foreground" style={{ fontFamily: "var(--font-body)" }}>
                          {icons.company} <span className="font-medium">{quotCompanyName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted" style={{ fontFamily: "var(--font-body)" }}>No company selected</span>
                      )}
                      {quotContactName ? (
                        <div className="flex items-center gap-2 text-sm text-foreground" style={{ fontFamily: "var(--font-body)" }}>
                          {icons.user} <span>{quotContactName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted" style={{ fontFamily: "var(--font-body)" }}>No contact selected</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Quotation details */}
                  <div className="flex flex-col items-end justify-center">
                    <table style={{ fontFamily: "var(--font-body)", borderCollapse: "collapse" }}>
                      <tbody>
                        <tr>
                          <td className="py-0.5 pr-6 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--foreground)" }}>QT Number:</td>
                          <td className="py-0.5 text-right text-sm font-[family-name:var(--font-display)] tracking-wide" style={{ color: "var(--foreground)" }}>{quotNumber}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 pr-6 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--foreground)" }}>Date:</td>
                          <td className="py-0.5 text-right text-sm" style={{ color: "var(--foreground)" }}>
                            <label className="relative cursor-pointer">
                              <span className="font-[family-name:var(--font-display)] tracking-wide">
                                {quotDate ? new Date(quotDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "\u2014"}
                              </span>
                              <input type="date" value={quotDate} onChange={(e) => setQuotDate(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" style={{ width: "100%", height: "100%" }} />
                            </label>
                          </td>
                        </tr>
                        <tr>
                          <td className="py-0.5 pr-6 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--foreground)" }}>Prepared By:</td>
                          <td className="py-0.5 text-right text-sm" style={{ color: "var(--foreground)" }}>{performedBy}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Line Items Section ── */}
            <div style={{ backgroundColor: "var(--input-bg)" }}>
              {/* Add Item Button */}
              <div className="px-6 py-4 flex items-center gap-3">
                <button onClick={() => { qResetForm(); setShowQuotAddItem(true); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-wider cursor-pointer"
                  style={{ backgroundColor: "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)", transition: "background-color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-bg)")}>
                  {icons.plus} Add Items
                </button>
                {quotProductsLoading && (
                  <span className="text-[10px] uppercase tracking-widest animate-pulse" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Loading products...</span>
                )}
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["#", "Product", "Category", "Qty", "Wt/pc", "Price/pc", "Price/kg", "Weight", "Line Total", ""].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {quotItems.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-5 py-14 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span style={{ color: "var(--border)" }}>{icons.package}</span>
                            <span className="text-sm text-muted">No items added yet</span>
                            <span className="text-xs text-muted opacity-60">Click &quot;Add Items&quot; to build your quotation</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      quotItems.map((item, i) => {
                        const weight = item.quantity * item.weight_per_piece;
                        const lineTotal = weight * item.price_per_kg;
                        return (
                          <tr key={item.key} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td className="px-5 py-3 text-muted">{i + 1}</td>
                            <td className="px-5 py-3 text-foreground whitespace-nowrap">
                              <span className="text-muted text-xs mr-1">{item.sku}</span> {item.product_name}
                            </td>
                            <td className="px-5 py-3 text-muted whitespace-nowrap">{item.category_name}</td>
                            <td className="px-5 py-3 text-foreground">{item.quantity.toLocaleString()}</td>
                            <td className="px-5 py-3 text-muted">{item.weight_per_piece.toLocaleString(undefined, { minimumFractionDigits: 2 })} kg</td>
                            <td className="px-5 py-3 text-muted">{"\u20B1"}{(item.weight_per_piece * item.price_per_kg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="px-5 py-3 text-muted">{"\u20B1"}{item.price_per_kg.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="px-5 py-3 text-muted">{weight.toLocaleString(undefined, { minimumFractionDigits: 2 })} kg</td>
                            <td className="px-5 py-3 text-foreground font-medium">{"\u20B1"}{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="px-5 py-3">
                              <div className="flex gap-3">
                                <button onClick={() => qHandleEditItem(item.key)} className="text-xs uppercase tracking-wider cursor-pointer"
                                  style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}>Edit</button>
                                <button onClick={() => setQuotItems((prev) => prev.filter((it) => it.key !== item.key))} className="text-xs uppercase tracking-wider cursor-pointer"
                                  style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}>Remove</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Footer: Notes + Shipping + Totals ── */}
            <div style={{ backgroundColor: "var(--input-bg)", borderTop: "1px solid var(--border)" }}>
              <div className="flex flex-col lg:flex-row">
                {/* Left: Notes + Shipping */}
                <div className="flex-1 min-w-0 p-6" style={{ borderRight: "1px solid var(--border)" }}>
                  <label className="block text-[10px] uppercase tracking-[0.2em] mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}>Shipping</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {([
                      { value: "pickup" as const, label: "Pickup" },
                      { value: "truck" as const, label: "Truck" },
                      { value: "shipment" as const, label: "Shipment" },
                    ]).map((opt) => (
                      <button key={opt.value} onClick={() => { setQuotShipping(opt.value); if (opt.value === "pickup") setQuotShippingFee(0); }}
                        className="px-3 py-2 text-xs uppercase tracking-wider cursor-pointer"
                        style={{
                          border: quotShipping === opt.value ? "2px solid var(--foreground)" : "1px solid var(--border)",
                          backgroundColor: quotShipping === opt.value ? "var(--background)" : "transparent",
                          color: quotShipping === opt.value ? "var(--foreground)" : "var(--muted)",
                          fontFamily: "var(--font-body)", transition: "all 0.2s",
                        }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {quotShipping !== "pickup" && (
                    <div className="mb-4 max-w-[200px] animate-fade-in">
                      <label className="block text-[9px] uppercase tracking-[0.15em] mb-1.5" style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}>Shipping Fee ({"\u20B1"})</label>
                      <input type="number" min={0} step={0.01} value={quotShippingFee} onChange={(e) => setQuotShippingFee(e.target.value ? Number(e.target.value) : "")}
                        className="w-full px-3 py-2.5 text-sm outline-none"
                        style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)", transition: "border-color 0.2s" }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                    </div>
                  )}
                  <label className="block text-[10px] uppercase tracking-[0.2em] mb-2" style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}>Notes</label>
                  <textarea value={quotNotes} onChange={(e) => setQuotNotes(e.target.value)} rows={3}
                    className="w-full px-3 py-2.5 text-sm resize-none outline-none"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)", transition: "border-color 0.2s" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    placeholder="Delivery instructions, special requests..." />
                </div>

                {/* Right: Totals */}
                <div className="lg:w-72 p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Subtotal</span>
                      <span className="text-sm text-foreground tabular-nums" style={{ fontFamily: "var(--font-body)" }}>{"\u20B1"}{quotSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Tax (12%)</span>
                      <span className="text-sm text-foreground tabular-nums" style={{ fontFamily: "var(--font-body)" }}>{"\u20B1"}{quotTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    {quotShipAmount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                          Shipping ({quotShipping === "truck" ? "Truck" : "Shipment"})
                        </span>
                        <span className="text-sm text-foreground tabular-nums" style={{ fontFamily: "var(--font-body)" }}>{"\u20B1"}{quotShipAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="h-px" style={{ backgroundColor: "var(--border)" }} />
                    <div className="flex justify-between items-baseline px-4 py-3 -mx-4" style={{ backgroundColor: "var(--background)", transition: "background-color 0.3s" }}>
                      <span className="text-xs uppercase tracking-[0.2em] font-[family-name:var(--font-display)] text-foreground">Total</span>
                      <span className="text-xl font-[family-name:var(--font-display)] text-foreground tabular-nums">{"\u20B1"}{quotTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 px-6 py-4" style={{ borderTop: "1px solid var(--border)" }}>
                <button
                  disabled={quotItems.length === 0 || quotSaving || !!quotSaved}
                  onClick={async () => {
                    if (quotItems.length === 0 || quotSaving) return;
                    setQuotSaving(true);
                    try {
                      const saved = await saveQuotation(
                        {
                          quotation_number: quotNumber,
                          opportunity_id: detailOpp?.id ?? null,
                          company_name: quotCompanyName,
                          contact_name: quotContactName || null,
                          deal_name: quotDealName || null,
                          quotation_date: quotDate,
                          notes: quotNotes || null,
                          shipping_method: quotShipping,
                          shipping_fee: quotShipAmount,
                          subtotal: quotSubtotal,
                          tax: quotTax,
                          total: quotTotal,
                          created_by: performedBy,
                          items: [],
                        },
                        quotItems.map((item) => ({
                          product_id: item.product_id,
                          product_name: item.product_name,
                          sku: item.sku,
                          category_name: item.category_name,
                          quantity: item.quantity,
                          price_per_kg: item.price_per_kg,
                          weight_per_piece: item.weight_per_piece,
                        })),
                      );
                      setQuotSaved(saved.quotation_number);
                      setTimeout(() => {
                        dismissQuotation();
                        setQuotSaved(null);
                        if (detailOpp) {
                          getQuotationsByOpportunity(detailOpp.id).then(setOppQuotations);
                        }
                      }, 1500);
                    } catch (err) {
                      console.error("Save quotation error:", err);
                    } finally {
                      setQuotSaving(false);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-[11px] uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: quotSaved ? "#22c55e" : "var(--btn-bg)",
                    color: quotSaved ? "#fff" : "var(--btn-text)",
                    fontFamily: "var(--font-body)",
                    transition: "background-color 0.3s",
                  }}
                  onMouseEnter={(e) => { if (!e.currentTarget.disabled && !quotSaved) e.currentTarget.style.backgroundColor = "var(--btn-hover)"; }}
                  onMouseLeave={(e) => { if (!quotSaved) e.currentTarget.style.backgroundColor = "var(--btn-bg)"; }}>
                  {icons.check} {quotSaving ? "Saving..." : quotSaved ? `Saved ${quotSaved}` : "Save Quotation"}
                </button>
                <div className="flex-1" />
                <button onClick={() => requestDismiss(dismissQuotation, isQuotDirty())}
                  className="px-5 py-2.5 text-[11px] uppercase tracking-wider cursor-pointer"
                  style={{ color: "var(--muted)", fontFamily: "var(--font-body)", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
         VIEW QUOTATION MODAL (read-only)
         ════════════════════════════════════════ */}
      {viewQuotation && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
          onClick={() => setViewQuotation(null)}>
          <div className="w-full max-w-5xl mx-4 max-h-[92vh] overflow-y-auto animate-fade-up"
            style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}
            onClick={(e) => e.stopPropagation()}>

            {/* ── Header ── */}
            <div style={{ backgroundColor: "var(--input-bg)", borderBottom: "1px solid var(--border)" }}>
              <div className="px-6 pt-5 pb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-[family-name:var(--font-display)] uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                      Quotation
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                        {viewQuotation.deal_name || "Untitled Deal"}
                      </p>
                      {(() => {
                        const sc = viewQuotation.status === "approved" ? "#22c55e" : viewQuotation.status === "rejected" ? "#ef4444" : "var(--muted)";
                        return (
                          <span className="text-[9px] px-2 py-0.5 uppercase tracking-widest"
                            style={{ backgroundColor: `${sc}15`, color: sc, border: `1px solid ${sc}40`, fontFamily: "var(--font-body)" }}>
                            {viewQuotation.status}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <button onClick={() => setViewQuotation(null)} className="cursor-pointer p-1" style={{ color: "var(--muted)", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
                    {icons.xLg}
                  </button>
                </div>

                <div className="h-[2px] mt-3 mb-4" style={{ backgroundColor: "var(--accent)" }} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Client Details */}
                  <div style={{ border: "1px solid var(--border)" }}>
                    <div className="px-4 py-2 text-[10px] uppercase tracking-[0.15em] font-medium"
                      style={{ backgroundColor: "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)" }}>
                      Client Details
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      {viewQuotation.company_name ? (
                        <div className="flex items-center gap-2 text-sm text-foreground" style={{ fontFamily: "var(--font-body)" }}>
                          {icons.company} <span className="font-medium">{viewQuotation.company_name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted" style={{ fontFamily: "var(--font-body)" }}>No company</span>
                      )}
                      {viewQuotation.contact_name ? (
                        <div className="flex items-center gap-2 text-sm text-foreground" style={{ fontFamily: "var(--font-body)" }}>
                          {icons.user} <span>{viewQuotation.contact_name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted" style={{ fontFamily: "var(--font-body)" }}>No contact</span>
                      )}
                    </div>
                  </div>

                  {/* Right: QT Info */}
                  <div className="flex flex-col items-end justify-center">
                    <table style={{ fontFamily: "var(--font-body)", borderCollapse: "collapse" }}>
                      <tbody>
                        <tr>
                          <td className="py-0.5 pr-6 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--foreground)" }}>QT Number:</td>
                          <td className="py-0.5 text-right text-sm font-[family-name:var(--font-display)] tracking-wide" style={{ color: "var(--foreground)" }}>{viewQuotation.quotation_number}</td>
                        </tr>
                        <tr>
                          <td className="py-0.5 pr-6 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--foreground)" }}>Date:</td>
                          <td className="py-0.5 text-right text-sm font-[family-name:var(--font-display)] tracking-wide" style={{ color: "var(--foreground)" }}>
                            {viewQuotation.quotation_date ? formatDate(viewQuotation.quotation_date) : "\u2014"}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-0.5 pr-6 text-right text-xs font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: "var(--foreground)" }}>Prepared By:</td>
                          <td className="py-0.5 text-right text-sm" style={{ color: "var(--foreground)" }}>{viewQuotation.created_by}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Line Items Table ── */}
            <div style={{ backgroundColor: "var(--input-bg)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["#", "Product", "Category", "Qty", "Wt/pc", "Price/pc", "Price/kg", "Weight", "Line Total"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {viewQuotation.items.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-5 py-14 text-center">
                          <span className="text-sm text-muted">No items in this quotation</span>
                        </td>
                      </tr>
                    ) : (
                      viewQuotation.items.map((item, i) => {
                        const weight = item.quantity * item.weight_per_piece;
                        const lineTotal = weight * item.price_per_kg;
                        return (
                          <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td className="px-5 py-3 text-muted">{i + 1}</td>
                            <td className="px-5 py-3 text-foreground whitespace-nowrap">
                              <span className="text-muted text-xs mr-1">{item.sku}</span> {item.product_name}
                            </td>
                            <td className="px-5 py-3 text-muted whitespace-nowrap">{item.category_name}</td>
                            <td className="px-5 py-3 text-foreground">{item.quantity.toLocaleString()}</td>
                            <td className="px-5 py-3 text-muted">{item.weight_per_piece.toLocaleString(undefined, { minimumFractionDigits: 2 })} kg</td>
                            <td className="px-5 py-3 text-muted">{"\u20B1"}{(item.weight_per_piece * item.price_per_kg).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="px-5 py-3 text-muted">{"\u20B1"}{item.price_per_kg.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="px-5 py-3 text-muted">{weight.toLocaleString(undefined, { minimumFractionDigits: 2 })} kg</td>
                            <td className="px-5 py-3 text-foreground font-medium">{"\u20B1"}{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Footer: Shipping + Notes + Approval Info + Totals ── */}
            <div style={{ backgroundColor: "var(--input-bg)", borderTop: "1px solid var(--border)" }}>
              <div className="flex flex-col lg:flex-row">
                {/* Left: Shipping, Notes, Approval/Rejection info */}
                <div className="flex-1 min-w-0 p-6" style={{ borderRight: "1px solid var(--border)" }}>
                  <div className="mb-4">
                    <span className="text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}>Shipping</span>
                    <p className="text-sm text-foreground mt-1" style={{ fontFamily: "var(--font-body)" }}>
                      {viewQuotation.shipping_method === "pickup" ? "Pickup" : viewQuotation.shipping_method === "truck" ? "Truck" : "Shipment"}
                      {viewQuotation.shipping_fee > 0 && ` — ${"\u20B1"}${viewQuotation.shipping_fee.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    </p>
                  </div>
                  {viewQuotation.notes && (
                    <div className="mb-4">
                      <span className="text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}>Notes</span>
                      <p className="text-sm text-foreground mt-1 whitespace-pre-wrap" style={{ fontFamily: "var(--font-body)" }}>{viewQuotation.notes}</p>
                    </div>
                  )}
                  {viewQuotation.status === "approved" && viewQuotation.approved_by && (
                    <div className="p-3 mt-2" style={{ borderLeft: "3px solid #22c55e", backgroundColor: "var(--background)" }}>
                      <div className="flex items-center gap-2 text-sm" style={{ color: "#22c55e", fontFamily: "var(--font-body)" }}>
                        {icons.check} <span className="font-medium">Approved</span>
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                        By {viewQuotation.approved_by} {viewQuotation.approved_at ? `on ${formatDate(viewQuotation.approved_at)}` : ""}
                      </p>
                      {viewQuotation.approval_notes && (
                        <p className="text-xs mt-1.5 text-foreground" style={{ fontFamily: "var(--font-body)" }}>
                          &ldquo;{viewQuotation.approval_notes}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                  {viewQuotation.status === "rejected" && (
                    <div className="p-3 mt-2" style={{ borderLeft: "3px solid #ef4444", backgroundColor: "var(--background)" }}>
                      <div className="flex items-center gap-2 text-sm" style={{ color: "#ef4444", fontFamily: "var(--font-body)" }}>
                        {icons.x} <span className="font-medium">Rejected</span>
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                        By {viewQuotation.rejected_by} {viewQuotation.rejected_at ? `on ${formatDate(viewQuotation.rejected_at)}` : ""}
                      </p>
                      {viewQuotation.rejection_notes && (
                        <p className="text-xs mt-1.5 text-foreground" style={{ fontFamily: "var(--font-body)" }}>
                          &ldquo;{viewQuotation.rejection_notes}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Totals */}
                <div className="lg:w-72 p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Subtotal</span>
                      <span className="text-sm text-foreground tabular-nums" style={{ fontFamily: "var(--font-body)" }}>{"\u20B1"}{viewQuotation.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Tax (12%)</span>
                      <span className="text-sm text-foreground tabular-nums" style={{ fontFamily: "var(--font-body)" }}>{"\u20B1"}{viewQuotation.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    {viewQuotation.shipping_fee > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                          Shipping ({viewQuotation.shipping_method === "truck" ? "Truck" : "Shipment"})
                        </span>
                        <span className="text-sm text-foreground tabular-nums" style={{ fontFamily: "var(--font-body)" }}>{"\u20B1"}{viewQuotation.shipping_fee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="h-px" style={{ backgroundColor: "var(--border)" }} />
                    <div className="flex justify-between items-baseline px-4 py-3 -mx-4" style={{ backgroundColor: "var(--background)", transition: "background-color 0.3s" }}>
                      <span className="text-xs uppercase tracking-[0.2em] font-[family-name:var(--font-display)] text-foreground">Total</span>
                      <span className="text-xl font-[family-name:var(--font-display)] text-foreground tabular-nums">{"\u20B1"}{viewQuotation.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center gap-3 px-6 py-4" style={{ borderTop: "1px solid var(--border)" }}>
                {viewQuotation.status === "draft" && (
                  <>
                    <button
                      onClick={() => { setApproveModalTarget(viewQuotation); setApproveNotes(""); }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-[11px] uppercase tracking-wider cursor-pointer"
                      style={{ backgroundColor: "#22c55e", color: "#fff", fontFamily: "var(--font-body)", transition: "opacity 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
                      {icons.check} Approve
                    </button>
                    <button
                      onClick={() => { setRejectModalTarget(viewQuotation); setRejectNotes(""); }}
                      className="px-5 py-2.5 text-[11px] uppercase tracking-wider cursor-pointer"
                      style={{ border: "1px solid var(--border)", color: "var(--muted)", fontFamily: "var(--font-body)", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}>
                      Reject
                    </button>
                  </>
                )}
                <div className="flex-1" />
                <button onClick={() => setViewQuotation(null)}
                  className="px-5 py-2.5 text-[11px] uppercase tracking-wider cursor-pointer"
                  style={{ color: "var(--muted)", fontFamily: "var(--font-body)", transition: "color 0.2s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
         QUOTATION — ADD ITEM MODAL
         ════════════════════════════════════════ */}
      {showQuotAddItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
          onClick={() => { qResetForm(); setShowQuotAddItem(false); }}>
          <div className="w-full max-w-4xl mx-4 animate-fade-up outline-none"
            style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", minHeight: "420px" }}
            onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                {icons.search}
                <span className="text-sm uppercase tracking-wider font-[family-name:var(--font-display)]" style={{ color: "var(--foreground)" }}>
                  {quotEditingKey !== null ? "Edit Item" : "Find Product"}
                </span>
              </div>
              <button onClick={() => { qResetForm(); setShowQuotAddItem(false); }} className="p-1 cursor-pointer"
                style={{ color: "var(--muted)", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
                {icons.xLg}
              </button>
            </div>

            {/* Category & cascading filters */}
            <div className="px-6 py-5">
              <div className="flex flex-wrap gap-3 items-end">
                {/* Category (searchable) */}
                <div ref={qCatRef} className="relative min-w-[200px] max-w-[280px]">
                  <label className="block text-[9px] uppercase tracking-[0.15em] mb-1.5" style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}>Category</label>
                  <div className="flex items-center gap-1.5 px-3 py-2.5"
                    style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)", transition: "border-color 0.2s" }}>
                    <input type="text"
                      value={qCatOpen ? qCatSearch : (qCatId ? quotCategories.find(([id]) => id === qCatId)?.[1] ?? "" : "")}
                      placeholder="Search..."
                      onChange={(e) => { setQCatSearch(e.target.value); setQCatHighlight(0); if (!qCatOpen) setQCatOpen(true); }}
                      onFocus={() => { setQCatOpen(true); setQCatSearch(""); setQCatHighlight(-1); }}
                      onKeyDown={(e) => {
                        if (!qCatOpen) return;
                        const fil = quotCategories.filter(([, name]) => name.toLowerCase().includes(qCatSearch.toLowerCase()));
                        if (e.key === "ArrowDown") { e.preventDefault(); setQCatHighlight((p) => Math.min(p + 1, fil.length - 1)); }
                        else if (e.key === "ArrowUp") { e.preventDefault(); setQCatHighlight((p) => Math.max(p - 1, 0)); }
                        else if (e.key === "Enter") { e.preventDefault(); const pick = qCatHighlight >= 0 && qCatHighlight < fil.length ? fil[qCatHighlight] : fil[0]; if (pick) { qHandleCatChange(pick[0]); setQCatSearch(""); setQCatOpen(false); setQCatHighlight(-1); } }
                        else if (e.key === "Escape") { setQCatOpen(false); setQCatHighlight(-1); }
                      }}
                      className="bg-transparent outline-none text-sm w-full"
                      style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }} />
                    {qCatId !== "" && (
                      <button onClick={(e) => { e.stopPropagation(); qHandleCatChange(""); setQCatSearch(""); setQCatOpen(false); }}
                        className="cursor-pointer p-0.5 shrink-0"
                        style={{ color: "var(--muted)", transition: "color 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
                        {icons.x}
                      </button>
                    )}
                  </div>
                  {qCatOpen && (
                    <div ref={qCatListRef} className="absolute z-50 left-0 right-0 mt-1 max-h-80 overflow-y-auto"
                      style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                      {quotCategories.filter(([, name]) => name.toLowerCase().includes(qCatSearch.toLowerCase())).map(([id, name], idx) => (
                        <div key={id} className="px-3 py-2.5 text-sm cursor-pointer"
                          style={{
                            color: idx === qCatHighlight || id === qCatId ? "var(--foreground)" : "var(--muted)",
                            backgroundColor: idx === qCatHighlight ? "var(--input-bg)" : "transparent",
                            borderLeft: id === qCatId ? "2px solid var(--accent)" : idx === qCatHighlight ? "2px solid var(--border)" : "2px solid transparent",
                            fontFamily: "var(--font-body)", transition: "background-color 0.15s",
                          }}
                          onMouseEnter={() => setQCatHighlight(idx)}
                          onClick={() => { qHandleCatChange(id); setQCatSearch(""); setQCatOpen(false); setQCatHighlight(-1); }}>
                          {name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {qCatId !== "" && qUniqueTypes.length > 1 && (
                  <div className="min-w-[140px] flex-1">
                    <label className="block text-[9px] uppercase tracking-[0.15em] mb-1.5" style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}>Type</label>
                    <select value={qProductType} onChange={(e) => qHandleTypeChange(e.target.value)} className="w-full px-3 py-2.5 text-sm cursor-pointer"
                      style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                      <option value="All">All Types</option>
                      {qUniqueTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                )}

                {qCatId !== "" && qUniqueSizes.length > 1 && (
                  <div className="min-w-[110px] flex-1">
                    <label className="block text-[9px] uppercase tracking-[0.15em] mb-1.5" style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}>Size</label>
                    <select value={qSize} onChange={(e) => qHandleSizeChange(e.target.value)} className="w-full px-3 py-2.5 text-sm cursor-pointer"
                      style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                      <option value="All">All</option>
                      {qUniqueSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {qCatId !== "" && qUniqueThicknesses.length > 1 && (
                  <div className="min-w-[110px] flex-1">
                    <label className="block text-[9px] uppercase tracking-[0.15em] mb-1.5" style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}>Thickness</label>
                    <select value={qThickness} onChange={(e) => qHandleThicknessChange(e.target.value)} className="w-full px-3 py-2.5 text-sm cursor-pointer"
                      style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                      <option value="All">All</option>
                      {qUniqueThicknesses.map((t) => <option key={t} value={t}>{t} mm</option>)}
                    </select>
                  </div>
                )}

                {qCatId !== "" && (
                  <div className="min-w-[180px] flex-1">
                    <label className="block text-[9px] uppercase tracking-[0.15em] mb-1.5" style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}>
                      Product
                      {qNarrowed.length > 0 && <span className="ml-1" style={{ color: "var(--accent)" }}>({qNarrowed.length})</span>}
                    </label>
                    <select value={qProductId} onChange={(e) => setQProductId(e.target.value ? Number(e.target.value) : "")} className="w-full px-3 py-2.5 text-sm cursor-pointer"
                      style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}>
                      <option value="">Select...</option>
                      {qNarrowed.map((p) => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Qty + Price (visible after product selected) */}
            {qProductId !== "" && (
              <div className="mx-6 mb-5 px-5 py-4 animate-fade-in" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 mb-3">
                  {qSelectedProduct && (
                    <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                      {qSelectedProduct.sku} — {qSelectedProduct.name}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.15em] mb-1.5" style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}>Quantity</label>
                    <input type="number" min={1} value={qQty} onChange={(e) => setQQty(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-3 py-2.5 text-sm outline-none"
                      style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)", transition: "border-color 0.2s" }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.15em] mb-1.5" style={{ fontFamily: "var(--font-body)", color: "var(--muted)" }}>Price/kg ({"\u20B1"})</label>
                    <input type="number" min={0} step={0.01} value={qPrice} onChange={(e) => setQPrice(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-3 py-2.5 text-sm outline-none"
                      style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)", transition: "border-color 0.2s" }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      placeholder="0.00" />
                  </div>
                </div>
                <div className="mt-4">
                  <button onClick={qHandleAddItem} disabled={!qProductId || !qQty || !qPrice}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)", transition: "background-color 0.2s" }}
                    onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "var(--btn-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--btn-bg)"; }}>
                    {quotEditingKey !== null ? <>{icons.check} Update</> : <>{icons.plus} Add</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DELETE DIALOG ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }} onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-sm mx-4 animate-fade-up" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5">
              <h3 className="font-[family-name:var(--font-display)] text-base uppercase tracking-wider text-foreground mb-2">Delete Deal</h3>
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

      <ConfirmModal
        open={!!rejectModalTarget}
        title="Reject Quotation"
        message={`Reject quotation ${rejectModalTarget?.quotation_number ?? ""}? This cannot be undone.`}
        confirmLabel="Reject"
        variant="danger"
        zIndex={70}
        onConfirm={async () => {
          if (!rejectModalTarget) return;
          const updated = await rejectQuotation(rejectModalTarget.id, performedBy, rejectNotes || undefined);
          if (updated) {
            setOppQuotations((prev) => prev.map((q) => q.id === rejectModalTarget.id ? updated : q));
            if (viewQuotation?.id === rejectModalTarget.id) setViewQuotation(updated);
          }
          setRejectModalTarget(null);
        }}
        onCancel={() => setRejectModalTarget(null)}
      >
        <div>
          <label className="block text-[10px] uppercase tracking-widest mb-1.5"
            style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
            Reason (optional)
          </label>
          <textarea value={rejectNotes} onChange={(e) => setRejectNotes(e.target.value)}
            rows={2} className="w-full px-3 py-2 text-sm outline-none resize-none"
            style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)",
              color: "var(--foreground)", fontFamily: "var(--font-body)" }}
            placeholder="Why is this quotation being rejected?" />
        </div>
      </ConfirmModal>

      <ConfirmModal
        open={!!approveModalTarget}
        title="Approve Quotation"
        message={`Approve quotation ${approveModalTarget?.quotation_number ?? ""}?`}
        confirmLabel="Approve"
        variant="warning"
        zIndex={70}
        onConfirm={async () => {
          if (!approveModalTarget) return;
          const updated = await approveQuotation(approveModalTarget.id, performedBy, approveNotes || undefined);
          if (updated) {
            setOppQuotations((prev) => prev.map((q) => q.id === approveModalTarget.id ? updated : q));
            if (viewQuotation?.id === approveModalTarget.id) setViewQuotation(updated);
          }
          setApproveModalTarget(null);
        }}
        onCancel={() => setApproveModalTarget(null)}
      >
        <div>
          <label className="block text-[10px] uppercase tracking-widest mb-1.5"
            style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
            Comment (optional)
          </label>
          <textarea value={approveNotes} onChange={(e) => setApproveNotes(e.target.value)}
            rows={2} className="w-full px-3 py-2 text-sm outline-none resize-none"
            style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)",
              color: "var(--foreground)", fontFamily: "var(--font-body)" }}
            placeholder="Add approval notes or conditions..." />
        </div>
      </ConfirmModal>

      {/* ════════════════════════════════════════
         MANAGE STAGES MODAL
         ════════════════════════════════════════ */}
      {showManageStages && (
        <div className="fixed inset-0 z-50 flex justify-end" style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)" }} onClick={() => setShowManageStages(false)}>
          <div className="w-full max-w-md h-full overflow-y-auto"
            style={{ backgroundColor: "var(--background)", borderLeft: "1px solid var(--border)", boxShadow: "-8px 0 30px rgba(0,0,0,0.2)", animation: "slideInRight 0.3s ease-out" }}
            onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between sticky top-0 z-10"
              style={{ backgroundColor: "var(--background)", borderBottom: "1px solid var(--border)" }}>
              <h3 className="font-[family-name:var(--font-display)] text-base uppercase tracking-wider text-foreground">Manage Stages</h3>
              <button onClick={() => setShowManageStages(false)} className="cursor-pointer p-1" style={{ color: "var(--muted)", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")} onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
                {icons.xLg}
              </button>
            </div>

            {/* Stage list */}
            <div className="px-6 py-5 space-y-3">
              {editStages.map((st, idx) => {
                const usedCount = opportunities.filter((o) => o.stage === st.key).length;
                return (
                  <div key={st.key + idx} className="p-3 space-y-2"
                    style={{ border: "1px solid var(--border)", backgroundColor: "var(--input-bg)" }}>
                    <div className="flex items-center gap-2">
                      {/* Color picker */}
                      <div className="relative group">
                        <button className="w-6 h-6 rounded-full cursor-pointer border-2 shrink-0"
                          style={{ backgroundColor: st.color, borderColor: "var(--border)" }}
                          onClick={(e) => {
                            const popup = e.currentTarget.nextElementSibling as HTMLElement;
                            if (popup) popup.style.display = popup.style.display === "flex" ? "none" : "flex";
                          }} />
                        <div className="absolute top-8 left-0 z-20 gap-1 p-2 flex-wrap" style={{ display: "none", backgroundColor: "var(--background)", border: "1px solid var(--border)", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", width: 140 }}>
                          {["#6b7280","#3b82f6","#f59e0b","#8b5cf6","#22c55e","#ef4444","#ec4899","#14b8a6","#f97316","#6366f1"].map((c) => (
                            <button key={c} className="w-5 h-5 rounded-full cursor-pointer shrink-0"
                              style={{ backgroundColor: c, border: st.color === c ? "2px solid var(--foreground)" : "2px solid transparent" }}
                              onClick={(e) => {
                                const updated = [...editStages];
                                updated[idx] = { ...updated[idx], color: c };
                                setEditStages(updated);
                                const popup = (e.currentTarget.parentElement as HTMLElement);
                                if (popup) popup.style.display = "none";
                              }} />
                          ))}
                        </div>
                      </div>
                      {/* Label input */}
                      <input type="text" value={st.label}
                        onChange={(e) => {
                          const updated = [...editStages];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          setEditStages(updated);
                        }}
                        className="flex-1 px-2 py-1 text-sm outline-none"
                        style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-body)" }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")} onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                      {/* Reorder buttons */}
                      <div className="flex flex-col gap-0.5">
                        <button disabled={idx === 0}
                          className="cursor-pointer p-0.5 disabled:opacity-20"
                          style={{ color: "var(--muted)", transition: "color 0.2s" }}
                          onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.color = "var(--foreground)"; }}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                          onClick={() => {
                            const updated = [...editStages];
                            [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
                            setEditStages(updated);
                          }}>
                          {icons.arrowUp}
                        </button>
                        <button disabled={idx === editStages.length - 1}
                          className="cursor-pointer p-0.5 disabled:opacity-20"
                          style={{ color: "var(--muted)", transition: "color 0.2s" }}
                          onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.color = "var(--foreground)"; }}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                          onClick={() => {
                            const updated = [...editStages];
                            [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
                            setEditStages(updated);
                          }}>
                          {icons.arrowDown}
                        </button>
                      </div>
                      {/* Delete button */}
                      <button
                        disabled={usedCount > 0}
                        title={usedCount > 0 ? `${usedCount} deal(s) use this stage` : "Delete stage"}
                        className="cursor-pointer p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ color: "var(--muted)", transition: "color 0.2s" }}
                        onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.color = "#ef4444"; }}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                        onClick={() => {
                          setEditStages(editStages.filter((_, i) => i !== idx));
                        }}>
                        {icons.trash}
                      </button>
                    </div>
                    {/* Key display */}
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase tracking-widest" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Key: {st.key}</span>
                      {usedCount > 0 && (
                        <span className="text-[9px] px-1.5 py-0.5" style={{ backgroundColor: `${st.color}15`, color: st.color, border: `1px solid ${st.color}30`, fontFamily: "var(--font-body)" }}>
                          {usedCount} deal{usedCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add new stage */}
              <button
                onClick={() => {
                  const num = editStages.length + 1;
                  const newKey = `stage_${num}_${Date.now()}`;
                  setEditStages([...editStages, { key: newKey, label: `Stage ${num}`, color: "#6b7280" }]);
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{ border: "1px dashed var(--border)", backgroundColor: "var(--background)", color: "var(--muted)", fontFamily: "var(--font-body)", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--foreground)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}>
                {icons.plus} Add Stage
              </button>

              {/* Reset to defaults */}
              <button
                onClick={() => setEditStages(DEFAULT_STAGES.map(s => ({ ...s })))}
                className="w-full px-3 py-2 text-[10px] uppercase tracking-wider cursor-pointer"
                style={{ color: "var(--muted)", fontFamily: "var(--font-body)", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}>
                Reset to Defaults
              </button>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex items-center justify-end gap-3 sticky bottom-0"
              style={{ backgroundColor: "var(--background)", borderTop: "1px solid var(--border)" }}>
              <button onClick={() => setShowManageStages(false)}
                className="px-4 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-body)", transition: "background-color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--row-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--background)")}>
                Cancel
              </button>
              <button
                onClick={() => {
                  // Validate: must have at least 1 stage, all labels non-empty
                  if (editStages.length === 0) return;
                  if (editStages.some(s => !s.label.trim())) return;
                  writeCustomStages(editStages);
                  setStages(editStages);
                  setShowManageStages(false);
                }}
                disabled={editStages.length === 0 || editStages.some(s => !s.label.trim())}
                className="px-4 py-2 text-[11px] uppercase tracking-wider cursor-pointer"
                style={{ backgroundColor: "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)", opacity: editStages.length === 0 || editStages.some(s => !s.label.trim()) ? 0.5 : 1, transition: "background-color 0.3s, opacity 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-bg)")}>
                Save Stages
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
