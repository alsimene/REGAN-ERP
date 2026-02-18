import { getShipments, computeShipmentStats, computeCarrierPerformance } from "@/lib/queries";

const truckIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

function statusColor(status: string) {
  switch (status) {
    case "Delivered": return "var(--foreground)";
    case "In Transit": return "var(--accent)";
    case "Delayed": return "var(--accent)";
    default: return "var(--foreground)";
  }
}

export default async function ShipmentsPage() {
  const shipments = await getShipments();
  const shipmentStats = computeShipmentStats(shipments);
  const carrierPerformance = computeCarrierPerformance(shipments);

  // Delivery summary computed from data
  const delivered = shipments.filter((s) => s.status === "Delivered").length;
  const delayed = shipments.filter((s) => s.status === "Delayed").length;
  const total = shipments.length;
  const onTime = delivered;
  const deliverySummary = [
    { label: "On Time", value: onTime.toString(), pct: total > 0 ? `${Math.round((onTime / total) * 100)}%` : "0%" },
    { label: "Delayed", value: delayed.toString(), pct: total > 0 ? `${Math.round((delayed / total) * 100)}%` : "0%" },
  ];

  return (
    <>
      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {shipmentStats.map((stat, i) => (
          <div
            key={stat.label}
            className="relative p-5 animate-fade-up"
            style={{
              backgroundColor: "var(--input-bg)",
              borderBottom: "2px solid var(--border)",
              animationDelay: `${i * 0.1}s`,
              transition: "background-color 0.4s ease, border-color 0.4s ease",
            }}
          >
            <div
              className="absolute top-2 right-2 rounded-full"
              style={{ width: "4px", height: "4px", backgroundColor: "var(--border)" }}
            />
            <p className="text-xs text-muted uppercase tracking-widest font-[family-name:var(--font-body)]">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-[family-name:var(--font-display)] text-foreground tracking-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── SHIPMENTS TABLE + CARRIER PERFORMANCE ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Shipments Table — 2 cols */}
        <div
          className="xl:col-span-2 animate-fade-up delay-400"
          style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground">
              All Shipments
            </h3>
            <div className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
              {truckIcon}
              <span className="text-xs uppercase tracking-wider">{shipments.length} shipments</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Shipment ID", "Order", "Client", "Destination", "Carrier", "ETA", "Weight", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-medium uppercase tracking-widest text-muted whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shipments.map((s) => (
                  <tr
                    key={s.id}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">{s.id}</td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{s.orderId}</td>
                    <td className="px-5 py-3 text-foreground whitespace-nowrap">{s.client}</td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{s.destination}</td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{s.carrier}</td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{s.eta}</td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{s.weight}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span
                        className="text-xs uppercase tracking-wider font-medium"
                        style={{ color: statusColor(s.status) }}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Carrier Performance — 1 col */}
        <div
          className="animate-fade-up delay-500"
          style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground">
              Carrier Performance
            </h3>
          </div>
          <div className="px-5 py-4 space-y-5">
            {carrierPerformance.map((carrier) => (
              <div key={carrier.carrier}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-foreground uppercase tracking-wider">{carrier.carrier}</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: carrier.rate >= 95 ? "var(--foreground)" : "var(--accent)" }}
                  >
                    {carrier.rate}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${carrier.rate}%`,
                      backgroundColor: carrier.rate >= 95 ? "var(--foreground)" : "var(--accent)",
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted">{carrier.onTime} on-time</span>
                  <span className="text-[10px] text-muted">{carrier.deliveries} total</span>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery Summary */}
          <div className="px-5 py-4" style={{ borderTop: "1px solid var(--border)" }}>
            <h4 className="font-[family-name:var(--font-display)] text-xs uppercase tracking-wider text-foreground mb-4">
              Delivery Summary
            </h4>
            {deliverySummary.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="text-xs text-foreground uppercase tracking-wider">{item.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted">{item.pct}</span>
                  <span className="text-xs font-medium text-foreground">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
