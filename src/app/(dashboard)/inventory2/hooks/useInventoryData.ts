"use client";

import { useState, useEffect } from "react";
import {
  getInventoryStats,
  getCategoriesWithCounts,
  getAllProducts,
  getProductWarehouseDetail,
  getProductMovements,
} from "@/lib/queries";
import type { ProductSummary, StatCard, CategoryWithCount, WarehouseBreakdown, StockMovement } from "../types";

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
        console.error("Inventory2 initial load error:", err);
        setLoading(false);
      });
  }, []);

  return { stats, categories, allProducts, loading };
}

export function useProductDetail(productId: number | null) {
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
