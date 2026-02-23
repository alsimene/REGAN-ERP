"use client";

import { useState, useCallback } from "react";
import { STORAGE_KEYS } from "../types";
import type { SortKey, SortDir, SizeUnit } from "../types";

interface Preferences {
  sortKey: SortKey;
  sortDir: SortDir;
  sizeUnit: SizeUnit;
}

const DEFAULT: Preferences = { sortKey: "sku", sortDir: "asc", sizeUnit: "original" };

function load(): Preferences {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.prefs);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

function save(prefs: Preferences) {
  try {
    localStorage.setItem(STORAGE_KEYS.prefs, JSON.stringify(prefs));
  } catch { /* ignore */ }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(load);

  const setSortKey = useCallback((key: SortKey) => {
    setPrefs((prev) => {
      const next = { ...prev, sortKey: key, sortDir: prev.sortKey === key ? (prev.sortDir === "asc" ? "desc" as SortDir : "asc" as SortDir) : "asc" as SortDir };
      save(next);
      return next;
    });
  }, []);

  const setSizeUnit = useCallback((unit: SizeUnit) => {
    setPrefs((prev) => {
      const next = { ...prev, sizeUnit: unit };
      save(next);
      return next;
    });
  }, []);

  return { ...prefs, setSortKey, setSizeUnit };
}
