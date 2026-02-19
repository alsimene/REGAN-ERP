import { supabase } from "./supabase";
import { unwrap, unwrapCount } from "./queryHelpers";

/* ──────────────────────────────────────────
   Dashboard Page
   ────────────────────────────────────────── */

export async function getDashboardStats() {
  const stats = await unwrap(
    supabase.rpc("get_dashboard_stats"),
    "getDashboardStats",
  );

  const s = stats as {
    revenue: number;
    total_orders: number;
    total_stock: number;
    pending_shipments: number;
  };

  return [
    { label: "Revenue", value: `₱${Number(s.revenue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` },
    { label: "Total Orders", value: Number(s.total_orders).toLocaleString() },
    { label: "Inventory", value: Number(s.total_stock).toLocaleString() },
    { label: "Pending Shipments", value: Number(s.pending_shipments).toLocaleString() },
  ];
}

export async function getRawDashboardStats() {
  const stats = await unwrap(
    supabase.rpc("get_dashboard_stats"),
    "getRawDashboardStats",
  );

  const s = stats as {
    revenue: number;
    total_orders: number;
    total_stock: number;
    pending_shipments: number;
  };

  return {
    revenue: Number(s.revenue),
    total_orders: Number(s.total_orders),
    total_stock: Number(s.total_stock),
    pending_shipments: Number(s.pending_shipments),
  };
}

export async function getRecentOrders(limit = 5) {
  const data = await unwrap(
    supabase
      .from("order_summary")
      .select("*")
      .order("order_date", { ascending: false })
      .limit(limit),
    "getRecentOrders",
  );

  return (data ?? []).map((o) => ({
    id: o.order_number ?? "",
    client: o.client_name ?? "",
    product: `${o.item_count ?? 0} item(s)`,
    qty: `${Number(o.total_weight_kg ?? 0).toLocaleString()} kg`,
    total: `₱${Number(o.total ?? 0).toLocaleString()}`,
    status: capitalize(o.status ?? ""),
  }));
}

export async function getInventoryStatus(limit = 5) {
  const data = await unwrap(
    supabase
      .from("product_stock_summary")
      .select("name, total_stock, capacity")
      .gt("capacity", 0)
      .order("total_stock", { ascending: true })
      .limit(limit),
    "getInventoryStatus",
  );

  return (data ?? []).map((r) => ({
    name: r.name ?? "",
    stock: Number(r.total_stock ?? 0),
    capacity: Number(r.capacity ?? 1),
  }));
}

/* ──────────────────────────────────────────
   Sales Page
   ────────────────────────────────────────── */

