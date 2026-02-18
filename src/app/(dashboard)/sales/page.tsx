import { getSalesStats, getMonthlySales, getClientSalesSummary, getProductSalesBreakdown } from "@/lib/queries";

export default async function SalesPage() {
  const [salesStats, monthlySales, topClients, productSales] = await Promise.all([
    getSalesStats(),
    getMonthlySales(),
    getClientSalesSummary(),
    getProductSalesBreakdown(),
  ]);

  return (
    <>
      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {salesStats.map((stat, i) => (
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

      {/* ── MIDDLE ROW: Monthly Sales + Top Clients ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly Sales — 2 cols */}
        <div
          className="xl:col-span-2 animate-fade-up delay-400"
          style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground">
              Monthly Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Month", "Revenue", "Orders", "Weight"].map((h) => (
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
                {monthlySales.map((row) => (
                  <tr
                    key={row.month}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">{row.month}</td>
                    <td className="px-5 py-3 text-foreground font-medium whitespace-nowrap">{row.revenue}</td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{row.orders}</td>
                    <td className="px-5 py-3 text-muted whitespace-nowrap">{row.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Clients — 1 col */}
        <div
          className="animate-fade-up delay-500"
          style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground">
              Top Clients
            </h3>
          </div>
          <div className="px-5 py-4 space-y-5">
            {topClients.map((client) => (
              <div key={client.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-foreground uppercase tracking-wider">{client.name}</span>
                  <span className="text-xs font-medium text-muted">{client.revenue}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${client.percentage}%`,
                      backgroundColor: "var(--accent)",
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted">{client.orders} orders</span>
                  <span className="text-[10px] text-muted">{client.percentage}% of total</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRODUCT SALES BREAKDOWN ── */}
      <div
        className="animate-fade-up delay-600"
        style={{ backgroundColor: "var(--input-bg)", transition: "background-color 0.4s ease" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground">
            Sales by Product
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Product", "Units Sold", "Revenue", "Share"].map((h) => (
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
              {productSales.map((row) => (
                <tr
                  key={row.product}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <td className="px-5 py-3 font-medium text-foreground whitespace-nowrap">{row.product}</td>
                  <td className="px-5 py-3 text-muted whitespace-nowrap">{row.units}</td>
                  <td className="px-5 py-3 text-foreground font-medium whitespace-nowrap">{row.revenue}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                        <div
                          className="h-full"
                          style={{ width: `${row.share}%`, backgroundColor: "var(--accent)" }}
                        />
                      </div>
                      <span className="text-xs text-muted">{row.share}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
