export interface OrderDraft {
  draftId: string;
  savedAt: string;
  orderDate: string;
  salesperson: string;
  notes: string;
  clientMode: "select" | "new";
  selectedClientId: number | "";
  selectedWarehouseId?: number;
  newClient: { name: string; contact_person: string; phone: string; city: string };
  clientName: string;
  items: LineItem[];
  itemKey: number;
}

export type LineItem = {
  key: number;
  product_id: number;
  product_name: string;
  sku: string;
  warehouse_id: number;
  warehouse_name: string;
  classification: string;
  quantity: number;
  price_per_kg: number;
  weight_per_piece: number;
};

const STORAGE_KEY = "bakal_order_drafts";

function isClient(): boolean {
  return typeof window !== "undefined";
}

export function getDrafts(): OrderDraft[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OrderDraft[];
  } catch {
    return [];
  }
}

function writeDrafts(drafts: OrderDraft[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

export function generateDraftId(existing: OrderDraft[]): string {
  let max = 0;
  for (const d of existing) {
    const match = d.draftId.match(/^DRAFT-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > max) max = num;
    }
  }
  return `DRAFT-${String(max + 1).padStart(3, "0")}`;
}

export function saveDraft(draft: OrderDraft): void {
  const drafts = getDrafts();
  const idx = drafts.findIndex((d) => d.draftId === draft.draftId);
  if (idx >= 0) {
    drafts[idx] = draft;
  } else {
    drafts.push(draft);
  }
  writeDrafts(drafts);
}

export function deleteDraft(draftId: string): void {
  const drafts = getDrafts().filter((d) => d.draftId !== draftId);
  writeDrafts(drafts);
}

export function getDraftById(draftId: string): OrderDraft | undefined {
  return getDrafts().find((d) => d.draftId === draftId);
}
