import type { PostgrestError } from "@supabase/supabase-js";

export class QueryError extends Error {
  code: string;
  details: string;

  constructor(pg: PostgrestError, label: string) {
    super(`[query] ${label}: ${pg.message}`);
    this.name = "QueryError";
    this.code = pg.code;
    this.details = pg.details;
  }
}

/**
 * Extracts `.data` from a Supabase query, logging + throwing on error.
 */
export async function unwrap<T>(
  promise: PromiseLike<{ data: T; error: PostgrestError | null }>,
  label: string,
): Promise<NonNullable<T>> {
  const { data, error } = await promise;
  if (error) {
    console.error(`[query] ${label}:`, error.message);
    throw new QueryError(error, label);
  }
  return data as NonNullable<T>;
}

/**
 * Extracts `.count` from a head:true query, logging + throwing on error.
 */
export async function unwrapCount(
  promise: PromiseLike<{ count: number | null; error: PostgrestError | null }>,
  label: string,
): Promise<number> {
  const { count, error } = await promise;
  if (error) {
    console.error(`[query] ${label}:`, error.message);
    throw new QueryError(error, label);
  }
  return count ?? 0;
}
