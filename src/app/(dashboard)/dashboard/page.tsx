import Link from "next/link";
import {
  getRawDashboardStats,
  getRawSalesStats,
  getRecentOrders,
  getFastMovingItems,
  getLowStockAlerts,
  getOrdersPipeline,
  getLowStockCount,
} from "@/lib/queries";
import QuickActions from "./QuickActions";

/* ── Status color mapping ── */
function statusColor(status: string) {
  switch (status) {
    case "Pending Approval":
      return "var(--draft)";
    case "Approved":
      return "var(--class-c1)";
    case "Processing":
      return "var(--muted)";
    case "Partial Delivered":
      return "var(--draft)";
    case "Delivered":
      return "var(--foreground)";
    case "Completed":
      return "var(--class-c1)";
    case "Cancelled":
    case "Rejected":
      return "var(--accent)";
    default:
      return "var(--foreground)";
  }
}

/* ── Pipeline status config ── */
const PIPELINE_STATUSES = [
  { key: "pending_approval", label: "Pending Approval", color: "var(--draft)" },
  { key: "approved", label: "Approved", color: "var(--class-c1)" },
  { key: "processing", label: "Processing", color: "var(--muted)" },
  { key: "partial_delivered", label: "Partial Delivered", color: "var(--draft)" },
  { key: "delivered", label: "Delivered", color: "var(--foreground)" },
  { key: "completed", label: "Completed", color: "var(--class-c1)" },
  { key: "cancelled", label: "Cancelled", color: "var(--accent)" },
  { key: "rejected", label: "Rejected", color: "var(--accent)" },
];

export default async function DashboardPage() {
  const [dashStats, salesStats, recentOrders, fastMovers, lowStockItems, pipeline, lowStockCount] =
    await Promise.all([
      getRawDashboardStats(),
      getRawSalesStats(),
      getRecentOrders(5),
      getFastMovingItems(5),
      getLowStockAlerts(5),
      getOrdersPipeline(),
      getLowStockCount(),
    ]);

  const pendingApproval = pipeline["pending_approval"] ?? 0;
  const activeOrders = (pipeline["processing"] ?? 0) + (pipeline["partial_delivered"] ?? 0);
  const maxPipelineCount = Math.max(...PIPELINE_STATUSES.map((s) => pipeline[s.key] ?? 0), 1);

  /* KPI cards config */
  const kpis = [
    {
      label: "Revenue",
      value: `₱${dashStats.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      alert: false,
    },
    {
      label: "Pending Approval",
      value: pendingApproval.toLocaleString(),
      alert: pendingApproval > 0,
    },
    {
      label: "Active Orders",
      value: activeOrders.toLocaleString(),
      alert: false,
    },
    {
      label: "Low Stock Alerts",
      value: lowStockCount.toLocaleString(),
      alert: lowStockCount > 0,
    },
    {
      label: "Avg Order Value",
      value: `₱${salesStats.avg_order_value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      alert: false,
    },
    {
      label: "Active Clients",
      value: salesStats.active_clients.toLocaleString(),
      alert: false,
    },
  ];

  return (
    <>
      {/* ── ROW 1: KPI CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className="relative p-5 animate-fade-up"
            style={{
              backgroundColor: "var(--input-bg)",
              borderBottom: kpi.alert ? "2px solid var(--accent)" : "2px solid var(--border)",
              animationDelay: `${i * 0.08}s`,
              transition: "background-color 0.4s ease, border-color 0.4s ease",
            }}
          >
            <div
              className="absolute top-2 right-2 rounded-full"
              style={{ width: "4px", height: "4px", backgroundColor: kpi.alert ? "var(--accent)" : "var(--border)" }}
            />
            <p className="text-xs text-muted uppercase tracking-widest font-[family-name:var(--font-body)]">
              {kpi.label}
            </p>
            <p
              className="mt-2 text-2xl font-[family-name:var(--font-display)] tracking-tight"
              style={{ color: kpi.alert ? "var(--accent)" : "var(--foreground)" }}
            >
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── ROW 2: RECENT ORDERS + ORDERS PIPELINE ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders — 2/3 */}
        <div
          className="xl:col-span-2 animate-fade-up delay-400"
          style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground">
              Recent Orders
            </h3>
            <Link
              href="/orders"
              className="text-xs text-accent uppercase tracking-wider hover:text-accent-hover transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Order ID", "Client", "Items", "Weight", "Total", "Status"].map((h) => (
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
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td className="px-5 py-3 whitespace-nowrap">
                      <Link
                        href={`/orders/${order.id}`}
                        className="font-medium text-accent hover:text-accent-hover transition-colors"
                      >
                        {order.id}
                      </Link>
                    </td>
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
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-muted text-sm">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders Pipeline — 1/3 */}
        <div
          className="animate-fade-up delay-500"
          style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
        >
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground">
              Orders Pipeline
            </h3>
          </div>
          <div className="px-5 py-4 space-y-3">
            {PIPELINE_STATUSES.map((s) => {
              const count = pipeline[s.key] ?? 0;
              const barWidth = maxPipelineCount > 0 ? Math.max((count / maxPipelineCount) * 100, count > 0 ? 4 : 0) : 0;
              return (
                <div key={s.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-xs uppercase tracking-wider font-medium"
                      style={{ color: s.color }}
                    >
                      {s.label}
                    </span>
                    <span className="text-xs text-muted font-medium">{count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ROW 3: FAST MOVERS + LOW STOCK ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Fast Moving Products */}
        <div
          className="animate-fade-up delay-600"
          style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground">
              Fast Moving Products
            </h3>
            <Link
              href="/inventory"
              className="text-xs text-accent uppercase tracking-wider hover:text-accent-hover transition-colors"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Product", "Category", "Sold", "Stock"].map((h) => (
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
                {fastMovers.map((item) => (
                  <tr
                    key={item.product_id}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td className="px-5 py-3 text-foreground whitespace-nowrap text-xs">
                      {item.product_name}
                    </td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap text-xs">
                      {item.category_name}
                    </td>
                    <td className="px-5 py-3 text-foreground font-medium whitespace-nowrap text-xs">
                      {item.total_sold.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs font-medium"
                      style={{ color: item.current_stock === 0 ? "var(--accent)" : "var(--foreground)" }}
                    >
                      {item.current_stock.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {fastMovers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-muted text-sm">
                      No sales data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div
          className="animate-fade-up delay-700"
          style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground">
              Low Stock Alerts
            </h3>
            <Link
              href="/inventory"
              className="text-xs text-accent uppercase tracking-wider hover:text-accent-hover transition-colors"
            >
              View Inventory
            </Link>
          </div>
          <div className="px-5 py-4 space-y-5">
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">No low stock items</p>
            ) : (
              lowStockItems.map((item, idx) => (
                <div key={`${item.sku}-${idx}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-foreground uppercase tracking-wider">{item.name}</span>
                    <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                      {item.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${item.pct}%`,
                        backgroundColor: "var(--accent)",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted">{item.stock.toLocaleString()} units</span>
                    <span className="text-[10px] text-muted">{item.capacity.toLocaleString()} cap</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── ROW 4: QUICK ACTIONS ── */}
      <QuickActions />
    </>
  );
}
