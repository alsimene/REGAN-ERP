"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { getOrderByNumber, updateOrderStatus, recordDelivery, getDeliveryHistory } from "@/lib/queries";
import { useAuth } from "@/app/context/AuthContext";
import LoadingOverlay from "@/app/components/LoadingOverlay";
import ConfirmModal from "@/app/components/ConfirmModal";
import DeliveryModal from "@/app/components/DeliveryModal";
import DeliveryHistoryModal from "@/app/components/DeliveryHistoryModal";

/* ── icons ── */
const icons = {
  arrowLeft: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  xCircle: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  ban: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  ),
  play: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  truck: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  checkCircle: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  notFound: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

function capitalize(s: string) {
  return s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

type OrderData = {
  id: number;
  order_number: string;
  order_date: string;
  status: string;
  payment_status: string;
  salesperson: string | null;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  created_at: string;
  approved_by: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  rejection_notes: string | null;
  completed_at: string | null;
  completed_by: string | null;
  clients: {
    id: number;
    name: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
  } | null;
  client_warehouses: {
    id: number;
    name: string;
    address: string | null;
    city: string | null;
    contact_person: string | null;
    phone: string | null;
  } | null;
  order_items: {
    id: number;
    quantity: number;
    delivered_qty: number;
    classification: string;
    price_per_kg: number;
    weight_per_piece: number;
    total_weight: number;
    line_total: number;
    products: { sku: string; name: string } | null;
    warehouses: { name: string } | null;
  }[];
};

type DeliveryRecord = {
  id: number;
  processed_by: string | null;
  processed_by_name: string | null;
  notes: string | null;
  delivered_at: string;
  delivery_items: {
    id: number;
    qty: number;
    order_item_id: number;
    order_items: { products: { sku: string; name: string } | null } | null;
  }[];
};

type ConfirmState = {
  open: boolean;
  title: string;
  message: string;
  variant: "danger" | "warning";
  confirmLabel: string;
  onConfirm: () => void;
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const orderNumber = decodeURIComponent(params.id as string);

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deliveryModal, setDeliveryModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [deliveryHistory, setDeliveryHistory] = useState<DeliveryRecord[]>([]);
  const [rejectionNotes, setRejectionNotes] = useState("");
  const [confirmModal, setConfirmModal] = useState<ConfirmState>({
    open: false,
    title: "",
    message: "",
    variant: "warning",
    confirmLabel: "Confirm",
    onConfirm: () => {},
  });

  const refreshOrder = useCallback(() => {
    getOrderByNumber(orderNumber)
      .then((data) => {
        const orderData = data as unknown as OrderData;
        setOrder(orderData);
        getDeliveryHistory(orderData.id)
          .then((h) => setDeliveryHistory(h as unknown as DeliveryRecord[]))
          .catch(() => {});
      })
      .catch(() => {});
  }, [orderNumber]);

  useEffect(() => {
    getOrderByNumber(orderNumber)
      .then((data) => {
        const orderData = data as unknown as OrderData;
        setOrder(orderData);
        getDeliveryHistory(orderData.id)
          .then((h) => setDeliveryHistory(h as unknown as DeliveryRecord[]))
          .catch(() => {});
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [orderNumber]);

  function handleApproveOrder() {
    setConfirmModal({
      open: true,
      title: "Approve Order",
      message: "Approve this order? It will become available for processing.",
      variant: "warning",
      confirmLabel: "Approve",
      onConfirm: async () => {
        setSaving(true);
        try {
          const userName = user?.user_metadata?.full_name || user?.email || "Unknown";
          await updateOrderStatus(order!.id, "approved", userName, user?.id);
          refreshOrder();
        } catch (err) {
          console.error("Failed to approve order:", err);
        } finally {
          setSaving(false);
          setConfirmModal((prev) => ({ ...prev, open: false }));
        }
      },
    });
  }

  function handleRejectOrder() {
    setRejectionNotes("");
    setConfirmModal({
      open: true,
      title: "Reject Order",
      message: "Reject this order? All reserved stock will be restored to inventory.",
      variant: "danger",
      confirmLabel: "Reject Order",
      onConfirm: async () => {
        setSaving(true);
        try {
          const userName = user?.user_metadata?.full_name || user?.email || "Unknown";
          await updateOrderStatus(order!.id, "rejected", userName, user?.id, rejectionNotes || undefined);
          refreshOrder();
        } catch (err) {
          console.error("Failed to reject order:", err);
        } finally {
          setSaving(false);
          setRejectionNotes("");
          setConfirmModal((prev) => ({ ...prev, open: false }));
        }
      },
    });
  }

  function handleStartProcessing() {
    setConfirmModal({
      open: true,
      title: "Start Processing",
      message: "Move this order to processing? This indicates the order is being prepared for delivery.",
      variant: "warning",
      confirmLabel: "Start Processing",
      onConfirm: async () => {
        setSaving(true);
        try {
          const userName = user?.user_metadata?.full_name || user?.email || "Unknown";
          await updateOrderStatus(order!.id, "processing", userName);
          refreshOrder();
        } catch (err) {
          console.error("Failed to update status:", err);
        } finally {
          setSaving(false);
          setConfirmModal((prev) => ({ ...prev, open: false }));
        }
      },
    });
  }

  function handleCompleteOrder() {
    setConfirmModal({
      open: true,
      title: "Mark as Complete",
      message: "Mark this order as complete? This is the final confirmation that the order has been fully delivered and closed.",
      variant: "warning",
      confirmLabel: "Mark Complete",
      onConfirm: async () => {
        setSaving(true);
        try {
          const userName = user?.user_metadata?.full_name || user?.email || "Unknown";
          await updateOrderStatus(order!.id, "completed", userName, user?.id);
          refreshOrder();
        } catch (err) {
          console.error("Failed to complete order:", err);
        } finally {
          setSaving(false);
          setConfirmModal((prev) => ({ ...prev, open: false }));
        }
      },
    });
  }

  function handleCancelOrder() {
    setConfirmModal({
      open: true,
      title: "Cancel Order",
      message: "Are you sure you want to cancel this order? Undelivered stock will be restored. This action cannot be undone.",
      variant: "danger",
      confirmLabel: "Cancel Order",
      onConfirm: async () => {
        setSaving(true);
        try {
          const userName = user?.user_metadata?.full_name || user?.email || "Unknown";
          await updateOrderStatus(order!.id, "cancelled", userName, user?.id);
          refreshOrder();
        } catch (err) {
          console.error("Failed to cancel order:", err);
        } finally {
          setSaving(false);
          setConfirmModal((prev) => ({ ...prev, open: false }));
        }
      },
    });
  }

  function handleOpenDelivery() {
    setDeliveryModal(true);
  }

  async function handleSubmitDelivery(deliveries: { order_item_id: number; qty: number }[], notes: string) {
    setSaving(true);
    try {
      const displayName = user?.user_metadata?.full_name || user?.email || "Unknown";
      await recordDelivery(order!.id, deliveries, notes || undefined, displayName, user?.id);
      refreshOrder();
    } catch (err) {
      console.error("Failed to record delivery:", err);
    } finally {
      setSaving(false);
      setDeliveryModal(false);
    }
  }

  if (loading) {
    return <LoadingOverlay open message="Loading order" />;
  }

  if (notFound || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span style={{ color: "var(--border)" }}>{icons.notFound}</span>
        <p className="text-sm text-muted uppercase tracking-widest">
          Order not found
        </p>
        <button
          onClick={() => router.push("/dashboard/orders")}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest cursor-pointer"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--btn-text)",
            backgroundColor: "var(--btn-bg)",
          }}
        >
          {icons.arrowLeft}
          Back to Orders
        </button>
      </div>
    );
  }

  const client = order.clients;
  const items = order.order_items ?? [];
  const status = order.status;
  const isTerminal = status === "completed" || status === "cancelled" || status === "rejected";

  // Compute overall delivery progress
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const totalDelivered = items.reduce((s, i) => s + i.delivered_qty, 0);
  const deliveryPct = totalQty > 0 ? Math.round((totalDelivered / totalQty) * 100) : 0;

  return (
    <div className="space-y-0">
      {/* ── BACK BUTTON ── */}
      <div className="mb-3">
        <button
          onClick={() => router.push("/dashboard/orders")}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-widest cursor-pointer group"
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--muted)",
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
        >
          <span style={{ transition: "transform 0.2s ease" }} className="group-hover:-translate-x-0.5 inline-block">
            {icons.arrowLeft}
          </span>
          Back to Orders
        </button>
      </div>

      {/* ── HEADER STRIP ── */}
      <div
        className="animate-fade-up"
        style={{
          backgroundColor: "var(--btn-bg)",
          color: "var(--btn-text)",
          transition: "background-color 0.4s ease, color 0.4s ease",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        }}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Order Number", value: order.order_number },
            { label: "Date", value: formatDate(order.order_date) },
            { label: "Status", value: capitalize(order.status) },
            { label: "Payment", value: capitalize(order.payment_status) },
            { label: "Salesperson", value: order.salesperson || "\u2014" },
          ].map((cell, idx) => (
            <div key={cell.label} className="relative">
              {idx > 0 && (
                <div
                  className="absolute left-0 top-3 bottom-3 w-px hidden sm:block"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                />
              )}
              <div className="px-6 py-4 text-center">
                <div
                  className="text-[10px] uppercase tracking-[0.2em] opacity-60 mb-1"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {cell.label}
                </div>
                <div className="text-sm font-[family-name:var(--font-display)] tracking-wide">
                  {cell.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ACTION BAR ── */}
      <div
        className="animate-fade-up delay-100"
        style={{
          backgroundColor: "var(--input-bg)",
          borderBottom: "1px solid var(--border)",
          transition: "background-color 0.4s ease",
        }}
      >
        <div className="px-6 py-4 flex items-center gap-3 flex-wrap">
          {status === "pending_approval" && (
            <>
              <button
                onClick={handleApproveOrder}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider cursor-pointer"
                style={{
                  backgroundColor: "var(--class-c1)",
                  color: "#fff",
                  fontFamily: "var(--font-body)",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {icons.check}
                Approve
              </button>
              <button
                onClick={handleRejectOrder}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider cursor-pointer"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "#fff",
                  fontFamily: "var(--font-body)",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {icons.xCircle}
                Reject
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider cursor-pointer"
                style={{
                  color: "var(--accent)",
                  border: "1px solid var(--accent)",
                  fontFamily: "var(--font-body)",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {icons.ban}
                Cancel Order
              </button>
            </>
          )}

          {status === "approved" && (
            <>
              <button
                onClick={handleStartProcessing}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider cursor-pointer"
                style={{
                  backgroundColor: "var(--btn-bg)",
                  color: "var(--btn-text)",
                  fontFamily: "var(--font-body)",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {icons.play}
                Start Processing
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider cursor-pointer"
                style={{
                  color: "var(--accent)",
                  border: "1px solid var(--accent)",
                  fontFamily: "var(--font-body)",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {icons.ban}
                Cancel Order
              </button>
            </>
          )}

          {(status === "processing" || status === "partial_delivered") && (
            <>
              <button
                onClick={handleOpenDelivery}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider cursor-pointer"
                style={{
                  backgroundColor: "var(--btn-bg)",
                  color: "var(--btn-text)",
                  fontFamily: "var(--font-body)",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {icons.truck}
                Record Delivery
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider cursor-pointer"
                style={{
                  color: "var(--accent)",
                  border: "1px solid var(--accent)",
                  fontFamily: "var(--font-body)",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                {icons.ban}
                Cancel Order
              </button>
            </>
          )}

          {status === "delivered" && (
            <button
              onClick={handleCompleteOrder}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider cursor-pointer"
              style={{
                backgroundColor: "var(--class-c1)",
                color: "#fff",
                fontFamily: "var(--font-body)",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {icons.checkCircle}
              Mark Complete
            </button>
          )}

          {isTerminal && (
            <span
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider font-medium"
              style={{
                color: status === "completed" ? "var(--class-c1)" : "var(--accent)",
                border: `1px solid ${status === "completed" ? "var(--class-c1)" : "var(--accent)"}`,
                fontFamily: "var(--font-body)",
              }}
            >
              {status === "completed" ? icons.checkCircle : status === "rejected" ? icons.xCircle : icons.ban}
              {status === "completed" ? "Order Complete" : status === "rejected" ? "Rejected" : "Cancelled"}
            </span>
          )}

          {/* Delivery progress — shown when order has items */}
          {!isTerminal && status !== "pending_approval" && status !== "approved" && totalQty > 0 && (
            <div className="ml-auto flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                  Delivered
                </span>
                <span className="text-xs font-medium" style={{ color: deliveryPct === 100 ? "var(--class-c1)" : "var(--foreground)", fontFamily: "var(--font-body)" }}>
                  {totalDelivered.toLocaleString()} / {totalQty.toLocaleString()}
                </span>
              </div>
              <div
                className="w-24 h-1.5"
                style={{ backgroundColor: "var(--border)" }}
              >
                <div
                  className="h-full"
                  style={{
                    width: `${deliveryPct}%`,
                    backgroundColor: deliveryPct === 100 ? "var(--class-c1)" : "var(--draft)",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <span className="text-xs font-medium" style={{ color: deliveryPct === 100 ? "var(--class-c1)" : "var(--muted)", fontFamily: "var(--font-body)" }}>
                {deliveryPct}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── APPROVAL INFO BAR ── */}
      {(order.approved_by || order.rejected_by || order.completed_by) && (
        <div
          className="animate-fade-up delay-150"
          style={{
            backgroundColor: "var(--input-bg)",
            borderBottom: "1px solid var(--border)",
            transition: "background-color 0.4s ease",
          }}
        >
          <div className="px-6 py-3 flex flex-wrap gap-x-6 gap-y-1">
            {order.approved_by && (
              <span
                className="inline-flex items-center gap-1.5 text-xs"
                style={{ color: "var(--class-c1)", fontFamily: "var(--font-body)" }}
              >
                {icons.check}
                Approved by {order.approved_by} on {formatDate(order.approved_at)}
              </span>
            )}
            {order.rejected_by && (
              <span
                className="inline-flex items-center gap-1.5 text-xs"
                style={{ color: "var(--accent)", fontFamily: "var(--font-body)" }}
              >
                {icons.xCircle}
                Rejected by {order.rejected_by} on {formatDate(order.rejected_at)}
                {order.rejection_notes && ` \u2014 ${order.rejection_notes}`}
              </span>
            )}
            {order.completed_by && (
              <span
                className="inline-flex items-center gap-1.5 text-xs"
                style={{ color: "var(--class-c1)", fontFamily: "var(--font-body)" }}
              >
                {icons.checkCircle}
                Completed by {order.completed_by} on {formatDate(order.completed_at)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── CLIENT CARD ── */}
      {client && (
        <div
          className="animate-fade-up delay-200"
          style={{
            backgroundColor: "var(--input-bg)",
            borderBottom: "1px solid var(--border)",
            transition: "background-color 0.4s ease",
          }}
        >
          <div className="px-6 py-5">
            <div
              style={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                transition:
                  "background-color 0.3s ease, border-color 0.3s ease",
              }}
            >
              <div
                className="px-4 py-3 flex items-center gap-3"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <div
                  className="w-8 h-8 flex items-center justify-center text-xs font-[family-name:var(--font-display)] uppercase shrink-0"
                  style={{
                    backgroundColor: "var(--btn-bg)",
                    color: "var(--btn-text)",
                  }}
                >
                  {client.name.charAt(0)}
                </div>
                <span
                  className="text-sm font-medium text-foreground"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {client.name}
                </span>
              </div>

              {(() => {
                const details = [
                  { label: "Contact", value: client.contact_person },
                  { label: "Phone", value: client.phone },
                  { label: "Email", value: client.email },
                  { label: "City", value: client.city },
                  { label: "Address", value: client.address },
                ].filter((d) => d.value);
                if (details.length === 0) return null;
                return (
                  <div className="px-4 py-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-2">
                      {details.map((d) => (
                        <div key={d.label}>
                          <div
                            className="text-[9px] uppercase tracking-[0.2em] mb-0.5"
                            style={{
                              color: "var(--muted)",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            {d.label}
                          </div>
                          <div
                            className="text-sm text-foreground truncate"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            {d.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── SHIP TO WAREHOUSE ── */}
      {order.client_warehouses && (
        <div
          className="animate-fade-up delay-250"
          style={{
            backgroundColor: "var(--input-bg)",
            borderBottom: "1px solid var(--border)",
            transition: "background-color 0.4s ease",
          }}
        >
          <div className="px-6 py-4">
            <div
              style={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                transition: "background-color 0.3s ease, border-color 0.3s ease",
              }}
            >
              <div
                className="px-4 py-3 flex items-center gap-3"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted)" }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span
                  className="text-[10px] uppercase tracking-[0.2em]"
                  style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
                >
                  Ship To
                </span>
                <span
                  className="text-sm font-medium text-foreground"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {order.client_warehouses.name}
                </span>
              </div>
              {(() => {
                const wh = order.client_warehouses!;
                const details = [
                  { label: "Address", value: wh.address },
                  { label: "City", value: wh.city },
                  { label: "Contact", value: wh.contact_person },
                  { label: "Phone", value: wh.phone },
                ].filter((d) => d.value);
                if (details.length === 0) return null;
                return (
                  <div className="px-4 py-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2">
                      {details.map((d) => (
                        <div key={d.label}>
                          <div
                            className="text-[9px] uppercase tracking-[0.2em] mb-0.5"
                            style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
                          >
                            {d.label}
                          </div>
                          <div
                            className="text-sm text-foreground truncate"
                            style={{ fontFamily: "var(--font-body)" }}
                          >
                            {d.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── LINE ITEMS TABLE ── */}
      <div
        className="animate-fade-up delay-300"
        style={{
          backgroundColor: "var(--input-bg)",
          transition: "background-color 0.4s ease",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {[
                  "#",
                  "Product",
                  "Warehouse",
                  "Class",
                  "Qty",
                  "Delivered",
                  "Price/kg",
                  "Weight",
                  "Line Total",
                ].map((h) => (
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
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-14 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--border)" }}>
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" />
                      </svg>
                      <span className="text-sm text-muted">No line items</span>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, i) => {
                  const deliveredPct = item.quantity > 0 ? Math.round((item.delivered_qty / item.quantity) * 100) : 0;
                  const deliveredColor =
                    item.delivered_qty >= item.quantity
                      ? "var(--class-c1)"
                      : item.delivered_qty > 0
                        ? "var(--draft)"
                        : "var(--muted)";
                  return (
                    <tr
                      key={item.id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <td className="px-3 py-3 text-xs text-muted">{i + 1}</td>
                      <td className="px-5 py-3 text-foreground whitespace-nowrap">
                        <span className="text-muted text-xs mr-1">
                          {item.products?.sku}
                        </span>{" "}
                        {item.products?.name}
                      </td>
                      <td className="px-5 py-3 text-muted whitespace-nowrap">
                        {item.warehouses?.name ?? "\u2014"}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span
                          className="text-xs uppercase font-medium"
                          style={{
                            color: `var(--class-${item.classification})`,
                          }}
                        >
                          {item.classification.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-foreground">
                        {item.quantity.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-medium"
                            style={{ color: deliveredColor }}
                          >
                            {item.delivered_qty.toLocaleString()} / {item.quantity.toLocaleString()}
                          </span>
                          {item.quantity > 0 && (
                            <div className="w-12 h-1" style={{ backgroundColor: "var(--border)" }}>
                              <div
                                className="h-full"
                                style={{
                                  width: `${deliveredPct}%`,
                                  backgroundColor: deliveredPct === 100 ? "var(--class-c1)" : item.delivered_qty > 0 ? "var(--draft)" : "transparent",
                                  transition: "width 0.3s ease",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {"\u20B1"}
                        {Number(item.price_per_kg).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-5 py-3 text-muted">
                        {Number(item.total_weight).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}{" "}
                        kg
                      </td>
                      <td className="px-5 py-3 text-foreground font-medium">
                        {"\u20B1"}
                        {Number(item.line_total).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DELIVERY HISTORY BAR ── */}
      {deliveryHistory.length > 0 && (
        <div
          className="animate-fade-up delay-300"
          style={{
            backgroundColor: "var(--input-bg)",
            borderTop: "1px solid var(--border)",
            transition: "background-color 0.4s ease",
          }}
        >
          <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span style={{ color: "var(--foreground)" }}>{icons.truck}</span>
              <h3
                className="text-xs uppercase tracking-[0.2em] font-[family-name:var(--font-display)]"
                style={{ color: "var(--foreground)" }}
              >
                Delivery History
              </h3>
              <span
                className="text-xs uppercase tracking-wider"
                style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
              >
                {deliveryHistory.length} batch{deliveryHistory.length !== 1 ? "es" : ""}
              </span>
              <span
                className="text-xs"
                style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
              >
                {"\u2014"} Last: {new Date(deliveryHistory[0].delivered_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
                {deliveryHistory[0].processed_by_name && ` by ${deliveryHistory[0].processed_by_name}`}
              </span>
            </div>
            <button
              onClick={() => setHistoryModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider cursor-pointer"
              style={{
                backgroundColor: "var(--btn-bg)",
                color: "var(--btn-text)",
                fontFamily: "var(--font-body)",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {icons.clock}
              View History
            </button>
          </div>
        </div>
      )}

      {/* ── FOOTER: NOTES + TOTALS ── */}
      <div
        className="animate-fade-up delay-400"
        style={{
          backgroundColor: "var(--input-bg)",
          borderTop: "1px solid var(--border)",
          transition: "background-color 0.4s ease",
        }}
      >
        <div className="flex flex-col lg:flex-row">
          {/* Notes (left) */}
          <div
            className="flex-1 min-w-0 p-6"
            style={{ borderRight: "1px solid var(--border)" }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.2em] mb-2"
              style={{
                color: "var(--muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              Notes
            </div>
            <p
              className="text-sm text-foreground whitespace-pre-wrap"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {order.notes || "\u2014"}
            </p>
          </div>

          {/* Totals (right) */}
          <div className="lg:w-80 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span
                  className="text-[10px] uppercase tracking-[0.2em]"
                  style={{
                    color: "var(--muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Subtotal
                </span>
                <span
                  className="text-sm text-foreground tabular-nums"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {"\u20B1"}
                  {Number(order.subtotal).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span
                  className="text-[10px] uppercase tracking-[0.2em]"
                  style={{
                    color: "var(--muted)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  Tax (12%)
                </span>
                <span
                  className="text-sm text-foreground tabular-nums"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {"\u20B1"}
                  {Number(order.tax).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div
                className="h-px"
                style={{ backgroundColor: "var(--border)" }}
              />
              <div
                className="flex justify-between items-baseline px-4 py-3 -mx-4"
                style={{
                  backgroundColor: "var(--background)",
                  transition: "background-color 0.3s ease",
                }}
              >
                <span className="text-xs uppercase tracking-[0.2em] font-[family-name:var(--font-display)] text-foreground">
                  Total
                </span>
                <span className="text-xl font-[family-name:var(--font-display)] text-foreground tabular-nums">
                  {"\u20B1"}
                  {Number(order.total).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => { setConfirmModal((prev) => ({ ...prev, open: false })); setRejectionNotes(""); }}
      >
        {confirmModal.title === "Reject Order" && (
          <textarea
            value={rejectionNotes}
            onChange={(e) => setRejectionNotes(e.target.value)}
            placeholder="Reason for rejection (optional)"
            rows={3}
            className="w-full px-3 py-2.5 text-sm resize-none mt-2"
            style={{
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-body)",
            }}
          />
        )}
      </ConfirmModal>

      <DeliveryModal
        open={deliveryModal}
        items={items.map((item) => ({
          id: item.id,
          sku: item.products?.sku ?? "",
          name: item.products?.name ?? "",
          quantity: item.quantity,
          delivered_qty: item.delivered_qty,
        }))}
        saving={saving}
        onSubmit={handleSubmitDelivery}
        onCancel={() => setDeliveryModal(false)}
      />

      <DeliveryHistoryModal
        open={historyModal}
        deliveries={deliveryHistory}
        orderInfo={{
          orderNumber: order.order_number,
          clientName: client?.name ?? "",
          clientAddress: client?.address ?? undefined,
          clientCity: client?.city ?? undefined,
          clientPhone: client?.phone ?? undefined,
        }}
        onClose={() => setHistoryModal(false)}
      />
    </div>
  );
}
