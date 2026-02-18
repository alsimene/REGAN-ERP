"use client";

import { useState, useCallback } from "react";
import { STORAGE_KEYS } from "../types";

function load(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.columns);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function save(hidden: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEYS.columns, JSON.stringify([...hidden]));
  } catch { /* ignore */ }
}

export function useColumnVisibility() {
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(load);

  const toggleColumn = useCallback((key: string) => {
    setHiddenColumns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      save(next);
      return next;
    });
  }, []);

  const isVisible = useCallback((key: string) => !hiddenColumns.has(key), [hiddenColumns]);

  return { hiddenColumns, toggleColumn, isVisible };
}
