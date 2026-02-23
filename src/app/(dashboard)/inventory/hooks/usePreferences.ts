"use client";

import { useState, useCallback } from "react";
import { STORAGE_KEYS } from "../types";
import type { SizeUnit } from "../types";

interface Preferences {
  sizeUnit: SizeUnit;
}

const DEFAULT: Preferences = { sizeUnit: "original" };

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

  const setSizeUnit = useCallback((unit: SizeUnit) => {
    setPrefs((prev) => {
      const next = { ...prev, sizeUnit: unit };
      save(next);
      return next;
    });
  }, []);

  return { ...prefs, setSizeUnit };
}
