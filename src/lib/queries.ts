import { supabase } from "./supabase";
import { unwrap, unwrapCount } from "./queryHelpers";

/*
 * ============================================================
 * QUERIES — STUBBED FOR MINIMAL SCHEMA
 * ============================================================
 * Only 5 tables exist: categories, companies, warehouses,
 * products, clients.
 *
 * All functions that reference missing tables/views/RPCs
 * (orders, order_items, deliveries, shipments, warehouse_stock,
 *  stock_movements, market_prices, client_warehouses, etc.)
 * are commented out and return empty/default values.
 * ============================================================
 */

/* ──────────────────────────────────────────
   Dashboard Page
   ────────────────────────────────────────── */

// STUBBED — RPC get_dashboard_stats does not exist
export async function getDashboardStats(_companyId?: string) {
  return [
    { label: "Revenue", value: "₱0" },
    { label: "Total Orders", value: "0" },
    { label: "Inventory", value: "0" },
    { label: "Pending Shipments", value: "0" },
  ];
}

// STUBBED — RPC get_dashboard_stats does not exist
export async function getRawDashboardStats(_companyId?: string) {
  return {
    revenue: 0,
    total_orders: 0,
    total_stock: 0,
    pending_shipments: 0,
  };
}

// STUBBED — view order_summary does not exist
export async function getRecentOrders(_limit = 5) {
  return [] as { id: string; client: string; product: string; qty: string; total: string; status: string }[];
}

// STUBBED — view product_stock_summary does not exist
export async function getInventoryStatus(_limit = 5) {
  return [] as { name: string; stock: number; capacity: number }[];
}

/* ──────────────────────────────────────────
   Sales Page
   ────────────────────────────────────────── */

// STUBBED — RPC get_sales_stats does not exist
export async function getSalesStats() {
  return [
    { label: "Total Revenue", value: "₱0" },
    { label: "Total Orders", value: "0" },
    { label: "Avg Order Value", value: "₱0" },
    { label: "Active Clients", value: "0" },
  ];
}

// STUBBED — RPC get_sales_stats does not exist
export async function getRawSalesStats() {
  return {
    avg_order_value: 0,
    active_clients: 0,
  };
}

// STUBBED — view monthly_sales does not exist
export async function getMonthlySales() {
  return [] as { month: string; revenue: string; orders: number; weight: string }[];
}

// STUBBED — view client_sales_summary does not exist
export async function getClientSalesSummary() {
  return [] as { name: string; revenue: string; orders: number; percentage: number }[];
}

// STUBBED — table order_items does not exist
export async function getProductSalesBreakdown() {
  return [] as { product: string; units: string; revenue: string; share: number }[];
}

/* ──────────────────────────────────────────
   Orders Page
   ────────────────────────────────────────── */

// STUBBED — view order_summary does not exist
export async function getOrders() {
  return [] as { id: string; date: string; client: string; product: string; qty: string; total: string; status: string; payment: string }[];
}

export function computeOrderStats(orders: { status: string }[]) {
  const total = orders.length;
  const pendingApproval = orders.filter((o) => o.status === "Pending Approval").length;
  const approved = orders.filter((o) => o.status === "Approved").length;
  const processing = orders.filter((o) => o.status === "Processing").length;
  const delivered = orders.filter((o) => o.status === "Delivered").length;
  const completed = orders.filter((o) => o.status === "Completed").length;

  return [
    { label: "Total Orders", value: total.toLocaleString() },
    { label: "Pending Approval", value: pendingApproval.toLocaleString() },
    { label: "Approved", value: approved.toLocaleString() },
    { label: "Processing", value: processing.toLocaleString() },
    { label: "Delivered", value: delivered.toLocaleString() },
    { label: "Completed", value: completed.toLocaleString() },
  ];
}

// STUBBED — RPC update_order_status does not exist
export async function updateOrderStatus(
  _orderId: number,
  _newStatus: string,
  _performedBy?: string,
  _performedById?: string,
  _notes?: string,
) {
  // no-op
}

// STUBBED — RPC record_delivery does not exist
export async function recordDelivery(
  _orderId: number,
  _deliveries: { order_item_id: number; qty: number }[],
  _notes?: string,
  _deliveredBy?: string,
  _processedBy?: string,
) {
  return { new_status: "", all_fulfilled: false };
}

// STUBBED — table deliveries does not exist
export async function getDeliveryHistory(_orderId: number) {
  return [];
}

// STUBBED — table orders does not exist
export async function getOrderByNumber(_orderNumber: string) {
  return null;
}

/* ──────────────────────────────────────────
   Shipments Page
   ────────────────────────────────────────── */

