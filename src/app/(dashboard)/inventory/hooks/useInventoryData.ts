"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getInventoryStats,
  getCategoriesWithCounts,
  getAllProducts,
  getProductWarehouseDetail,
  getProductMovements,
  getFastMovingItems,
  getAllLowStockAlerts,
} from "@/lib/queries";
import type { ProductSummary, StatCard, CategoryWithCount, WarehouseBreakdown, StockMovement, FastMovingItem, LowStockItem } from "../types";

export function useInventoryData() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [allProducts, setAllProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getInventoryStats(), getCategoriesWithCounts(), getAllProducts()])
      .then(([statsData, catsData, productsData]) => {
        setStats(statsData);
        setCategories(catsData);
        setAllProducts(productsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Inventory initial load error:", err);
        setLoading(false);
      });
  }, []);

  return { stats, categories, allProducts, loading };
}

export function useProductDetail(productId: string | null) {
  const [warehouses, setWarehouses] = useState<WarehouseBreakdown[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId === null) {
      setWarehouses([]);
      setMovements([]);
      return;
    }
    setLoading(true);
    Promise.all([getProductWarehouseDetail(productId), getProductMovements(productId)])
      .then(([wh, mv]) => {
        setWarehouses(wh);
        setMovements(mv);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  return { warehouses, movements, loading };
}

export function useFastMovingItems() {
  const [items, setItems] = useState<FastMovingItem[]>([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getFastMovingItems(20, days)
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  return { items, days, setDays, loading };
}

export function useLowStockAlerts() {
  const [items, setItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getAllLowStockAlerts()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, load };
}
