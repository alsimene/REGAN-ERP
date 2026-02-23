"use client";

import type { StatCard } from "../types";

interface Props {
  stats: StatCard[];
  viewMode: string;
  onLowStockClick: () => void;
}

const icons = {
  package: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  barChart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  alert: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  layers: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
  ),
};

const STAT_ICONS: Record<string, React.ReactNode> = {
  "Total Products": icons.package,
  "Total Stock": icons.barChart,
  "Low Stock Alerts": icons.alert,
  "Active Categories": icons.layers,
};

export default function StatCards({ stats, onLowStockClick }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up">
      {stats.map((stat) => {
        const isLowStock = stat.label === "Low Stock Alerts";
        const hasAlerts = isLowStock && parseInt(stat.value) > 0;
        return (
          <div
            key={stat.label}
            className="flex items-center gap-4 px-5 py-4"
            style={{
              backgroundColor: "var(--input-bg)",
              border: "1px solid var(--border)",
              transition: "background-color 0.3s ease",
              cursor: hasAlerts ? "pointer" : "default",
            }}
            onClick={hasAlerts ? onLowStockClick : undefined}
          >
            <div
              className="w-10 h-10 flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--accent)", color: "#fff", borderRadius: "2px" }}
            >
              {STAT_ICONS[stat.label] ?? icons.package}
            </div>
            <div>
              <p
                className="text-[11px] uppercase tracking-wider"
                style={{ color: "var(--muted)", fontFamily: "var(--font-body)" }}
              >
                {stat.label}
              </p>
              <p
                className="text-xl font-semibold tabular-nums"
                style={{ color: "var(--foreground)", fontFamily: "var(--font-body)" }}
              >
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