export async function getSalesStats() {
  const stats = await unwrap(
    supabase.rpc("get_sales_stats"),
    "getSalesStats",
  );

  const s = stats as {
    total_revenue: number;
    order_count: number;
    avg_order_value: number;
    active_clients: number;
  };

  return [
    { label: "Total Revenue", value: `₱${Number(s.total_revenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Total Orders", value: Number(s.order_count).toLocaleString() },
    { label: "Avg Order Value", value: `₱${Number(s.avg_order_value).toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
    { label: "Active Clients", value: Number(s.active_clients).toLocaleString() },
  ];
}

export async function getRawSalesStats() {
  const stats = await unwrap(
    supabase.rpc("get_sales_stats"),
    "getRawSalesStats",
  );

  const s = stats as {
    total_revenue: number;
    order_count: number;
    avg_order_value: number;
    active_clients: number;
  };

  return {
    avg_order_value: Number(s.avg_order_value),
    active_clients: Number(s.active_clients),
  };
}

export async function getMonthlySales() {
  const data = await unwrap(
    supabase
      .from("monthly_sales")
      .select("*")
      .order("month", { ascending: true }),
    "getMonthlySales",
  );

  return (data ?? []).map((r) => {
    const d = new Date(r.month!);
    const monthName = d.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
    return {
      month: monthName,
      revenue: `₱${Number(r.revenue ?? 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      orders: Number(r.order_count ?? 0),
      weight: `${Number(r.total_weight_kg ?? 0).toLocaleString()} kg`,
    };
  });
}

export async function getClientSalesSummary() {
  const data = await unwrap(
    supabase
      .from("client_sales_summary")
      .select("*")
      .order("total_revenue", { ascending: false }),
    "getClientSalesSummary",
  );

  const rows = data ?? [];
  const totalRevenue = rows.reduce((s, r) => s + Number(r.total_revenue ?? 0), 0);

  return rows
    .filter((r) => Number(r.total_revenue ?? 0) > 0)
    .map((r) => {
      const rev = Number(r.total_revenue ?? 0);
      const pct = totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0;
      return {
        name: r.client_name ?? "",
        revenue: `₱${rev.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        orders: Number(r.order_count ?? 0),
        percentage: pct,
      };
    });
}

export async function getProductSalesBreakdown() {
  const data = await unwrap(
    supabase
      .from("order_items")
      .select("quantity, total_weight, line_total, products(name, categories(name))"),
    "getProductSalesBreakdown",
  );

  const rows = data ?? [];
  const totalRevenue = rows.reduce((s, r) => s + Number(r.line_total ?? 0), 0);

  // Group by product name
  const map = new Map<string, { units: number; weight: number; revenue: number }>();
  for (const r of rows) {
    const product = (r.products as unknown as { name: string })?.name ?? "Unknown";
    const existing = map.get(product) ?? { units: 0, weight: 0, revenue: 0 };
    existing.units += r.quantity;
    existing.weight += Number(r.total_weight ?? 0);
    existing.revenue += Number(r.line_total ?? 0);
    map.set(product, existing);
  }

  return [...map.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .map(([product, v]) => ({
      product,
      units: `${v.units.toLocaleString()} pcs`,
      revenue: `₱${v.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      share: totalRevenue > 0 ? Math.round((v.revenue / totalRevenue) * 100) : 0,
    }));
}

/* ──────────────────────────────────────────
   Orders Page
   ────────────────────────────────────────── */

export async function getOrders() {
  const data = await unwrap(
    supabase
      .from("order_summary")
      .select("*")
      .order("order_date", { ascending: false }),
    "getOrders",
  );

  return (data ?? []).map((o) => ({
    id: o.order_number ?? "",
    date: formatDate(o.order_date),
    client: o.client_name ?? "",
    product: `${o.item_count ?? 0} item(s)`,
    qty: `${Number(o.total_weight_kg ?? 0).toLocaleString()} kg`,
    total: `₱${Number(o.total ?? 0).toLocaleString()}`,
    status: capitalize(o.status ?? ""),
    payment: capitalize(o.payment_status ?? ""),
  }));
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

export async function updateOrderStatus(
  orderId: number,
  newStatus: string,
  performedBy?: string,
  performedById?: string,
  notes?: string,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await unwrap(
    (supabase.rpc as any)("update_order_status", {
      p_order_id: orderId,
      p_new_status: newStatus,
      p_performed_by: performedBy ?? null,
      p_performed_by_id: performedById ?? null,
      p_notes: notes ?? null,
    }),
    "updateOrderStatus",
  );
}

export async function recordDelivery(
  orderId: number,
  deliveries: { order_item_id: number; qty: number }[],
  notes?: string,
  deliveredBy?: string,
  processedBy?: string,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await unwrap(
    (supabase.rpc as any)("record_delivery", {
      p_order_id: orderId,
      p_deliveries: deliveries,
      p_notes: notes ?? null,
      p_delivered_by: deliveredBy ?? null,
      p_processed_by: processedBy ?? null,
    }),
    "recordDelivery",
  );
  return data as { new_status: string; all_fulfilled: boolean };
}

export async function getDeliveryHistory(orderId: number) {
  const data = await unwrap(
    supabase
      .from("deliveries")
      .select(`id, processed_by, processed_by_name, notes, delivered_at,
        delivery_items ( id, qty, order_item_id,
          order_items ( products ( sku, name ) )
        )`)
      .eq("order_id", orderId)
      .order("delivered_at", { ascending: false }),
    "getDeliveryHistory",
  );
  return data ?? [];
}

export async function getOrderByNumber(orderNumber: string) {
  const data = await unwrap(
    supabase
      .from("orders")
      .select(`
        id, order_number, order_date, status, payment_status, salesperson,
        subtotal, tax, total, notes, created_at,
        approved_by, approved_at, rejected_by, rejected_at, rejection_notes,
        completed_at, completed_by, supplier_id,
        clients!orders_client_id_fkey ( id, name, contact_person, email, phone, address, city ),
        supplier:clients!orders_supplier_id_fkey ( id, name, contact_person, email, phone, address, city ),
        client_warehouses ( id, name, address, city, contact_person, phone ),
        order_items (
          id, quantity, delivered_qty, classification, price_per_kg, weight_per_piece,
          total_weight, line_total,
          products ( sku, name, specs, categories ( name ) )
        )
      `)
      .eq("order_number", orderNumber)
      .single(),
    "getOrderByNumber",
  );
  return data;
}

/* ──────────────────────────────────────────
   Shipments Page
   ────────────────────────────────────────── */

export async function getShipments() {
  const data = await unwrap(
    supabase
      .from("shipments")
      .select("*, orders(order_number, clients!orders_client_id_fkey(name))")
      .order("created_at", { ascending: false }),
    "getShipments",
  );

  return (data ?? []).map((s) => {
    const order = s.orders as unknown as { order_number: string; clients: { name: string } } | null;
    return {
      id: s.shipment_number,
      orderId: order?.order_number ?? "",
      client: order?.clients?.name ?? "",
      destination: s.destination ?? "",
      carrier: s.carrier ?? "",
      departed: formatDate(s.departed_at),
      eta: formatDate(s.eta),
      weight: s.total_weight_kg ? `${Number(s.total_weight_kg).toLocaleString()} kg` : "",
      status: capitalize(s.status),
    };
  });
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

export async function getFastMovingItems(limit = 20, days = 30) {
  const data = await unwrap(
    supabase.rpc("get_fast_moving_items", { p_limit: limit, p_days: days }),
    "getFastMovingItems",
  );

  return ((data ?? []) as {
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
  }[]);
}

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

export async function getCategoriesWithCounts() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await unwrap(
    (supabase.rpc as any)("get_categories_with_counts"),
    "getCategoriesWithCounts",
  );

  return ((data ?? []) as { id: number; name: string; product_count: number }[])
    .filter((c) => c.product_count > 0);
}

export async function searchProducts(query: string, limit = 50) {
  const data = await unwrap(
    supabase
      .from("product_stock_summary")
      .select("*")
      .or(`sku.ilike.%${query}%,name.ilike.%${query}%`)
      .order("sku")
      .limit(limit),
    "searchProducts",
  );

  return (data ?? []).map((r) => ({
    productId: r.product_id!,
    sku: r.sku ?? "",
    name: r.name ?? "",
    category: r.category ?? "",
    c1: Number(r.total_c1 ?? 0),
    c2: Number(r.total_c2 ?? 0),
    c3: Number(r.total_c3 ?? 0),
    totalStock: Number(r.total_stock ?? 0),
    capacity: Number(r.capacity ?? 0),
  }));
}

export async function getProductWarehouseDetail(productId: number) {
  const data = await unwrap(
    supabase
      .from("warehouse_stock")
      .select("c1, c2, c3, warehouses(name)")
      .eq("product_id", productId)
      .order("warehouse_id"),
    "getProductWarehouseDetail",
  );

  return (data ?? []).map((s) => ({
    warehouse: (s.warehouses as unknown as { name: string })?.name ?? "Unknown",
    c1: s.c1 ?? 0,
    c2: s.c2 ?? 0,
    c3: s.c3 ?? 0,
  }));
}

export async function getAllLowStockAlerts() {
  const data = await unwrap(
    supabase
      .from("low_stock_alerts")
      .select("product_id, sku, name, category, total_c1, total_c2, total_c3, total_stock, capacity")
      .order("total_stock", { ascending: true }),
    "getAllLowStockAlerts",
  );

  return (data ?? []).map((r) => ({
    productId: r.product_id!,
    sku: r.sku ?? "",
    name: r.name ?? "",
    category: r.category ?? "",
    c1: Number(r.total_c1 ?? 0),
    c2: Number(r.total_c2 ?? 0),
    c3: Number(r.total_c3 ?? 0),
    totalStock: Number(r.total_stock ?? 0),
    capacity: Number(r.capacity ?? 1),
    pct: Math.round((Number(r.total_stock ?? 0) / Number(r.capacity ?? 1)) * 100),
  }));
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

export async function getInventoryStats() {
  const [totalProducts, totalStock, lowStockCount, activeCategories] = await Promise.all([
    unwrapCount(
      supabase.from("products").select("id", { count: "exact", head: true }),
      "getInventoryStats.products",
    ),
    unwrap(supabase.rpc("get_total_stock"), "getInventoryStats.totalStock"),
    unwrap(supabase.rpc("get_low_stock_count"), "getInventoryStats.lowStock"),
    unwrapCount(
      supabase.from("categories").select("id", { count: "exact", head: true }),
      "getInventoryStats.categories",
    ),
  ]);

  return [
    { label: "Total Products", value: totalProducts.toLocaleString() },
    { label: "Total Stock", value: Number(totalStock).toLocaleString() },
    { label: "Low Stock Alerts", value: Number(lowStockCount).toLocaleString() },
    { label: "Active Categories", value: activeCategories.toLocaleString() },
  ];
}

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

  // Fetch warehouse stock in batches to avoid URL length limits
  const productIds = products.map((p) => p.id);
  const BATCH = 100;
  const stockBatches = [];
  for (let i = 0; i < productIds.length; i += BATCH) {
    stockBatches.push(
      unwrap(
        supabase
          .from("warehouse_stock")
          .select("product_id, c1, c2, c3, warehouses(name)")
          .in("product_id", productIds.slice(i, i + BATCH))
          .order("warehouse_id")
          .limit(BATCH * 10),
        "getInventoryByCategory.stock",
      )
    );
  }
  const stockResults = await Promise.all(stockBatches);
  const stock = stockResults.flat();

  // Group stock by product_id
  const stockMap = new Map<number, { warehouse: string; c1: number; c2: number; c3: number }[]>();
  for (const s of stock) {
    const wName = (s.warehouses as unknown as { name: string })?.name ?? "Unknown";
    const arr = stockMap.get(s.product_id) ?? [];
    arr.push({ warehouse: wName, c1: s.c1 ?? 0, c2: s.c2 ?? 0, c3: s.c3 ?? 0 });
    stockMap.set(s.product_id, arr);
  }

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
      warehouses: stockMap.get(p.id) ?? [],
    };
  });
}

/* ──────────────────────────────────────────
   Inventory v2
   ────────────────────────────────────────── */

export async function getAllProducts() {
  const data = await unwrap(
    supabase
      .from("product_stock_summary")
      .select("product_id, sku, name, category, size_mm, size_inch, thickness_mm, flange_thickness_mm, weight_per_20ft, length_m, kg_per_m, weight_per_length, capacity, unit, total_c1, total_c2, total_c3, total_stock")
      .order("sku"),
    "getAllProducts",
  );

  return (data ?? []).map((r) => ({
    productId: r.product_id!,
    sku: r.sku ?? "",
    name: r.name ?? "",
    category: r.category ?? "",
    sizeMm: r.size_mm as string | null,
    sizeInch: r.size_inch as string | null,
    thicknessMm: r.thickness_mm as string | null,
    flangeThicknessMm: r.flange_thickness_mm as string | null,
    weightPer20ft: r.weight_per_20ft ? Number(r.weight_per_20ft) : null,
    lengthM: r.length_m ? Number(r.length_m) : null,
    kgPerM: r.kg_per_m ? Number(r.kg_per_m) : null,
    weightPerLength: r.weight_per_length ? Number(r.weight_per_length) : null,
    capacity: Number(r.capacity ?? 0),
    unit: (r.unit as string) ?? "",
    c1: Number(r.total_c1 ?? 0),
    c2: Number(r.total_c2 ?? 0),
    c3: Number(r.total_c3 ?? 0),
    totalStock: Number(r.total_stock ?? 0),
  }));
}

export async function getProductMovements(productId: number, limit = 10) {
  const data = await unwrap(
    supabase
      .from("stock_movements")
      .select("id, movement_type, classification, quantity, notes, performed_by, created_at, reference_id, warehouses(name)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(limit),
    "getProductMovements",
  );

  return (data ?? []).map((r) => ({
    id: r.id,
    type: r.movement_type ?? "",
    classification: r.classification ?? "",
    quantity: r.quantity,
    warehouse: (r.warehouses as unknown as { name: string })?.name ?? "Unknown",
    performedBy: r.performed_by as string | null,
    createdAt: r.created_at ?? "",
    notes: r.notes as string | null,
    referenceId: r.reference_id as string | null,
  }));
}

/* ──────────────────────────────────────────
   Client Warehouses
   ────────────────────────────────────────── */

export async function getClientWarehouses(clientId: number) {
  const data = await unwrap(
    supabase
      .from("client_warehouses")
      .select("id, client_id, name, address, city, contact_person, phone, is_default")
      .eq("client_id", clientId)
      .order("is_default", { ascending: false })
      .order("name"),
    "getClientWarehouses",
  );
  return data ?? [];
}

export async function createClientWarehouse(warehouse: {
  client_id: number;
  name: string;
  address?: string;
  city?: string;
  contact_person?: string;
  phone?: string;
  is_default?: boolean;
  created_by?: string;
}) {
  const data = await unwrap(
    supabase
      .from("client_warehouses")
      .insert(warehouse)
      .select("id, client_id, name, address, city, contact_person, phone, is_default")
      .single(),
    "createClientWarehouse",
  );
  return data;
}

/* ──────────────────────────────────────────
   Purchase Order Creation
   ────────────────────────────────────────── */

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

  // Batched stock fetching to avoid 1000-row default limit
  const productIds = (products ?? []).map((p) => p.id);
  const BATCH = 100;
  const stockBatches = [];
  for (let i = 0; i < productIds.length; i += BATCH) {
    stockBatches.push(
      unwrap(
        supabase
          .from("warehouse_stock")
          .select("product_id, warehouse_id, c1, c2, c3")
          .in("product_id", productIds.slice(i, i + BATCH))
          .limit(1000),
        "getProductsForOrder.stock",
      )
    );
  }
  const stockResults = await Promise.all(stockBatches);
  const stock = stockResults.flat();

  const stockMap = new Map<string, { c1: number; c2: number; c3: number }>();
  for (const s of stock) {
    stockMap.set(`${s.product_id}-${s.warehouse_id}`, {
      c1: s.c1 ?? 0,
      c2: s.c2 ?? 0,
      c3: s.c3 ?? 0,
    });
  }

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

export async function getNextOrderNumber() {
  const data = await unwrap(
    supabase
      .from("orders")
      .select("order_number")
      .order("id", { ascending: false })
      .limit(1),
    "getNextOrderNumber",
  );

  if (!data || data.length === 0) return "ORD-0001";
  const last = data[0].order_number;
  const num = parseInt(last.replace("ORD-", ""), 10);
  return `ORD-${String(num + 1).padStart(4, "0")}`;
}

export async function getMarketPrices() {
  const data = await unwrap(
    supabase
      .from("current_market_prices")
      .select("*"),
    "getMarketPrices",
  );
  return data ?? [];
}

export async function createOrder(order: {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await unwrap(
    (supabase.rpc as any)("create_order_with_items", {
      p_order_number: order.orderNumber,
      p_client_id: order.clientId,
      p_salesperson: order.salesperson,
      p_notes: order.notes,
      p_items: order.items,
      p_created_by: order.createdBy ?? null,
      p_client_warehouse_id: order.clientWarehouseId ?? null,
      p_supplier_id: order.supplierId ?? null,
    }),
    "createOrder",
  );
  return data;
}

export async function updateOrderItemPrices(
  orderId: number,
  items: { item_id: number; price_per_kg: number }[],
  updatedBy?: string,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await unwrap(
    (supabase.rpc as any)("update_order_item_prices", {
      p_order_id: orderId,
      p_items: items,
      p_updated_by: updatedBy ?? null,
    }),
    "updateOrderItemPrices",
  );
  return data as { subtotal: number; tax: number; total: number };
}

/* ──────────────────────────────────────────
   Market Prices
   ────────────────────────────────────────── */

export async function getAllMarketPrices() {
  const data = await unwrap(
    supabase
      .from("current_market_prices")
      .select("*")
      .order("category_name"),
    "getAllMarketPrices",
  );
  return data ?? [];
}

export async function updateMarketPrice(
  categoryId: number,
  price: number,
  notes?: string,
  updatedBy?: string,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await unwrap(
    (supabase.rpc as any)("update_market_price", {
      p_category_id: categoryId,
      p_price: price,
      p_notes: notes ?? null,
      p_updated_by: updatedBy ?? null,
    }),
    "updateMarketPrice",
  );
}

export async function getMarketPriceHistory(limit = 10) {
  const data = await unwrap(
    supabase
      .from("market_prices")
      .select("id, category_id, price_per_kg, effective_date, is_active, notes, categories:category_id(name)")
      .order("effective_date", { ascending: false })
      .limit(limit),
    "getMarketPriceHistory",
  );

  return (data ?? []).map((r) => ({
    id: r.id,
    category: (r.categories as unknown as { name: string })?.name ?? "",
    price: Number(r.price_per_kg),
    date: formatDate(r.effective_date),
    isActive: r.is_active,
    notes: r.notes ?? "",
  }));
}

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

export async function getLowStockAlerts(limit = 5) {
  const data = await unwrap(
    supabase
      .from("low_stock_alerts")
      .select("sku, name, category, total_stock, capacity")
      .order("total_stock", { ascending: true })
      .limit(limit),
    "getLowStockAlerts",
  );

  return (data ?? []).map((r) => ({
    sku: r.sku ?? "",
    name: r.name ?? "",
    category: r.category ?? "",
    stock: Number(r.total_stock ?? 0),
    capacity: Number(r.capacity ?? 1),
    pct: Math.round((Number(r.total_stock ?? 0) / Number(r.capacity ?? 1)) * 100),
  }));
}

export async function getOrdersPipeline() {
  const data = await unwrap(
    supabase
      .from("order_summary")
      .select("status"),
    "getOrdersPipeline",
  );

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    const status = row.status ?? "unknown";
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return counts;
}

export async function getLowStockCount() {
  const data = await unwrap(
    supabase.rpc("get_low_stock_count"),
    "getLowStockCount",
  );
  return Number(data ?? 0);
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
