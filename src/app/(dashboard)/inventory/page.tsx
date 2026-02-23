import {
  getInventoryStats,
  getProductsPage,
  getCategoryFilterOptions,
} from "@/lib/queries";
import { parseSearchTokens } from "./utils";
import InventoryPageClient from "./InventoryPageClient";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const pageSize = Math.max(1, parseInt(params.limit ?? "10"));
  const sortBy = params.sort ?? "sku";
  const sortDir = params.dir ?? "asc";
  const search = params.q ?? "";
  const nameFilter = params.name ?? null;
  const sizeFilter = params.size ?? null;
  const thicknessFilter = params.thickness ?? null;

  const parsed = parseSearchTokens(search);

  const [stats, { products, totalCount }, filterOptions] = await Promise.all([
    getInventoryStats(),
    getProductsPage({ page, pageSize, sortBy, sortDir, search, parsed, nameFilter, sizeFilter, thicknessFilter }),
    parsed.category ? getCategoryFilterOptions(parsed.category) : Promise.resolve(null),
  ]);

  return (
    <InventoryPageClient
      stats={stats}
      products={products}
      totalCount={totalCount}
      filterOptions={filterOptions}
      currentParams={{ page, pageSize, sortBy, sortDir, search, nameFilter, sizeFilter, thicknessFilter }}
      parsedSearch={parsed}
    />
  );
}