// STUBBED — table shipments does not exist
export async function getShipments() {
  return [] as { id: string; orderId: string; client: string; destination: string; carrier: string; departed: string; eta: string; weight: string; status: string }[];
}

export function computeShipmentStats(shipments: { status: string }[]) {
  const active = shipments.filter((s) => s.status !== "Delivered").length;
  const delivered = shipments.filter((s) => s.status === "Delivered").length;
  const inTransit = shipments.filter((s) => s.status === "In Transit").length;
  const delayed = shipments.filter((s) => s.status === "Delayed").length;

  return [
    { label: "Active Shipments", value: active.toLocaleString() },
    { label: "Delivered", value: delivered.toLocaleString() },
    { label: "In Transit", value: inTransit.toLocaleString() },
    { label: "Delayed", value: delayed.toLocaleString() },
  ];
}

export function computeCarrierPerformance(shipments: { carrier: string; status: string }[]) {
  const map = new Map<string, { deliveries: number; onTime: number }>();
  for (const s of shipments) {
    if (!s.carrier) continue;
    const existing = map.get(s.carrier) ?? { deliveries: 0, onTime: 0 };
    existing.deliveries++;
    if (s.status === "Delivered") existing.onTime++;
    map.set(s.carrier, existing);
  }

  return [...map.entries()].map(([carrier, v]) => ({
    carrier,
    deliveries: v.deliveries,
    onTime: v.onTime,
    rate: v.deliveries > 0 ? Math.round((v.onTime / v.deliveries) * 100) : 0,
  }));
}

/* ──────────────────────────────────────────
   Inventory Page
   ────────────────────────────────────────── */

// STUBBED — RPC get_fast_moving_items does not exist
export async function getFastMovingItems(_limit = 20, _days = 30, _companyId?: string) {
  return [] as {
    product_id: number;
    sku: string;
    product_name: string;
    category_name: string;
    total_moved: number;
    total_ordered: number;
    txn_count: number;
    warehouse_count: number;
    current_stock: number;
    last_movement: string;
  }[];
}

// LIVE — categories table exists
export async function getCategories() {
  const data = await unwrap(
    supabase
      .from("categories")
      .select("name")
      .order("id"),
    "getCategories",
  );

  return (data ?? []).map((c) => c.name);
}

// STUBBED — RPC get_categories_with_counts does not exist
export async function getCategoriesWithCounts(_companyId?: string) {
  // Fallback: query categories + count products per category directly
  const data = await unwrap(
    supabase
      .from("categories")
      .select("id, name"),
    "getCategoriesWithCounts",
  );

  const cats = data ?? [];
  const result: { id: number; name: string; product_count: number }[] = [];

  for (const cat of cats) {
    const count = await unwrapCount(
      supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", cat.id),
      "getCategoriesWithCounts.count",
    );
    if (count > 0) {
      result.push({ id: cat.id, name: cat.name, product_count: count });
    }
  }

  return result;
}

// STUBBED — views product_stock_summary/company_stock_summary do not exist
export async function searchProducts(_query: string, _limit = 50, _companyId?: string) {
  return [] as { productId: number; sku: string; name: string; category: string; c1: number; c2: number; c3: number; totalStock: number; capacity: number }[];
}

// STUBBED — table warehouse_stock does not exist
export async function getProductWarehouseDetail(_productId: number, _companyId?: string) {
  return [] as { warehouse: string; c1: number; c2: number; c3: number }[];
}

// STUBBED — view low_stock_alerts / RPC get_low_stock_alerts do not exist
export async function getAllLowStockAlerts(_companyId?: string) {
  return [] as { productId: number; sku: string; name: string; category: string; c1: number; c2: number; c3: number; totalStock: number; capacity: number; pct: number }[];
}

export function formatInventoryCSV(
  items: { sku: string; name: string; category?: string; c1: number; c2: number; c3: number; totalStock: number; capacity: number }[],
): string {
  const headers = ["SKU", "Product", "Category", "C1", "C2", "C3", "Total", "Capacity", "Cap%"];
  const rows = items.map((i) => [
    i.sku,
    `"${i.name.replace(/"/g, '""')}"`,
    i.category ?? "",
    i.c1,
    i.c2,
    i.c3,
    i.totalStock,
    i.capacity,
    i.capacity > 0 ? Math.round((i.totalStock / i.capacity) * 100) + "%" : "N/A",
  ].join(","));
  return [headers.join(","), ...rows].join("\n");
}

type InventoryItem = {
  sku: string;
  name: string;
  category: string;
  size: string;
  thickness: string;
  flangeThickness?: string;
  length?: number;
  kgPerM: number;
  weightPerLength: number;
  weightPer20ft?: number;
  capacity: number;
  unit: string;
  warehouses: { warehouse: string; c1: number; c2: number; c3: number }[];
};

