/*
 * ============================================================
 * CRM TYPES — Frontend-only types for CRM module
 * ============================================================
 * These types define the shape of CRM data for People,
 * Companies, and Opportunities. They are used by the frontend
 * with mock data until backend tables are created.
 * ============================================================
 */

export type CrmPerson = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  job_title: string;
  city: string;
  company_id: string | null;
  company_name: string | null;
  avatar_url: string;
  notes: string;
  created_at: string;
  updated_at: string;
  created_by: string;
};

export type CrmCompany = {
  id: string;
  name: string;
  domain: string;
  industry: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  logo_url: string;
  annual_revenue: number | null;
  credit_limit: number | null;
  outstanding_balance: number | null;
  payment_terms: string | null;
  is_icp: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
  created_by: string;
};

export type OpportunityStage = string;

export type StageConfig = { key: string; label: string; color: string };

export const DEFAULT_STAGES: StageConfig[] = [
  { key: "incoming", label: "Incoming", color: "#6b7280" },
  { key: "meeting", label: "Meeting", color: "#3b82f6" },
  { key: "proposal", label: "Proposal", color: "#f59e0b" },
  { key: "negotiation", label: "Negotiation", color: "#8b5cf6" },
  { key: "closed_won", label: "Closed Won", color: "#22c55e" },
  { key: "closed_lost", label: "Closed Lost", color: "#ef4444" },
];

// Backward-compatible alias
export const OPPORTUNITY_STAGES = DEFAULT_STAGES;

export type CrmOpportunity = {
  id: string;
  name: string;
  amount: number;
  stage: OpportunityStage;
  close_date: string;
  probability: number;
  company_id: string | null;
  company_name: string | null;
  contact_id: string | null;
  contact_name: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  created_by: string;
};

export type CrmActivity = {
  id: string;
  type: "note" | "call" | "email" | "meeting" | "task";
  subject: string;
  description: string;
  related_type: "person" | "company" | "opportunity";
  related_id: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  created_by: string;
};

/* ── Quotation Types (localStorage-backed) ── */

export type QuotationStatus = "draft" | "approved" | "rejected";

export type SavedQuotationItem = {
  product_id: number;
  product_name: string;
  sku: string;
  category_name: string;
  quantity: number;
  price_per_kg: number;
  weight_per_piece: number;
};

export type SavedQuotation = {
  id: string;
  quotation_number: string;
  opportunity_id: string | null;
  company_name: string;
  contact_name: string | null;
  deal_name: string | null;
  quotation_date: string;
  notes: string | null;
  shipping_method: "pickup" | "truck" | "shipment";
  shipping_fee: number;
  subtotal: number;
  tax: number;
  total: number;
  status: QuotationStatus;
  created_by: string;
  created_at: string;
  approved_by: string | null;
  approved_at: string | null;
  approval_notes: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  rejection_notes: string | null;
  items: SavedQuotationItem[];
};
