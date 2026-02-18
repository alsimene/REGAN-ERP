"use client";

import Link from "next/link";

const icons = {
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  box: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  chart: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  ),
  truck: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
};

const actions = [
  { label: "New Order", desc: "Create a sales order", href: "/dashboard/orders/new", icon: icons.plus },
  { label: "View Inventory", desc: "Browse stock levels", href: "/dashboard/inventory", icon: icons.box },
  { label: "Sales Report", desc: "Revenue & analytics", href: "/dashboard/sales", icon: icons.chart },
  { label: "Shipments", desc: "Track deliveries", href: "/dashboard/shipments", icon: icons.truck },
];

export default function QuickActions() {
  return (
    <div className="animate-fade-up delay-600">
      <h3 className="font-[family-name:var(--font-display)] text-sm uppercase tracking-wider text-foreground mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-3 px-4 py-3.5 text-left transition-colors group"
            style={{
              backgroundColor: "var(--input-bg)",
              borderLeft: "2px solid var(--border)",
              transition: "background-color 0.2s ease, border-color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderLeftColor = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderLeftColor = "var(--border)";
            }}
          >
            <span style={{ color: "var(--accent)" }}>{action.icon}</span>
            <div>
              <p className="text-sm font-medium text-foreground uppercase tracking-wide">{action.label}</p>
              <p className="text-xs text-muted mt-0.5">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