// PARTIALLY LIVE — categories + products exist, warehouse_stock does not
export async function getInventoryStats(_companyId?: string) {
  const [totalProducts, activeCategories] = await Promise.all([
    unwrapCount(
      supabase.from("products").select("id", { count: "exact", head: true }),
      "getInventoryStats.products",
    ),
    unwrapCount(
      supabase.from("categories").select("id", { count: "exact", head: true }),
      "getInventoryStats.categories",
    ),
  ]);

  return [
    { label: "Total Products", value: totalProducts.toLocaleString() },
    { label: "Total Stock", value: "0" },
    { label: "Low Stock Alerts", value: "0" },
    { label: "Active Categories", value: activeCategories.toLocaleString() },
  ];
}

// PARTIALLY LIVE — categories + products exist, warehouse_stock does not
export async function getInventoryByCategory(categoryName: string): Promise<InventoryItem[]> {
  const catData = await unwrap(
    supabase
      .from("categories")
      .select("id")
      .eq("name", categoryName)
      .single(),
    "getInventoryByCategory.category",
  );

  if (!catData) return [];

  const products = await unwrap(
    supabase
      .from("products")
      .select("id, sku, name, specs, kg_per_m, weight_per_length, capacity, unit, length_m, categories(name)")
      .eq("category_id", catData.id)
      .order("sku")
      .limit(2000),
    "getInventoryByCategory.products",
  );

  if (!products || products.length === 0) return [];

  // warehouse_stock table does not exist — return empty warehouses
  return products.map((p) => {
    const specs = (p.specs ?? {}) as Record<string, unknown>;
    const category = (p.categories as unknown as { name: string })?.name ?? "";
    return {
      sku: p.sku,
      name: p.name,
      category,
      size: specs.size_inch
        ? String(specs.size_inch).replace(/ x /gi, "  ×  ")
        : specs.size_mm
          ? String(specs.size_mm).replace(/ x /g, "  ×  ")
          : "—",
      thickness: String(specs.thickness_mm ?? "—"),
      flangeThickness: specs.flange_thickness_mm ? String(specs.flange_thickness_mm) : undefined,
      length: p.length_m ? Number(p.length_m) : undefined,
      kgPerM: Number(p.kg_per_m ?? 0),
      weightPerLength: Number(p.weight_per_length ?? 0),
      weightPer20ft: specs.weight_per_20ft ? Number(specs.weight_per_20ft) : undefined,
      capacity: p.capacity ?? 0,
      unit: p.unit ?? "pcs",
      warehouses: [], // STUBBED — warehouse_stock does not exist
    };
  });
}

/* ──────────────────────────────────────────
   Inventory v2
   ────────────────────────────────────────── */

// STUBBED — views product_stock_summary/company_stock_summary do not exist
export async function getAllProducts(_companyId?: string) {
  return [] as {
    productId: number; sku: string; name: string; category: string;
    sizeMm: string | null; sizeInch: string | null; thicknessMm: string | null;
    flangeThicknessMm: string | null; weightPer20ft: number | null;
    lengthM: number | null; kgPerM: number | null; weightPerLength: number | null;
    capacity: number; unit: string;
    c1: number; c2: number; c3: number; totalStock: number;
  }[];
}

// STUBBED — table stock_movements does not exist
export async function getProductMovements(_productId: number, _limit = 10) {
  return [] as { id: number; type: string; classification: string; quantity: number; warehouse: string; performedBy: string | null; createdAt: string; notes: string | null; referenceId: string | null }[];
}

/* ──────────────────────────────────────────
   Client Warehouses
   ────────────────────────────────────────── */

// STUBBED — table client_warehouses does not exist
export async function getClientWarehouses(_clientId: number) {
  return [];
}

// STUBBED — table client_warehouses does not exist
export async function createClientWarehouse(_warehouse: {
  client_id: number;
  name: string;
  address?: string;
  city?: string;
  contact_person?: string;
  phone?: string;
  is_default?: boolean;
  created_by?: string;
}) {
  return null;
}

/* ──────────────────────────────────────────
   Purchase Order Creation
   ────────────────────────────────────────── */

// LIVE — clients table exists
export async function getClients() {
  const data = await unwrap(
    supabase
      .from("clients")
      .select("id, name, contact_person, phone, email, address, city")
      .order("name"),
    "getClients",
  );
  return data ?? [];
}

// LIVE — clients table exists
export async function createClient(client: {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  created_by?: string;
}) {
  const data = await unwrap(
    supabase
      .from("clients")
      .insert(client)
      .select("id")
      .single(),
    "createClient",
  );
  return data.id;
}

