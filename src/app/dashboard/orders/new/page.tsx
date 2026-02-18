"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getClients,
  getProductsForOrder,
  getNextOrderNumber,
  getMarketPrices,
  createOrder,
  getClientWarehouses,
  createClientWarehouse,
} from "@/lib/queries";
import {
  getDrafts,
  getDraftById,
  saveDraft,
  deleteDraft,
  generateDraftId,
  type OrderDraft,
} from "@/lib/orderDrafts";
import ConfirmModal from "@/app/components/ConfirmModal";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import { useAuth } from "@/app/context/AuthContext";

type Client = { id: number; name: string; contact_person: string | null; phone: string | null; email: string | null; address: string | null; city: string | null };
type ClientWarehouse = { id: number; client_id: number; name: string; address: string | null; city: string | null; contact_person: string | null; phone: string | null; is_default: boolean };
type Product = {
  id: number; sku: string; name: string;
  category_id: number; category_name: string;
  weight_per_piece: number;
  size: string; thickness: string;
};
type LineItem = {
  key: number;
  product_id: number;
  product_name: string;
  sku: string;
  category_name: string;
  quantity: number;
  price_per_kg: number;
  weight_per_piece: number;
};

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

export default function NewOrderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted uppercase tracking-widest animate-pulse">Loading...</p>
      </div>
    }>
      <NewOrderForm />
    </Suspense>
  );
}

function NewOrderForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const resumeDraftId = searchParams.get("draft") ?? "";
  const [orderNumber, setOrderNumber] = useState("");
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [salesperson, setSalesperson] = useState("");
  const [notes, setNotes] = useState("");
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "truck" | "shipment">("pickup");
  const [shippingFee, setShippingFee] = useState<number | "">(0);

  // Client
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | "">("");

  // Client Warehouses (Ship To)
  const [clientWarehouses, setClientWarehouses] = useState<ClientWarehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | "">("");
  const [showNewWarehouse, setShowNewWarehouse] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({ name: "", address: "", city: "", contact_person: "", phone: "" });
  const [savingWarehouse, setSavingWarehouse] = useState(false);

  // Products
  const [products, setProducts] = useState<Product[]>([]);
  const [marketPrices, setMarketPrices] = useState<Record<number, number>>({});

  // Line item form — filters
  const [selCategoryId, setSelCategoryId] = useState<number | "">("");
  const [selProductType, setSelProductType] = useState("All");
  const [selSize, setSelSize] = useState("All");
  const [selThickness, setSelThickness] = useState("All");
  const [selProductId, setSelProductId] = useState<number | "">("");
  const [selQuantity, setSelQuantity] = useState<number | "">("");
  const [selPrice, setSelPrice] = useState<number | "">("");

  // Line items
  const [items, setItems] = useState<LineItem[]>([]);
  const [itemKey, setItemKey] = useState(0);
  const [editingKey, setEditingKey] = useState<number | null>(null);

  // Category search dropdown
  const [catSearch, setCatSearch] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const [catHighlight, setCatHighlight] = useState(-1);
  const catRef = useRef<HTMLDivElement>(null);
  const catListRef = useRef<HTMLDivElement>(null);

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setSalesperson(user.user_metadata.full_name);
    }
  }, [user]);

  // Fetch warehouses when client changes
  useEffect(() => {
    if (!selectedClientId) {
      setClientWarehouses([]);
      setSelectedWarehouseId("");
      setShowNewWarehouse(false);
      return;
    }
    getClientWarehouses(selectedClientId as number).then((wh) => {
      const warehouses = wh as ClientWarehouse[];
      setClientWarehouses(warehouses);
      // Auto-select: if only one warehouse, or if there's a default, pick it
      if (warehouses.length === 1) {
        setSelectedWarehouseId(warehouses[0].id);
      } else {
        const defaultWh = warehouses.find((w) => w.is_default);
        setSelectedWarehouseId(defaultWh ? defaultWh.id : "");
      }
      setShowNewWarehouse(false);
    }).catch(() => {
      setClientWarehouses([]);
      setSelectedWarehouseId("");
    });
  }, [selectedClientId]);

  useEffect(() => {
    Promise.all([
      getClients(),
      getProductsForOrder(),
      getNextOrderNumber(),
      getMarketPrices(),
    ]).then(([c, pData, orderNum, prices]) => {
      setClients(c as Client[]);
      setProducts(pData.products);
      setOrderNumber(orderNum);

      const priceMap: Record<number, number> = {};
      for (const p of prices) {
        if (p.category_id && p.price_per_kg) {
          priceMap[p.category_id] = Number(p.price_per_kg);
        }
      }
      setMarketPrices(priceMap);

      // Resume draft
      if (resumeDraftId) {
        const draft = getDraftById(resumeDraftId);
        if (draft) {
          setOrderDate(draft.orderDate);
          setSalesperson(draft.salesperson);
          setNotes(draft.notes);
          setSelectedClientId(draft.selectedClientId);
          if (draft.selectedWarehouseId) {
            setSelectedWarehouseId(draft.selectedWarehouseId);
          }
          // Map old draft items to new shape
          setItems(draft.items.map((i) => ({
            key: i.key,
            product_id: i.product_id,
            product_name: i.product_name,
            sku: i.sku,
            category_name: "",
            quantity: i.quantity,
            price_per_kg: i.price_per_kg,
            weight_per_piece: i.weight_per_piece,
          })));
          setItemKey(draft.itemKey);
        }
      }

      setLoading(false);
    }).catch((err) => {
      console.error("New order load error:", err);
      setLoading(false);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Close category dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Derived: categories list ──
  const categories = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of products) {
      if (!map.has(p.category_id)) map.set(p.category_id, p.category_name);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [products]);

  // ── Cascading filter pipeline ──
  const filteredByCategory = useMemo(() => {
    if (!selCategoryId) return [];
    return products.filter((p) => p.category_id === selCategoryId);
  }, [products, selCategoryId]);

  const uniqueProductTypes = useMemo(() => {
    return [...new Set(filteredByCategory.map((p) => p.name))].sort();
  }, [filteredByCategory]);

  const filteredByType = useMemo(() => {
    if (selProductType === "All") return filteredByCategory;
    return filteredByCategory.filter((p) => p.name === selProductType);
  }, [filteredByCategory, selProductType]);

  const uniqueSizes = useMemo(() => {
    const sizes = [...new Set(filteredByType.map((p) => p.size).filter((s) => s !== "—"))];
    sizes.sort((a, b) => {
      const na = parseFloat(a);
      const nb = parseFloat(b);
      return isNaN(na) || isNaN(nb) ? a.localeCompare(b) : na - nb;
    });
    return sizes;
  }, [filteredByType]);

  const filteredBySize = useMemo(() => {
    if (selSize === "All") return filteredByType;
    return filteredByType.filter((p) => p.size === selSize);
  }, [filteredByType, selSize]);

  const uniqueThicknesses = useMemo(() => {
    const thk = [...new Set(filteredBySize.map((p) => p.thickness).filter((t) => t !== "—"))];
    thk.sort((a, b) => parseFloat(a) - parseFloat(b));
    return thk;
  }, [filteredBySize]);

  const filteredByThickness = useMemo(() => {
    if (selThickness === "All") return filteredBySize;
    return filteredBySize.filter((p) => p.thickness === selThickness);
  }, [filteredBySize, selThickness]);

  const narrowedProducts = filteredByThickness;

  // Auto-select product if filters narrow to exactly 1
  useEffect(() => {
    if (narrowedProducts.length === 1) {
      setSelProductId(narrowedProducts[0].id);
    } else if (selProductId && !narrowedProducts.find((p) => p.id === selProductId)) {
      setSelProductId("");
    }
  }, [narrowedProducts]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedProduct = useMemo(() => {
    if (!selProductId) return null;
    return products.find((p) => p.id === selProductId) ?? null;
  }, [products, selProductId]);

  // Auto-fill price when category changes
  useEffect(() => {
    if (selCategoryId && marketPrices[selCategoryId as number]) {
      setSelPrice(marketPrices[selCategoryId as number]);
    } else {
      setSelPrice("");
    }
  }, [selCategoryId, marketPrices]);

  // ── Reset cascade handlers ──
  function handleCategoryChange(val: number | "") {
    setSelCategoryId(val);
    setSelProductType("All");
    setSelSize("All");
    setSelThickness("All");
    setSelProductId("");
    setSelQuantity("");
  }

  function handleProductTypeChange(val: string) {
    setSelProductType(val);
    setSelSize("All");
    setSelThickness("All");
    setSelProductId("");
    setSelQuantity("");
  }

  function handleSizeChange(val: string) {
    setSelSize(val);
    setSelThickness("All");
    setSelProductId("");
    setSelQuantity("");
  }

  function handleThicknessChange(val: string) {
    setSelThickness(val);
    setSelProductId("");
    setSelQuantity("");
  }

  // Totals
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.quantity * i.weight_per_piece * i.price_per_kg, 0),
    [items]
  );
  const tax = Math.round(subtotal * 0.12 * 100) / 100;
  const shippingAmount = shippingMethod === "pickup" ? 0 : Number(shippingFee) || 0;
  const total = subtotal + tax + shippingAmount;

  function resetModalForm() {
    setSelCategoryId("");
    setSelProductType("All");
    setSelSize("All");
    setSelThickness("All");
    setSelProductId("");
    setSelQuantity("");
    setSelPrice("");
    setCatSearch("");
    setCatOpen(false);
    setEditingKey(null);
  }

  function handleAddItem() {
    if (!selProductId || !selQuantity || !selPrice) return;
    const product = products.find((p) => p.id === selProductId)!;

    const newItem: LineItem = {
      key: editingKey !== null ? editingKey : itemKey,
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      category_name: product.category_name,
      quantity: Number(selQuantity),
      price_per_kg: Number(selPrice),
      weight_per_piece: product.weight_per_piece,
    };

    if (editingKey !== null) {
      setItems((prev) => prev.map((i) => (i.key === editingKey ? newItem : i)));
    } else {
      setItems((prev) => [...prev, newItem]);
      setItemKey((k) => k + 1);
    }

    resetModalForm();
    setShowAddItemModal(false);
  }

  function handleEditItem(key: number) {
    const item = items.find((i) => i.key === key);
    if (!item) return;

    const product = products.find((p) => p.id === item.product_id);
    if (product) {
      setSelCategoryId(product.category_id);
      setSelProductType(product.name);
      setSelSize(product.size !== "—" ? product.size : "All");
      setSelThickness(product.thickness !== "—" ? product.thickness : "All");
      setSelProductId(product.id);
    }

    setSelQuantity(item.quantity);
    setSelPrice(item.price_per_kg);
    setEditingKey(key);
    setShowAddItemModal(true);
  }

  function handleCloseAddItemModal() {
    resetModalForm();
    setShowAddItemModal(false);
  }

  function handleRemoveItem(key: number) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function handleSaveDraft() {
    if (items.length === 0) {
      setError("Add at least one item before saving a draft.");
      return;
    }
    setError("");

    const draftId = resumeDraftId || generateDraftId(getDrafts());
    const resolvedClientName = clients.find((c) => c.id === selectedClientId)?.name ?? "";
    const draft: OrderDraft = {
      draftId,
      savedAt: new Date().toISOString(),
      orderDate,
      salesperson,
      notes,
      clientMode: "select",
      selectedClientId,
      selectedWarehouseId: selectedWarehouseId || undefined,
      newClient: { name: "", contact_person: "", phone: "", city: "" },
      clientName: resolvedClientName,
      items: items.map((i) => ({
        ...i,
        warehouse_id: 0,
        warehouse_name: "",
        classification: "c1",
      })),
      itemKey,
    };
    saveDraft(draft);
    router.push("/dashboard/orders");
  }

  async function handleSubmit() {
    setError("");
    if (!salesperson.trim()) { setError("Salesperson name is required."); return; }
    if (items.length === 0) { setError("Add at least one item."); return; }

    if (!selectedClientId) { setError("Select a client."); return; }
    const clientId = selectedClientId as number;

    setSubmitting(true);
    try {
      const createdByName = user?.user_metadata?.full_name || user?.email || "Unknown";
      await createOrder({
        orderNumber,
        clientId,
        salesperson: salesperson.trim(),
        notes: notes.trim(),
        createdBy: createdByName,
        clientWarehouseId: selectedWarehouseId ? (selectedWarehouseId as number) : null,
        items: items.map((i) => ({
          product_id: i.product_id,
          warehouse_id: 0,
          classification: "c1",
          quantity: i.quantity,
          price_per_kg: i.price_per_kg,
          weight_per_piece: i.weight_per_piece,
        })),
      });
      if (resumeDraftId) deleteDraft(resumeDraftId);
      router.push("/dashboard/orders");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create order";
      setError(msg);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-0">
      <LoadingOverlay open={loading} message="Loading" />

      {/* ── BACK BUTTON ── */}
      <div className="mb-3">
        <button
          onClick={() => items.length > 0 ? setShowCancelModal(true) : router.push("/dashboard/orders")}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest cursor-pointer group"
          style={{ fontFamily: "var(--font-body)", color: "var(--muted)", transition: "color 0.2s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s ease" }} className="group-hover:-translate-x-0.5">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Orders
        </button>
      </div>

      {/* ── PO HEADER ── */}
      <div
        className="animate-fade-up"
        style={{ backgroundColor: "var(--input-bg)", borderBottom: "1px solid var(--border)", transition: "background-color 0.4s ease" }}
      >
        {/* Row 1: Company info (left) + PO title & details (right) */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5">
          {/* Company / Logo */}
          <div className="flex items-start gap-3">
            <img src="/regan-logo.png" alt="Regan" className="h-12 w-auto object-contain opacity-90" />
            <div>
              <div className="text-sm font-medium text-foreground" style={{ fontFamily: "var(--font-body)" }}>Regan Industrial Sales</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Steel &amp; Metal Products</div>
            </div>
          </div>

          {/* PO Title + Details */}
          <div className="text-right">
            <h1 className="text-2xl font-[family-name:var(--font-display)] tracking-wider" style={{ color: "var(--foreground)" }}>PURCHASE ORDER</h1>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-end gap-3">
                <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>PO No:</span>
                <span className="text-sm font-[family-name:var(--font-display)] tracking-wide text-foreground min-w-[100px] text-right">{orderNumber}</span>
              </div>
              <div className="flex items-center justify-end gap-3">
                <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>PO Date:</span>
                <label className="relative cursor-pointer min-w-[100px] text-right">
                  <span className="text-sm font-[family-name:var(--font-display)] tracking-wide text-foreground">
                    {orderDate ? new Date(orderDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "\u2014"}
                  </span>
                  <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" style={{ width: "100%", height: "100%" }} />
                </label>
              </div>
              <div className="flex items-center justify-end gap-3">
                <span className="text-[10px] uppercase tracking-[0.15em]" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Salesperson:</span>
                <span className="text-sm text-foreground min-w-[100px] text-right" style={{ fontFamily: "var(--font-body)" }}>{salesperson || "\u2014"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Client card (left) + Ship To card (right) */}
        <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ── CLIENT CARD ── */}
          <div style={{ border: "1px solid var(--border)" }}>
            <div
              className="px-4 py-2.5 text-xs uppercase tracking-[0.15em] font-medium"
              style={{ backgroundColor: "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)" }}
            >
              Supplier/Vendor
            </div>
            <div className="px-4 py-3">
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : "")}
                className="w-full py-2 text-sm cursor-pointer outline-none px-2"
                style={{
                  color: "var(--foreground)",
                  fontFamily: "var(--font-body)",
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                }}
              >
                <option value="">Select a client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{c.city ? ` — ${c.city}` : ""}</option>
                ))}
              </select>
              {selectedClientId && (() => {
                const client = clients.find((c) => c.id === selectedClientId);
                if (!client) return null;
                return (
                  <div className="mt-3 text-sm space-y-0.5 animate-fade-in" style={{ fontFamily: "var(--font-body)" }}>
                    <div className="text-foreground font-medium">{client.name}</div>
                    {client.contact_person && <div className="text-foreground">{client.contact_person}</div>}
                    {client.address && <div style={{ color: "var(--muted)" }}>{client.address}</div>}
                    {client.city && <div style={{ color: "var(--muted)" }}>{client.city}</div>}
                    {client.phone && <div style={{ color: "var(--muted)" }}>Phone: {client.phone}</div>}
                    {client.email && <div style={{ color: "var(--muted)" }}>{client.email}</div>}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ── SHIP TO CARD ── */}
          <div style={{ border: "1px solid var(--border)" }}>
            <div
              className="px-4 py-2.5 text-xs uppercase tracking-[0.15em] font-medium"
              style={{ backgroundColor: "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)" }}
            >
              Ship to
            </div>
            <div className="px-4 py-3">
              {!selectedClientId ? (
                <div className="py-4 text-center">
                  <span className="text-xs uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                    Select a client first
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedWarehouseId}
                      onChange={(e) => { setSelectedWarehouseId(e.target.value ? Number(e.target.value) : ""); setShowNewWarehouse(false); }}
                      className="flex-1 py-2 text-sm cursor-pointer outline-none px-2"
                      style={{
                        color: "var(--foreground)",
                        fontFamily: "var(--font-body)",
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <option value="">Select destination...</option>
                      {clientWarehouses.map((wh) => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name}{wh.city ? ` — ${wh.city}` : ""}{wh.is_default ? " (Default)" : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => { setShowNewWarehouse(!showNewWarehouse); setNewWarehouse({ name: "", address: "", city: "", contact_person: "", phone: "" }); }}
                      className="shrink-0 inline-flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-wider cursor-pointer"
                      style={{
                        border: "1px solid var(--border)",
                        color: "var(--muted)",
                        fontFamily: "var(--font-body)",
                        transition: "color 0.2s ease, border-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--foreground)"; e.currentTarget.style.borderColor = "var(--foreground)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      New
                    </button>
                  </div>

                  {/* Selected warehouse details */}
                  {selectedWarehouseId && !showNewWarehouse && (() => {
                    const wh = clientWarehouses.find((w) => w.id === selectedWarehouseId);
                    if (!wh) return null;
                    return (
                      <div className="mt-3 text-sm space-y-0.5 animate-fade-in" style={{ fontFamily: "var(--font-body)" }}>
                        <div className="text-foreground font-medium">{wh.name}</div>
                        {wh.address && <div style={{ color: "var(--muted)" }}>{wh.address}</div>}
                        {wh.city && <div style={{ color: "var(--muted)" }}>{wh.city}</div>}
                        {wh.contact_person && <div style={{ color: "var(--muted)" }}>Contact: {wh.contact_person}</div>}
                        {wh.phone && <div style={{ color: "var(--muted)" }}>Phone: {wh.phone}</div>}
                      </div>
                    );
                  })()}

                  {/* Inline new warehouse form */}
                  {showNewWarehouse && (
                    <div className="mt-3 p-3 space-y-2 animate-fade-in" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}>
                      <div className="text-[9px] uppercase tracking-[0.15em] mb-1" style={labelStyle}>New Warehouse</div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Warehouse name *"
                          value={newWarehouse.name}
                          onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                          className="col-span-2 px-2.5 py-2 text-sm"
                          style={inputStyle}
                        />
                        <input
                          type="text"
                          placeholder="Address"
                          value={newWarehouse.address}
                          onChange={(e) => setNewWarehouse({ ...newWarehouse, address: e.target.value })}
                          className="col-span-2 px-2.5 py-2 text-sm"
                          style={inputStyle}
                        />
                        <input
                          type="text"
                          placeholder="City"
                          value={newWarehouse.city}
                          onChange={(e) => setNewWarehouse({ ...newWarehouse, city: e.target.value })}
                          className="px-2.5 py-2 text-sm"
                          style={inputStyle}
                        />
                        <input
                          type="text"
                          placeholder="Contact person"
                          value={newWarehouse.contact_person}
                          onChange={(e) => setNewWarehouse({ ...newWarehouse, contact_person: e.target.value })}
                          className="px-2.5 py-2 text-sm"
                          style={inputStyle}
                        />
                        <input
                          type="text"
                          placeholder="Phone"
                          value={newWarehouse.phone}
                          onChange={(e) => setNewWarehouse({ ...newWarehouse, phone: e.target.value })}
                          className="px-2.5 py-2 text-sm"
                          style={inputStyle}
                        />
                        <div className="flex items-end gap-2">
                          <button
                            type="button"
                            disabled={!newWarehouse.name.trim() || savingWarehouse}
                            onClick={async () => {
                              setSavingWarehouse(true);
                              try {
                                const createdByName = user?.user_metadata?.full_name || user?.email || "Unknown";
                                const created = await createClientWarehouse({
                                  client_id: selectedClientId as number,
                                  name: newWarehouse.name.trim(),
                                  address: newWarehouse.address.trim() || undefined,
                                  city: newWarehouse.city.trim() || undefined,
                                  contact_person: newWarehouse.contact_person.trim() || undefined,
                                  phone: newWarehouse.phone.trim() || undefined,
                                  created_by: createdByName,
                                });
                                const wh = created as ClientWarehouse;
                                setClientWarehouses((prev) => [...prev, wh]);
                                setSelectedWarehouseId(wh.id);
                                setShowNewWarehouse(false);
                                setNewWarehouse({ name: "", address: "", city: "", contact_person: "", phone: "" });
                              } catch (err) {
                                console.error("Failed to create warehouse:", err);
                              } finally {
                                setSavingWarehouse(false);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-3 py-2 text-xs uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{ backgroundColor: "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)" }}
                          >
                            {savingWarehouse ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowNewWarehouse(false)}
                            className="px-3 py-2 text-xs uppercase tracking-wider cursor-pointer"
                            style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 3: LINE ITEMS ── */}
      <div
        className="animate-fade-up delay-200"
        style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
      >
        {/* Add Items Button */}
        <div className="px-6 py-5">
          <button
            onClick={() => setShowAddItemModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm uppercase tracking-wider cursor-pointer"
            style={{ backgroundColor: "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)", transition: "background-color 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--btn-bg)")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Items
          </button>
        </div>

        {/* Items table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["#", "Product", "Category", "Qty", "Price/kg", "Weight", "Line Total", ""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--border)" }}>
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" />
                      </svg>
                      <span className="text-sm text-muted">No items added yet</span>
                      <span className="text-xs text-muted opacity-60">Click &quot;Add Items&quot; to start building your inquiry</span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, i) => {
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
                      <td className="px-5 py-3 text-muted">{"\u20B1"}{item.price_per_kg.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-5 py-3 text-muted">{weight.toLocaleString(undefined, { minimumFractionDigits: 2 })} kg</td>
                      <td className="px-5 py-3 text-foreground font-medium">{"\u20B1"}{lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEditItem(item.key)}
                            className="text-xs uppercase tracking-wider cursor-pointer"
                            style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.key)}
                            className="text-xs uppercase tracking-wider cursor-pointer"
                            style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
                          >
                            Remove
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
      </div>

      {/* ── ROW 4: FOOTER ── */}
      <div
        className="animate-fade-up delay-400"
        style={{ backgroundColor: "var(--input-bg)", borderTop: "1px solid var(--border)", transition: "background-color 0.4s ease" }}
      >
        <div className="flex flex-col lg:flex-row">
          {/* Notes + Shipping */}
          <div className="flex-1 min-w-0 p-6" style={{ borderRight: "1px solid var(--border)" }}>
            {/* Shipping */}
            <label className="block text-[10px] uppercase tracking-[0.2em] mb-2" style={labelStyle}>Shipping</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {([
                { value: "pickup", label: "Pickup", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" },
                { value: "truck", label: "Truck", icon: "M1 3h15v13H1zM16 8h4l3 3v5h-7V8zM5.5 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" },
                { value: "shipment", label: "Shipment", icon: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setShippingMethod(opt.value); if (opt.value === "pickup") setShippingFee(0); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs uppercase tracking-wider cursor-pointer"
                  style={{
                    border: shippingMethod === opt.value ? "2px solid var(--foreground)" : "1px solid var(--border)",
                    backgroundColor: shippingMethod === opt.value ? "var(--background)" : "transparent",
                    color: shippingMethod === opt.value ? "var(--foreground)" : "var(--muted)",
                    fontFamily: "var(--font-body)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={opt.icon} />
                  </svg>
                  {opt.label}
                </button>
              ))}
            </div>

            {shippingMethod !== "pickup" && (
              <div className="mb-4 max-w-[200px] animate-fade-in">
                <label className="block text-[9px] uppercase tracking-[0.15em] mb-1.5" style={labelStyle}>Shipping Fee ({"\u20B1"})</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2.5 text-sm"
                  style={inputStyle}
                  placeholder="0.00"
                />
              </div>
            )}

            {/* Notes */}
            <label className="block text-[10px] uppercase tracking-[0.2em] mb-2" style={labelStyle}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm resize-none"
              style={inputStyle}
              placeholder="Delivery instructions, special requests..."
            />
          </div>

          {/* Totals */}
          <div className="lg:w-80 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Subtotal</span>
                <span className="text-sm text-foreground tabular-nums" style={{ fontFamily: "var(--font-body)" }}>{"\u20B1"}{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>Tax (12%)</span>
                <span className="text-sm text-foreground tabular-nums" style={{ fontFamily: "var(--font-body)" }}>{"\u20B1"}{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {shippingAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                    Shipping ({shippingMethod === "truck" ? "Truck" : "Shipment"})
                  </span>
                  <span className="text-sm text-foreground tabular-nums" style={{ fontFamily: "var(--font-body)" }}>{"\u20B1"}{shippingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="h-px" style={{ backgroundColor: "var(--border)" }} />
              <div className="flex justify-between items-baseline px-4 py-3 -mx-4" style={{ backgroundColor: "var(--background)", transition: "background-color 0.3s ease" }}>
                <span className="text-xs uppercase tracking-[0.2em] font-[family-name:var(--font-display)] text-foreground">Total</span>
                <span className="text-xl font-[family-name:var(--font-display)] text-foreground tabular-nums">{"\u20B1"}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="px-6 pb-3">
            <p className="text-sm px-3 py-2" style={{ color: "var(--error)", backgroundColor: "rgba(139,50,50,0.08)" }}>{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3 px-6 py-4" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-7 py-3 text-sm uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)", transition: "background-color 0.2s ease" }}
            onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = "var(--btn-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--btn-bg)"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            {submitting ? "Submitting..." : "Submit for Approval"}
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--draft)", color: "#fff", fontFamily: "var(--font-body)", transition: "background-color 0.2s ease" }}
            onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = "var(--draft-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--draft)"; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
            </svg>
            Save Draft
          </button>
          <div className="flex-1" />
          <button
            onClick={() => items.length > 0 ? setShowCancelModal(true) : router.push("/dashboard/orders")}
            className="px-6 py-3 text-sm uppercase tracking-wider cursor-pointer"
            style={{ color: "var(--muted)", fontFamily: "var(--font-body)", transition: "color 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            Cancel
          </button>
        </div>
      </div>

      <ConfirmModal
        open={showCancelModal}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to leave? All items and form data will be lost."
        confirmLabel="Discard"
        cancelLabel="Go Back"
        variant="danger"
        onConfirm={() => router.push("/dashboard/orders")}
        onCancel={() => setShowCancelModal(false)}
      />

      {/* ── Add Item Modal ── */}
      {showAddItemModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(2px)" }}
          onClick={handleCloseAddItemModal}
        >
          <div
            className="w-full max-w-4xl mx-4 animate-fade-up outline-none"
            style={{ backgroundColor: "var(--input-bg)", border: "1px solid var(--border)", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)", minHeight: "420px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted)" }}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="text-sm uppercase tracking-wider font-[family-name:var(--font-display)]" style={{ color: "var(--foreground)" }}>
                  {editingKey !== null ? "Edit Item" : "Find Product"}
                </span>
              </div>
              <button
                onClick={handleCloseAddItemModal}
                className="p-1 cursor-pointer"
                style={{ color: "var(--muted)", transition: "color 0.2s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Category & cascading filters */}
            <div className="px-6 py-5">
              <div className="flex flex-wrap gap-3 items-end">
                {/* Category (searchable) */}
                <div ref={catRef} className="relative min-w-[200px] max-w-[280px]">
                  <label className="block text-[9px] uppercase tracking-[0.15em] mb-1.5" style={labelStyle}>Category</label>
                  <div className="flex items-center gap-1.5 px-3 py-2.5" style={inputStyle}>
                    <input
                      type="text"
                      value={catOpen ? catSearch : (selCategoryId ? categories.find(([id]) => id === selCategoryId)?.[1] ?? "" : "")}
                      placeholder="Search..."
                      onChange={(e) => { setCatSearch(e.target.value); setCatHighlight(0); if (!catOpen) setCatOpen(true); }}
                      onFocus={() => { setCatOpen(true); setCatSearch(""); setCatHighlight(-1); }}
                      onKeyDown={(e) => {
                        if (!catOpen) return;
                        const filtered = categories.filter(([, name]) => name.toLowerCase().includes(catSearch.toLowerCase()));
                        if (e.key === "ArrowDown") { e.preventDefault(); setCatHighlight((prev) => { const next = Math.min(prev + 1, filtered.length - 1); catListRef.current?.children[next]?.scrollIntoView({ block: "nearest" }); return next; }); }
                        else if (e.key === "ArrowUp") { e.preventDefault(); setCatHighlight((prev) => { const next = Math.max(prev - 1, 0); catListRef.current?.children[next]?.scrollIntoView({ block: "nearest" }); return next; }); }
                        else if (e.key === "Enter") { e.preventDefault(); const pick = catHighlight >= 0 && catHighlight < filtered.length ? filtered[catHighlight] : filtered[0]; if (pick) { handleCategoryChange(pick[0]); setCatSearch(""); setCatOpen(false); setCatHighlight(-1); } }
                        else if (e.key === "Escape") { setCatOpen(false); setCatHighlight(-1); }
                      }}
                      className="bg-transparent outline-none text-sm w-full"
                      style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}
                    />
                    {selCategoryId !== "" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCategoryChange(""); setCatSearch(""); setCatOpen(false); }}
                        className="cursor-pointer p-0.5"
                        style={{ color: "var(--muted)", flexShrink: 0, transition: "color 0.2s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {catOpen && (
                    <div ref={catListRef} className="absolute z-50 left-0 right-0 mt-1 max-h-80 overflow-y-auto" style={{ border: "1px solid var(--border)", backgroundColor: "var(--background)", boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
                      {categories
                        .filter(([, name]) => name.toLowerCase().includes(catSearch.toLowerCase()))
                        .map(([id, name], idx) => (
                          <div
                            key={id}
                            className="px-3 py-2.5 text-sm cursor-pointer"
                            style={{
                              color: idx === catHighlight || id === selCategoryId ? "var(--foreground)" : "var(--muted)",
                              backgroundColor: idx === catHighlight ? "var(--input-bg)" : "transparent",
                              borderLeft: id === selCategoryId ? "2px solid var(--accent)" : idx === catHighlight ? "2px solid var(--border)" : "2px solid transparent",
                              fontFamily: "var(--font-body)",
                              transition: "background-color 0.15s ease",
                            }}
                            onMouseEnter={() => setCatHighlight(idx)}
                            onClick={() => { handleCategoryChange(id); setCatSearch(""); setCatOpen(false); setCatHighlight(-1); }}
                          >
                            {name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {selCategoryId !== "" && uniqueProductTypes.length > 1 && (
                  <div className="min-w-[140px] flex-1">
                    <label className="block text-[9px] uppercase tracking-[0.15em] mb-1.5" style={labelStyle}>Type</label>
                    <select value={selProductType} onChange={(e) => handleProductTypeChange(e.target.value)} className="w-full px-3 py-2.5 text-sm cursor-pointer" style={inputStyle}>
                      <option value="All">All Types</option>
                      {uniqueProductTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                )}

                {selCategoryId !== "" && uniqueSizes.length > 1 && (
                  <div className="min-w-[110px] flex-1">
                    <label className="block text-[9px] uppercase tracking-[0.15em] mb-1.5" style={labelStyle}>Size</label>
                    <select value={selSize} onChange={(e) => handleSizeChange(e.target.value)} className="w-full px-3 py-2.5 text-sm cursor-pointer" style={inputStyle}>
                      <option value="All">All</option>
                      {uniqueSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                )}

                {selCategoryId !== "" && uniqueThicknesses.length > 1 && (
                  <div className="min-w-[110px] flex-1">
                    <label className="block text-[9px] uppercase tracking-[0.15em] mb-1.5" style={labelStyle}>Thickness</label>
                    <select value={selThickness} onChange={(e) => handleThicknessChange(e.target.value)} className="w-full px-3 py-2.5 text-sm cursor-pointer" style={inputStyle}>
                      <option value="All">All</option>
                      {uniqueThicknesses.map((t) => <option key={t} value={t}>{t} mm</option>)}
                    </select>
                  </div>
                )}

                {selCategoryId !== "" && (
                  <div className="min-w-[180px] flex-1">
                    <label className="block text-[9px] uppercase tracking-[0.15em] mb-1.5" style={labelStyle}>
                      Product
                      {narrowedProducts.length > 0 && <span className="ml-1" style={{ color: "var(--accent)" }}>({narrowedProducts.length})</span>}
                    </label>
                    <select value={selProductId} onChange={(e) => setSelProductId(e.target.value ? Number(e.target.value) : "")} className="w-full px-3 py-2.5 text-sm cursor-pointer" style={inputStyle}>
                      <option value="">Select...</option>
                      {narrowedProducts.map((p) => <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Qty + Price (visible after product selected) */}
            {selProductId !== "" && (
              <div className="mx-6 mb-5 px-5 py-4 animate-fade-in" style={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2 mb-3">
                  {selectedProduct && (
                    <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                      {selectedProduct.sku} — {selectedProduct.name}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.15em] mb-1.5" style={labelStyle}>Quantity</label>
                    <input type="number" min={1} value={selQuantity} onChange={(e) => setSelQuantity(e.target.value ? Number(e.target.value) : "")} className="w-full px-3 py-2.5 text-sm" style={inputStyle} placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase tracking-[0.15em] mb-1.5" style={labelStyle}>Price/kg ({"\u20B1"})</label>
                    <input type="number" min={0} step={0.01} value={selPrice} onChange={(e) => setSelPrice(e.target.value ? Number(e.target.value) : "")} className="w-full px-3 py-2.5 text-sm" style={inputStyle} placeholder="0.00" />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleAddItem}
                    disabled={!selProductId || !selQuantity || !selPrice}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "var(--btn-bg)", color: "var(--btn-text)", fontFamily: "var(--font-body)", transition: "background-color 0.2s ease" }}
                    onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = "var(--btn-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--btn-bg)"; }}
                  >
                    {editingKey !== null ? (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> Update</>
                    ) : (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> Add</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
