"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { PAGE_SIZE } from "../types";

export function usePagination(totalItems: number) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  // Reset to page 1 when total changes
  useEffect(() => {
    setCurrentPage(1);
  }, [totalItems]);

  const prevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return { start, end: start + PAGE_SIZE };
  }, [currentPage]);

  return { currentPage, totalPages, prevPage, nextPage, pageSlice, resetPage: () => setCurrentPage(1) };
}