// PARTIALLY LIVE — products + warehouses exist, warehouse_stock does not
export async function getProductsForOrder() {
  const [products, warehouses] = await Promise.all([
    unwrap(
      supabase
        .from("products")
        .select("id, sku, name, category_id, weight_per_length, specs, categories(name)")
        .order("sku"),
      "getProductsForOrder.products",
    ),
    unwrap(
      supabase.from("warehouses").select("id, name").order("name"),
      "getProductsForOrder.warehouses",
    ),
  ]);

  // warehouse_stock does not exist — return empty stockMap
  const stockMap = new Map<string, { c1: number; c2: number; c3: number }>();

  return {
    products: (products ?? []).map((p) => {
      const specs = (p.specs ?? {}) as Record<string, unknown>;
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        category_id: p.category_id,
        category_name: (p.categories as unknown as { name: string })?.name ?? "",
        weight_per_piece: Number(p.weight_per_length ?? 0),
        size: specs.size_inch
          ? String(specs.size_inch).replace(/ x /gi, "  ×  ")
          : specs.size_mm
            ? String(specs.size_mm).replace(/ x /g, "  ×  ")
            : "—",
        thickness: String(specs.thickness_mm ?? "—"),
      };
    }),
    warehouses: warehouses ?? [],
    stockMap,
  };
}

// STUBBED — table orders does not exist
export async function getNextOrderNumber() {
  return "ORD-0001";
}

// STUBBED — view current_market_prices does not exist
export async function getMarketPrices() {
  return [] as { category_id: number | null; category_name: string | null; price_per_kg: number | null; effective_date: string | null; price_source: string | null }[];
}

// STUBBED — RPC create_order_with_items does not exist
export async function createOrder(_order: {
  orderNumber: string;
  clientId: number;
  salesperson: string;
  notes: string;
  createdBy?: string;
  clientWarehouseId?: number | null;
  supplierId?: number | null;
  items: {
    product_id: number;
    warehouse_id: number;
    classification: string;
    quantity: number;
    price_per_kg: number;
    weight_per_piece: number;
  }[];
}) {
  return null;
}

// STUBBED — RPC update_order_item_prices does not exist
export async function updateOrderItemPrices(
  _orderId: number,
  _items: { item_id: number; price_per_kg: number }[],
  _updatedBy?: string,
) {
  return { subtotal: 0, tax: 0, total: 0 };
}

/* ──────────────────────────────────────────
   Market Prices
   ────────────────────────────────────────── */

// STUBBED — view current_market_prices does not exist
export async function getAllMarketPrices() {
  return [];
}

// STUBBED — RPC update_market_price does not exist
export async function updateMarketPrice(
  _categoryId: number,
  _price: number,
  _notes?: string,
  _updatedBy?: string,
) {
  // no-op
}

// STUBBED — table market_prices does not exist
export async function getMarketPriceHistory(_limit = 10) {
  return [] as { id: number; category: string; price: number; date: string; isActive: boolean | null; notes: string }[];
}

// LIVE — categories table exists
export async function getCategoriesWithIds() {
  const data = await unwrap(
    supabase
      .from("categories")
      .select("id, name")
      .order("name"),
    "getCategoriesWithIds",
  );
  return data ?? [];
}

/* ──────────────────────────────────────────
   Dashboard — New Queries
   ────────────────────────────────────────── */

// STUBBED — view low_stock_alerts / RPC get_low_stock_alerts do not exist
export async function getLowStockAlerts(_limit = 5, _companyId?: string) {
  return [] as { sku: string; name: string; category: string; stock: number; capacity: number; pct: number }[];
}

// STUBBED — view order_summary does not exist
export async function getOrdersPipeline() {
  return {} as Record<string, number>;
}

// STUBBED — RPC get_low_stock_count does not exist
export async function getLowStockCount(_companyId?: string) {
  return 0;
}

/* ──────────────────────────────────────────
   Companies & Company Warehouses
   ────────────────────────────────────────── */

// LIVE — companies table exists
export async function getCompanies() {
  const data = await unwrap(
    supabase
      .from("companies")
      .select("id, name, code")
      .order("name"),
    "getCompanies",
  );
  return data ?? [];
}

// STUBBED — warehouses.company_id column does not exist in current schema
export async function getCompanyWarehouses(_companyId: string) {
  return [];
}

/* ──────────────────────────────────────────
   Helpers
   ────────────────────────────────────────── */

function capitalize(s: string) {
  return s.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
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

// Keep unused helpers to prevent TS errors in case they're imported elsewhere
void capitalize;
void formatDate;
