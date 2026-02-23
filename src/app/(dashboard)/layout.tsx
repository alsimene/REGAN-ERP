"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "@/app/context/ThemeContext";
import { useAuth } from "@/app/context/AuthContext";

/* ── icon helpers (inline SVG, no deps) ── */
const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  sales: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  inventory: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  orders: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  shipments: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  prices: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  sun: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  moon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  x: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  menu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  chevron: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  people: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  companies: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V3a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4" /><line x1="12" y1="12" x2="12" y2="12.01" />
    </svg>
  ),
  opportunities: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
};

/* ── rivet component ── */
function Rivet({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute rounded-full ${className}`}
      style={{
        width: "6px",
        height: "6px",
        backgroundColor: "var(--rivet)",
        boxShadow: "inset 0 -1px 1px var(--rivet-highlight)",
      }}
    />
  );
}

/* ── navigation items ── */
type NavItem = { label: string; icon: React.ReactNode; href: string; comingSoon?: boolean };
type NavGroupItem = { label: string; icon: React.ReactNode; children: { label: string; href: string }[] };
type NavEntry = NavItem | NavGroupItem;

function isNavGroup(entry: NavEntry): entry is NavGroupItem {
  return "children" in entry;
}

const mainNavItems: NavEntry[] = [
  { label: "Dashboard", icon: icons.dashboard, href: "/dashboard" },
  { label: "Orders", icon: icons.orders, href: "/orders" },
  {
    label: "Inventory",
    icon: icons.inventory,
    children: [
      { label: "Warehouse", href: "/inventory" },
      { label: "Product List", href: "/product-list" },
    ],
  },
];

const managementNavItems: NavItem[] = [
  { label: "Sales", icon: icons.sales, href: "/sales", comingSoon: true },
  { label: "Shipments", icon: icons.shipments, href: "/shipments", comingSoon: true },
  { label: "Prices", icon: icons.prices, href: "/prices" },
];

const crmNavItems: NavEntry[] = [
  { label: "People", icon: icons.people, href: "/crm/people" },
  { label: "Companies", icon: icons.companies, href: "/crm/companies" },
  { label: "Opportunities", icon: icons.opportunities, href: "/crm/opportunities" },
];

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Production Overview" },
  "/sales": { title: "Sales", subtitle: "Revenue & Transactions" },
  "/inventory": { title: "Warehouse", subtitle: "Stock Management" },
  "/product-list": { title: "Product List", subtitle: "Register & Manage Products" },
  "/prices": { title: "Market Prices", subtitle: "Price Management" },
  "/orders": { title: "Orders", subtitle: "Order Management" },
  "/orders/new": { title: "New Order", subtitle: "Create Purchase Order" },
  "/shipments": { title: "Shipments", subtitle: "Logistics & Delivery" },
  "/settings": { title: "Settings", subtitle: "Account & Preferences" },
  "/crm/people": { title: "People", subtitle: "Contact Management" },
  "/crm/companies": { title: "Companies", subtitle: "Organization Profiles" },
  "/crm/opportunities": { title: "Opportunities", subtitle: "Sales Pipeline" },
};

function NavLink({ item, pathname, indent }: { item: { label: string; icon?: React.ReactNode; href: string; comingSoon?: boolean }; pathname: string; indent?: boolean }) {
  const isActive =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === item.href || pathname.startsWith(item.href + "/");

  if (item.comingSoon) {
    return (
      <div
        className={`w-full flex items-center gap-3 ${indent ? "pl-10 pr-3 py-2" : "px-3 py-2.5"} text-sm uppercase tracking-wider`}
        style={{
          color: "var(--panel-text-sub)",
          opacity: 0.5,
          borderLeft: "2px solid transparent",
          fontFamily: "var(--font-body)",
          fontSize: indent ? "11px" : undefined,
          cursor: "not-allowed",
        }}
      >
        {item.icon}
        <span className="flex-1">{item.label}</span>
        <span
          className="text-[8px] tracking-[0.1em] px-1.5 py-0.5 rounded-sm uppercase"
          style={{
            backgroundColor: "var(--panel-accent)",
            color: "#fff",
            opacity: 1,
            fontFamily: "var(--font-body)",
            lineHeight: 1,
          }}
        >
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`w-full flex items-center gap-3 ${indent ? "pl-10 pr-3 py-2" : "px-3 py-2.5"} text-sm uppercase tracking-wider cursor-pointer`}
      style={{
        color: isActive ? "var(--panel-accent)" : "var(--panel-text-sub)",
        backgroundColor: isActive ? "var(--panel-content-bg)" : "transparent",
        borderLeft: isActive ? "2px solid var(--panel-accent)" : "2px solid transparent",
        fontFamily: "var(--font-body)",
        fontSize: indent ? "11px" : undefined,
        transition: "color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = "var(--panel-text)";
          e.currentTarget.style.backgroundColor = "var(--panel-content-bg)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = "var(--panel-text-sub)";
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      {item.icon}
      {item.label}
    </Link>
  );
}

function NavGroup({ item, pathname }: { item: NavGroupItem; pathname: string }) {
  const hasActiveChild = item.children.some(
    (child) => pathname === child.href || pathname.startsWith(child.href + "/")
  );
  const [open, setOpen] = useState(hasActiveChild);

  // Auto-expand when navigating to a child route
  useEffect(() => {
    if (hasActiveChild && !open) setOpen(true);
  }, [hasActiveChild]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm uppercase tracking-wider cursor-pointer"
        style={{
          color: hasActiveChild ? "var(--panel-accent)" : "var(--panel-text-sub)",
          backgroundColor: "transparent",
          borderLeft: "2px solid transparent",
          fontFamily: "var(--font-body)",
          transition: "color 0.2s ease, background-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          if (!hasActiveChild) {
            e.currentTarget.style.color = "var(--panel-text)";
            e.currentTarget.style.backgroundColor = "var(--panel-content-bg)";
          }
        }}
        onMouseLeave={(e) => {
          if (!hasActiveChild) {
            e.currentTarget.style.color = "var(--panel-text-sub)";
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        {item.icon}
        <span className="flex-1 text-left">{item.label}</span>
        <span
          className="shrink-0"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          {icons.chevron}
        </span>
      </button>
      <div
        style={{
          maxHeight: open ? `${item.children.length * 40}px` : "0px",
          overflow: "hidden",
          transition: "max-height 0.25s ease",
        }}
      >
        {item.children.map((child) => (
          <NavLink key={child.href} item={child} pathname={pathname} indent />
        ))}
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme, mounted } = useTheme();
  const { user, loading: authLoading, signOut } = useAuth();
  const [isClient, setIsClient] = useState(false);

  const fullName = user?.user_metadata?.full_name ?? "User";
  const email = user?.email ?? "";
  const initials = fullName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  // Show nothing while checking auth (prevents flash of dashboard)
  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted uppercase tracking-widest animate-pulse">Loading...</p>
      </div>
    );
  }

  const isDark = theme === "dark";
  const meta = pageMeta[pathname]
    || (pathname.startsWith("/orders/") && pathname !== "/orders/new"
      ? { title: "Order Details", subtitle: decodeURIComponent(pathname.split("/").pop() ?? "") }
      : { title: "Dashboard", subtitle: "" });

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-300">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ════ SIDEBAR ════ */}
      <aside
        className={`fixed z-50 top-0 left-0 h-screen w-[240px] flex flex-col transition-transform duration-300 lg:translate-x-0 lg:sticky lg:z-auto lg:shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--panel-bg-1)",
          transition: "background-color 0.4s ease, transform 0.3s ease",
        }}
      >
        {/* Sidebar rivets */}
        <Rivet className="top-3 left-3" />
        <Rivet className="top-3 right-3" />
        <Rivet className="bottom-3 left-3" />
        <Rivet className="bottom-3 right-3" />

        {/* Steel line accent */}
        <div
          className="absolute top-0 right-0 w-[1px] h-full"
          style={{ backgroundColor: "var(--steel-line)" }}
        />

        {/* Logo + mobile close */}
        <div className="px-6 pt-8 pb-6 flex items-start justify-between">
          <div>
            <h1
              className="font-[family-name:var(--font-display)] text-2xl uppercase tracking-wider"
              style={{ color: "var(--panel-text)" }}
            >
              Regan
            </h1>
            <span
              className="text-[11px] uppercase tracking-[0.2em] mt-0.5 block"
              style={{ color: "var(--panel-text-sub)", fontFamily: "var(--font-body)" }}
            >
              Inventory
            </span>
            <div
              className="mt-2 h-[2px] w-10"
              style={{ backgroundColor: "var(--panel-accent)" }}
            />
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden cursor-pointer p-1"
            style={{ color: "var(--panel-text-sub)", transition: "color 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--panel-text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--panel-text-sub)")}
          >
            {icons.x}
          </button>
        </div>

        {/* Nav — Main */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <div className="mb-1">
            <span
              className="block px-3 py-1.5 text-[9px] uppercase tracking-[0.2em]"
              style={{ color: "var(--panel-text-sub)", fontFamily: "var(--font-body)" }}
            >
              Main
            </span>
          </div>
          <div className="space-y-0.5">
            {mainNavItems.map((item) =>
              isNavGroup(item) ? (
                <NavGroup key={item.label} item={item} pathname={pathname} />
              ) : (
                <NavLink key={item.label} item={item} pathname={pathname} />
              )
            )}
          </div>

          {/* Divider */}
          <div className="my-3 mx-3 h-px" style={{ backgroundColor: "var(--steel-line)" }} />

          {/* Nav — Management */}
          <div className="mb-1">
            <span
              className="block px-3 py-1.5 text-[9px] uppercase tracking-[0.2em]"
              style={{ color: "var(--panel-text-sub)", fontFamily: "var(--font-body)" }}
            >
              Management
            </span>
          </div>
          <div className="space-y-0.5">
            {managementNavItems.map((item) => (
              <NavLink key={item.label} item={item} pathname={pathname} />
            ))}
          </div>

          {/* Divider */}
          <div className="my-3 mx-3 h-px" style={{ backgroundColor: "var(--steel-line)" }} />

          {/* Nav — CRM */}
          <div className="mb-1">
            <span
              className="block px-3 py-1.5 text-[9px] uppercase tracking-[0.2em]"
              style={{ color: "var(--panel-text-sub)", fontFamily: "var(--font-body)" }}
            >
              CRM
            </span>
          </div>
          <div className="space-y-0.5">
            {crmNavItems.map((item) =>
              isNavGroup(item) ? (
                <NavGroup key={item.label} item={item} pathname={pathname} />
              ) : (
                <NavLink key={item.label} item={item} pathname={pathname} />
              )
            )}
          </div>

          {/* Divider */}
          <div className="my-3 mx-3 h-px" style={{ backgroundColor: "var(--steel-line)" }} />

          {/* Nav — System */}
          <div className="mb-1">
            <span
              className="block px-3 py-1.5 text-[9px] uppercase tracking-[0.2em]"
              style={{ color: "var(--panel-text-sub)", fontFamily: "var(--font-body)" }}
            >
              System
            </span>
          </div>
          <div className="space-y-0.5">
            <NavLink item={{ label: "Settings", icon: icons.settings, href: "/settings" }} pathname={pathname} />
          </div>
        </nav>

        {/* ── User profile at bottom ── */}
        <div
          className="px-3 pb-4 pt-2"
          style={{ borderTop: "1px solid var(--steel-line)" }}
        >
          {/* Theme toggle */}
          {isClient && mounted && (
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm uppercase tracking-wider cursor-pointer mb-2"
              style={{
                color: "var(--panel-text-sub)",
                fontFamily: "var(--font-body)",
                transition: "color 0.2s ease, background-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--panel-text)";
                e.currentTarget.style.backgroundColor = "var(--panel-content-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--panel-text-sub)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {isDark ? icons.sun : icons.moon}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
          )}

          {/* User card */}
          <div
            className="flex items-center gap-3 px-3 py-3"
            style={{
              backgroundColor: "var(--panel-content-bg)",
              border: "1px solid var(--panel-content-border)",
              transition: "background-color 0.3s ease",
            }}
          >
            <div
              className="w-9 h-9 flex items-center justify-center text-xs font-semibold uppercase shrink-0"
              style={{
                backgroundColor: "var(--panel-accent)",
                color: "#fff",
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "var(--panel-text)", fontFamily: "var(--font-body)" }}
              >
                {fullName}
              </p>
              <p
                className="text-[10px] truncate mt-0.5"
                style={{ color: "var(--panel-text-sub)", fontFamily: "var(--font-body)" }}
              >
                {email}
              </p>
            </div>
            <button
              onClick={() => {
                signOut();
                router.push("/login");
              }}
              className="shrink-0 cursor-pointer p-1.5"
              style={{ color: "var(--panel-text-sub)", transition: "color 0.2s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--panel-accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--panel-text-sub)")}
              title="Sign out"
            >
              {icons.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* ════ MAIN CONTENT ════ */}
      <main className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 lg:px-8 py-5 border-b border-border">
          {/* Mobile menu button */}
          <button
            className="lg:hidden mr-4 cursor-pointer p-1"
            onClick={() => setSidebarOpen(true)}
            style={{ color: "var(--foreground)" }}
          >
            {icons.menu}
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="font-[family-name:var(--font-display)] text-xl uppercase tracking-wide text-foreground">
              {meta.title}
            </h2>
            <p className="text-xs text-muted mt-0.5 tracking-wide uppercase">{meta.subtitle}</p>
          </div>

          <span className="text-xs text-muted uppercase tracking-wider">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </header>

        {/* Page content */}
        <div className="px-6 lg:px-8 py-6 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
