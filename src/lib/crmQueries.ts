/*
 * ============================================================
 * CRM QUERIES — Frontend mock data layer
 * ============================================================
 * All CRM data access goes through this file.
 * Currently returns mock data for frontend development.
 * Replace with Supabase queries when backend tables are created.
 * ============================================================
 */

import {
  CrmPerson,
  CrmCompany,
  CrmOpportunity,
  CrmActivity,
  OpportunityStage,
  SavedQuotation,
  SavedQuotationItem,
  StageConfig,
  DEFAULT_STAGES,
} from "./crmTypes";

/* ── Mock Data ── */

const MOCK_COMPANIES: CrmCompany[] = [
  {
    id: "comp-001",
    name: "Manila Steel Corp",
    domain: "manilasteel.ph",
    industry: "Steel Manufacturing",

    phone: "+63 2 8555 1234",
    email: "info@manilasteel.ph",
    address: "123 Industrial Blvd",
    city: "Makati",
    country: "Philippines",
    logo_url: "",
    annual_revenue: 85000000,
    credit_limit: 10000000,
    outstanding_balance: 7200000,
    payment_terms: "Net 30",
    is_icp: true,
    notes: "Top tier client, consistent monthly orders",
    created_at: "2025-11-15T08:00:00Z",
    updated_at: "2026-02-20T10:30:00Z",
    created_by: "Admin",
  },
  {
    id: "comp-002",
    name: "Pampanga Hardware Co.",
    domain: "pampangahardware.ph",
    industry: "Construction",

    phone: "+63 2 8666 5678",
    email: "procurement@pampangahardware.ph",
    address: "456 Construction Ave",
    city: "Quezon City",
    country: "Philippines",
    logo_url: "",
    annual_revenue: 120000000,
    credit_limit: 15000000,
    outstanding_balance: 13500000,
    payment_terms: "Net 60",
    is_icp: true,
    notes: "Large-scale construction projects, prefers bulk orders",
    created_at: "2025-10-01T08:00:00Z",
    updated_at: "2026-02-18T14:00:00Z",
    created_by: "Admin",
  },
  {
    id: "comp-003",
    name: "Cebu Iron Works",
    domain: "cebuiron.ph",
    industry: "Metal Fabrication",

    phone: "+63 32 255 9012",
    email: "orders@cebuiron.ph",
    address: "789 Forge Lane",
    city: "Cebu City",
    country: "Philippines",
    logo_url: "",
    annual_revenue: 25000000,
    credit_limit: 3000000,
    outstanding_balance: 450000,
    payment_terms: "COD",
    is_icp: false,
    notes: "Regional client, seasonal demand",
    created_at: "2025-12-10T08:00:00Z",
    updated_at: "2026-01-15T09:00:00Z",
    created_by: "Admin",
  },
  {
    id: "comp-004",
    name: "Davao Builders Supply",
    domain: "davaobuilders.ph",
    industry: "Construction Supply",

    phone: "+63 82 300 3456",
    email: "supply@davaobuilders.ph",
    address: "22 Industrial Park",
    city: "Davao City",
    country: "Philippines",
    logo_url: "",
    annual_revenue: 60000000,
    credit_limit: 8000000,
    outstanding_balance: 4800000,
    payment_terms: "Net 30",
    is_icp: true,
    notes: "Growing partnership, interested in long-term supply agreement",
    created_at: "2026-01-05T08:00:00Z",
    updated_at: "2026-02-22T11:00:00Z",
    created_by: "Admin",
  },
  {
    id: "comp-005",
    name: "Laguna Construction Supply",
    domain: "lagunaconstruction.ph",
    industry: "Construction Supply",

    phone: "+63 2 8777 7890",
    email: "sales@lagunaconstruction.ph",
    address: "55 Warehouse Row",
    city: "Valenzuela",
    country: "Philippines",
    logo_url: "",
    annual_revenue: 15000000,
    credit_limit: null,
    outstanding_balance: null,
    payment_terms: "CBD",
    is_icp: false,
    notes: "Small distributor, price-sensitive",
    created_at: "2026-01-20T08:00:00Z",
    updated_at: "2026-02-10T16:00:00Z",
    created_by: "Admin",
  },
];

const MOCK_PEOPLE: CrmPerson[] = [
  {
    id: "per-001",
    first_name: "Carlos",
    last_name: "Reyes",
    email: "carlos.reyes@manilasteel.ph",
    phone: "+63 917 555 1234",
    job_title: "Procurement Manager",
    city: "Makati",
    company_id: "comp-001",
    company_name: "Manila Steel Corp",
    avatar_url: "",
    notes: "Primary contact for all orders, prefers email",
    created_at: "2025-11-15T08:00:00Z",
    updated_at: "2026-02-20T10:30:00Z",
    created_by: "Admin",
  },
  {
    id: "per-002",
    first_name: "Maria",
    last_name: "Santos",
    email: "maria.santos@pampangahardware.ph",
    phone: "+63 918 666 5678",
    job_title: "VP of Operations",
    city: "Quezon City",
    company_id: "comp-002",
    company_name: "Pampanga Hardware Co.",
    avatar_url: "",
    notes: "Decision maker for large contracts",
    created_at: "2025-10-01T08:00:00Z",
    updated_at: "2026-02-18T14:00:00Z",
    created_by: "Admin",
  },
  {
    id: "per-003",
    first_name: "Jun",
    last_name: "Aquino",
    email: "jun.aquino@cebuiron.ph",
    phone: "+63 920 255 9012",
    job_title: "Owner",
    city: "Cebu City",
    company_id: "comp-003",
    company_name: "Cebu Iron Works",
    avatar_url: "",
    notes: "Handles everything directly, very hands-on",
    created_at: "2025-12-10T08:00:00Z",
    updated_at: "2026-01-15T09:00:00Z",
    created_by: "Admin",
  },
  {
    id: "per-004",
    first_name: "Angela",
    last_name: "Lim",
    email: "angela.lim@davaobuilders.ph",
    phone: "+63 919 300 3456",
    job_title: "Supply Chain Director",
    city: "Davao City",
    company_id: "comp-004",
    company_name: "Davao Builders Supply",
    avatar_url: "",
    notes: "New contact, very responsive",
    created_at: "2026-01-05T08:00:00Z",
    updated_at: "2026-02-22T11:00:00Z",
    created_by: "Admin",
  },
  {
    id: "per-005",
    first_name: "Rico",
    last_name: "Dela Cruz",
    email: "rico@lagunaconstruction.ph",
    phone: "+63 917 777 7890",
    job_title: "General Manager",
    city: "Valenzuela",
    company_id: "comp-005",
    company_name: "Laguna Construction Supply",
    avatar_url: "",
    notes: "Always negotiates on price",
    created_at: "2026-01-20T08:00:00Z",
    updated_at: "2026-02-10T16:00:00Z",
    created_by: "Admin",
  },
  {
    id: "per-006",
    first_name: "Patricia",
    last_name: "Go",
    email: "patricia.go@manilasteel.ph",
    phone: "+63 918 555 4321",
    job_title: "Finance Manager",
    city: "Makati",
    company_id: "comp-001",
    company_name: "Manila Steel Corp",
    avatar_url: "",
    notes: "Handles payment approvals",
    created_at: "2026-01-10T08:00:00Z",
    updated_at: "2026-02-15T09:00:00Z",
    created_by: "Admin",
  },
  {
    id: "per-007",
    first_name: "Diego",
    last_name: "Tan",
    email: "diego.tan@pampangahardware.ph",
    phone: "+63 920 666 8765",
    job_title: "Project Engineer",
    city: "Quezon City",
    company_id: "comp-002",
    company_name: "Pampanga Hardware Co.",
    avatar_url: "",
    notes: "Technical contact for specifications",
    created_at: "2025-11-20T08:00:00Z",
    updated_at: "2026-02-01T12:00:00Z",
    created_by: "Admin",
  },
];

const MOCK_OPPORTUNITIES: CrmOpportunity[] = [
  {
    id: "opp-001",
    name: "Manila Steel Q1 Bulk Order",
    amount: 2500000,
    stage: "negotiation",
    close_date: "2026-03-15",
    probability: 75,
    company_id: "comp-001",
    company_name: "Manila Steel Corp",
    contact_id: "per-001",
    contact_name: "Carlos Reyes",
    notes: "Negotiating volume discount, expecting PO next week",
    created_at: "2026-01-15T08:00:00Z",
    updated_at: "2026-02-22T10:00:00Z",
    created_by: "Admin",
  },
  {
    id: "opp-002",
    name: "Pampanga Hardware Project Alpha",
    amount: 8500000,
    stage: "proposal",
    close_date: "2026-04-01",
    probability: 50,
    company_id: "comp-002",
    company_name: "Pampanga Hardware Co.",
    contact_id: "per-002",
    contact_name: "Maria Santos",
    notes: "Large infrastructure project, multi-phase delivery",
    created_at: "2026-01-20T08:00:00Z",
    updated_at: "2026-02-21T14:00:00Z",
    created_by: "Admin",
  },
  {
    id: "opp-003",
    name: "Cebu Iron Quarterly Supply",
    amount: 750000,
    stage: "meeting",
    close_date: "2026-03-30",
    probability: 30,
    company_id: "comp-003",
    company_name: "Cebu Iron Works",
    contact_id: "per-003",
    contact_name: "Jun Aquino",
    notes: "Initial meeting scheduled, exploring partnership",
    created_at: "2026-02-10T08:00:00Z",
    updated_at: "2026-02-20T09:00:00Z",
    created_by: "Admin",
  },
  {
    id: "opp-004",
    name: "Davao Builders Long-term Supply",
    amount: 12000000,
    stage: "incoming",
    close_date: "2026-06-01",
    probability: 20,
    company_id: "comp-004",
    company_name: "Davao Builders Supply",
    contact_id: "per-004",
    contact_name: "Angela Lim",
    notes: "Inbound inquiry, interested in annual supply contract",
    created_at: "2026-02-18T08:00:00Z",
    updated_at: "2026-02-22T11:00:00Z",
    created_by: "Admin",
  },
  {
    id: "opp-005",
    name: "Manila Steel Specialty Plates",
    amount: 1200000,
    stage: "closed_won",
    close_date: "2026-02-10",
    probability: 100,
    company_id: "comp-001",
    company_name: "Manila Steel Corp",
    contact_id: "per-006",
    contact_name: "Patricia Go",
    notes: "Delivered and paid, excellent margin",
    created_at: "2025-12-01T08:00:00Z",
    updated_at: "2026-02-10T16:00:00Z",
    created_by: "Admin",
  },
  {
    id: "opp-006",
    name: "Laguna Construction Spot Buy",
    amount: 350000,
    stage: "closed_lost",
    close_date: "2026-02-05",
    probability: 0,
    company_id: "comp-005",
    company_name: "Laguna Construction Supply",
    contact_id: "per-005",
    contact_name: "Rico Dela Cruz",
    notes: "Lost to competitor on pricing",
    created_at: "2026-01-10T08:00:00Z",
    updated_at: "2026-02-05T10:00:00Z",
    created_by: "Admin",
  },
  {
    id: "opp-007",
    name: "Pampanga Hardware Rebar Package",
    amount: 3200000,
    stage: "incoming",
    close_date: "2026-05-15",
    probability: 15,
    company_id: "comp-002",
    company_name: "Pampanga Hardware Co.",
    contact_id: "per-007",
    contact_name: "Diego Tan",
    notes: "New project tender, specs coming next week",
    created_at: "2026-02-20T08:00:00Z",
    updated_at: "2026-02-22T08:00:00Z",
    created_by: "Admin",
  },
  {
    id: "opp-008",
    name: "Cebu Iron Custom Fabrication",
    amount: 450000,
    stage: "meeting",
    close_date: "2026-04-10",
    probability: 35,
    company_id: "comp-003",
    company_name: "Cebu Iron Works",
    contact_id: "per-003",
    contact_name: "Jun Aquino",
    notes: "Custom cut requirements, need technical review",
    created_at: "2026-02-15T08:00:00Z",
    updated_at: "2026-02-21T15:00:00Z",
    created_by: "Admin",
  },
];

const MOCK_ACTIVITIES: CrmActivity[] = [
  {
    id: "act-001",
    type: "call",
    subject: "Follow-up on Q1 order",
    description: "Discussed volume pricing and delivery schedule",
    related_type: "opportunity",
    related_id: "opp-001",
    due_date: null,
    completed: true,
    created_at: "2026-02-20T10:00:00Z",
    created_by: "Admin",
  },
  {
    id: "act-002",
    type: "email",
    subject: "Sent proposal for Project Alpha",
    description: "Formal proposal with pricing breakdown and delivery timeline",
    related_type: "opportunity",
    related_id: "opp-002",
    due_date: null,
    completed: true,
    created_at: "2026-02-21T14:00:00Z",
    created_by: "Admin",
  },
  {
    id: "act-003",
    type: "meeting",
    subject: "Site visit scheduled",
    description: "Visit Cebu Iron Works facility to assess requirements",
    related_type: "company",
    related_id: "comp-003",
    due_date: "2026-03-01",
    completed: false,
    created_at: "2026-02-22T09:00:00Z",
    created_by: "Admin",
  },
  {
    id: "act-004",
    type: "note",
    subject: "Payment follow-up needed",
    description: "Patricia mentioned delayed payment approval process",
    related_type: "person",
    related_id: "per-006",
    due_date: null,
    completed: false,
    created_at: "2026-02-22T11:30:00Z",
    created_by: "Admin",
  },
  {
    id: "act-005",
    type: "task",
    subject: "Prepare supply contract draft",
    description: "Draft annual supply agreement terms for Davao Builders Supply",
    related_type: "opportunity",
    related_id: "opp-004",
    due_date: "2026-02-28",
    completed: false,
    created_at: "2026-02-22T12:00:00Z",
    created_by: "Admin",
  },
];

const MOCK_QUOTATIONS: SavedQuotation[] = [
  {
    id: "qt-mock-001",
    quotation_number: "QT-MSC001",
    opportunity_id: "opp-001",
    company_name: "Manila Steel Corp",
    contact_name: "Carlos Reyes",
    deal_name: "Manila Steel Q1 Bulk Order",
    quotation_date: "2026-02-10",
    notes: "Volume discount applied per negotiation",
    shipping_method: "truck",
    shipping_fee: 15000,
    subtotal: 2340000,
    tax: 280800,
    total: 2635800,
    status: "approved",
    created_by: "Admin",
    created_at: "2026-02-10T08:00:00Z",
    approved_by: "Admin",
    approved_at: "2026-02-12T14:30:00Z",
    approval_notes: "Volume discount confirmed at 5%. Proceed with delivery schedule.",
    rejected_by: null,
    rejected_at: null,
    rejection_notes: null,
    items: [
      {
        product_id: 1001,
        product_name: "Deformed Rebar 10mm x 6m",
        sku: "RB-10-6M",
        category_name: "Rebar",
        quantity: 500,
        price_per_kg: 52,
        weight_per_piece: 3.7,
      },
      {
        product_id: 1002,
        product_name: "Deformed Rebar 12mm x 6m",
        sku: "RB-12-6M",
        category_name: "Rebar",
        quantity: 400,
        price_per_kg: 52,
        weight_per_piece: 5.3,
      },
      {
        product_id: 1003,
        product_name: "Deformed Rebar 16mm x 6m",
        sku: "RB-16-6M",
        category_name: "Rebar",
        quantity: 300,
        price_per_kg: 54,
        weight_per_piece: 9.5,
      },
    ],
  },
  {
    id: "qt-mock-002",
    quotation_number: "QT-PBI001",
    opportunity_id: "opp-002",
    company_name: "Pampanga Hardware Co.",
    contact_name: "Maria Santos",
    deal_name: "Pampanga Hardware Project Alpha",
    quotation_date: "2026-02-15",
    notes: "Multi-phase delivery, Phase 1 materials",
    shipping_method: "truck",
    shipping_fee: 35000,
    subtotal: 8050000,
    tax: 966000,
    total: 9051000,
    status: "approved",
    created_by: "Admin",
    created_at: "2026-02-15T10:00:00Z",
    approved_by: "Admin",
    approved_at: "2026-02-18T09:00:00Z",
    approval_notes: "Phase 1 approved. Phase 2 pricing to be reviewed separately.",
    rejected_by: null,
    rejected_at: null,
    rejection_notes: null,
    items: [
      {
        product_id: 2001,
        product_name: "Steel Plate 6mm x 4ft x 8ft",
        sku: "SP-6-4x8",
        category_name: "Steel Plates",
        quantity: 120,
        price_per_kg: 68,
        weight_per_piece: 47,
      },
      {
        product_id: 2002,
        product_name: "Angle Bar 50x50x5mm x 6m",
        sku: "AB-50-6M",
        category_name: "Angle Bars",
        quantity: 600,
        price_per_kg: 58,
        weight_per_piece: 7.1,
      },
      {
        product_id: 2003,
        product_name: "Flat Bar 50x6mm x 6m",
        sku: "FB-50-6M",
        category_name: "Flat Bars",
        quantity: 800,
        price_per_kg: 56,
        weight_per_piece: 4.5,
      },
      {
        product_id: 1003,
        product_name: "Deformed Rebar 16mm x 6m",
        sku: "RB-16-6M",
        category_name: "Rebar",
        quantity: 1000,
        price_per_kg: 54,
        weight_per_piece: 9.5,
      },
    ],
  },
  {
    id: "qt-mock-003",
    quotation_number: "QT-CIW001",
    opportunity_id: "opp-003",
    company_name: "Cebu Iron Works",
    contact_name: "Jun Aquino",
    deal_name: "Cebu Iron Quarterly Supply",
    quotation_date: "2026-02-20",
    notes: "Pending review, initial supply quote",
    shipping_method: "shipment",
    shipping_fee: 25000,
    subtotal: 696000,
    tax: 83520,
    total: 804520,
    status: "draft",
    created_by: "Admin",
    created_at: "2026-02-20T11:00:00Z",
    approved_by: null,
    approved_at: null,
    approval_notes: null,
    rejected_by: null,
    rejected_at: null,
    rejection_notes: null,
    items: [
      {
        product_id: 1001,
        product_name: "Deformed Rebar 10mm x 6m",
        sku: "RB-10-6M",
        category_name: "Rebar",
        quantity: 200,
        price_per_kg: 52,
        weight_per_piece: 3.7,
      },
      {
        product_id: 3001,
        product_name: "Angle Bar 40x40x4mm x 6m",
        sku: "AB-40-6M",
        category_name: "Angle Bars",
        quantity: 300,
        price_per_kg: 58,
        weight_per_piece: 2.84,
      },
    ],
  },
  {
    id: "qt-mock-004",
    quotation_number: "QT-DHI001",
    opportunity_id: "opp-004",
    company_name: "Davao Builders Supply",
    contact_name: "Angela Lim",
    deal_name: "Davao Builders Long-term Supply",
    quotation_date: "2026-02-19",
    notes: "Annual supply initial quote — steel plates, rebar, and angle bars",
    shipping_method: "truck",
    shipping_fee: 45000,
    subtotal: 5280000,
    tax: 633600,
    total: 5958600,
    status: "draft",
    created_by: "Admin",
    created_at: "2026-02-19T09:00:00Z",
    approved_by: null,
    approved_at: null,
    approval_notes: null,
    rejected_by: null,
    rejected_at: null,
    rejection_notes: null,
    items: [
      {
        product_id: 2001,
        product_name: "Steel Plate 6mm x 4ft x 8ft",
        sku: "SP-6-4x8",
        category_name: "Steel Plates",
        quantity: 80,
        price_per_kg: 68,
        weight_per_piece: 47,
      },
      {
        product_id: 1001,
        product_name: "Deformed Rebar 10mm x 6m",
        sku: "RB-10-6M",
        category_name: "Rebar",
        quantity: 600,
        price_per_kg: 52,
        weight_per_piece: 3.7,
      },
      {
        product_id: 2002,
        product_name: "Angle Bar 50x50x5mm x 6m",
        sku: "AB-50-6M",
        category_name: "Angle Bars",
        quantity: 400,
        price_per_kg: 58,
        weight_per_piece: 7.1,
      },
    ],
  },
  {
    id: "qt-mock-005",
    quotation_number: "QT-MSC002",
    opportunity_id: "opp-005",
    company_name: "Manila Steel Corp",
    contact_name: "Patricia Go",
    deal_name: "Manila Steel Specialty Plates",
    quotation_date: "2026-01-28",
    notes: "Specialty plate order — won deal",
    shipping_method: "truck",
    shipping_fee: 12000,
    subtotal: 1128000,
    tax: 135360,
    total: 1275360,
    status: "approved",
    created_by: "Admin",
    created_at: "2026-01-28T10:00:00Z",
    approved_by: "Admin",
    approved_at: "2026-01-30T11:00:00Z",
    approval_notes: "Specialty plate pricing confirmed. Delivery within 2 weeks.",
    rejected_by: null,
    rejected_at: null,
    rejection_notes: null,
    items: [
      {
        product_id: 2001,
        product_name: "Steel Plate 6mm x 4ft x 8ft",
        sku: "SP-6-4x8",
        category_name: "Steel Plates",
        quantity: 100,
        price_per_kg: 68,
        weight_per_piece: 47,
      },
      {
        product_id: 2003,
        product_name: "Flat Bar 50x6mm x 6m",
        sku: "FB-50-6M",
        category_name: "Flat Bars",
        quantity: 200,
        price_per_kg: 56,
        weight_per_piece: 4.5,
      },
    ],
  },
  {
    id: "qt-mock-006",
    quotation_number: "QT-LRS001",
    opportunity_id: "opp-006",
    company_name: "Laguna Construction Supply",
    contact_name: "Rico Dela Cruz",
    deal_name: "Laguna Construction Spot Buy",
    quotation_date: "2026-01-15",
    notes: "Spot buy pricing — lost on competitor pricing",
    shipping_method: "pickup",
    shipping_fee: 0,
    subtotal: 330200,
    tax: 39624,
    total: 369824,
    status: "rejected",
    created_by: "Admin",
    created_at: "2026-01-15T14:00:00Z",
    approved_by: null,
    approved_at: null,
    approval_notes: null,
    rejected_by: "Admin",
    rejected_at: "2026-01-20T09:00:00Z",
    rejection_notes: "Client found lower pricing from competitor. Cannot match without going below margin threshold.",
    items: [
      {
        product_id: 1001,
        product_name: "Deformed Rebar 10mm x 6m",
        sku: "RB-10-6M",
        category_name: "Rebar",
        quantity: 300,
        price_per_kg: 52,
        weight_per_piece: 3.7,
      },
      {
        product_id: 1002,
        product_name: "Deformed Rebar 12mm x 6m",
        sku: "RB-12-6M",
        category_name: "Rebar",
        quantity: 250,
        price_per_kg: 52,
        weight_per_piece: 5.3,
      },
    ],
  },
  {
    id: "qt-mock-007",
    quotation_number: "QT-PBI002",
    opportunity_id: "opp-007",
    company_name: "Pampanga Hardware Co.",
    contact_name: "Diego Tan",
    deal_name: "Pampanga Hardware Rebar Package",
    quotation_date: "2026-02-21",
    notes: "New tender quote — rebar, flat bars, and angle bars",
    shipping_method: "truck",
    shipping_fee: 28000,
    subtotal: 2946000,
    tax: 353520,
    total: 3327520,
    status: "draft",
    created_by: "Admin",
    created_at: "2026-02-21T08:30:00Z",
    approved_by: null,
    approved_at: null,
    approval_notes: null,
    rejected_by: null,
    rejected_at: null,
    rejection_notes: null,
    items: [
      {
        product_id: 1003,
        product_name: "Deformed Rebar 16mm x 6m",
        sku: "RB-16-6M",
        category_name: "Rebar",
        quantity: 500,
        price_per_kg: 54,
        weight_per_piece: 9.5,
      },
      {
        product_id: 2003,
        product_name: "Flat Bar 50x6mm x 6m",
        sku: "FB-50-6M",
        category_name: "Flat Bars",
        quantity: 350,
        price_per_kg: 56,
        weight_per_piece: 4.5,
      },
      {
        product_id: 3001,
        product_name: "Angle Bar 40x40x4mm x 6m",
        sku: "AB-40-6M",
        category_name: "Angle Bars",
        quantity: 450,
        price_per_kg: 58,
        weight_per_piece: 2.84,
      },
    ],
  },
  {
    id: "qt-mock-008",
    quotation_number: "QT-CIW002",
    opportunity_id: "opp-008",
    company_name: "Cebu Iron Works",
    contact_name: "Jun Aquino",
    deal_name: "Cebu Iron Custom Fabrication",
    quotation_date: "2026-02-22",
    notes: "Custom cut items for fabrication project",
    shipping_method: "shipment",
    shipping_fee: 18000,
    subtotal: 415800,
    tax: 49896,
    total: 483696,
    status: "draft",
    created_by: "Admin",
    created_at: "2026-02-22T10:00:00Z",
    approved_by: null,
    approved_at: null,
    approval_notes: null,
    rejected_by: null,
    rejected_at: null,
    rejection_notes: null,
    items: [
      {
        product_id: 2001,
        product_name: "Steel Plate 6mm x 4ft x 8ft",
        sku: "SP-6-4x8",
        category_name: "Steel Plates",
        quantity: 30,
        price_per_kg: 68,
        weight_per_piece: 47,
      },
      {
        product_id: 2003,
        product_name: "Flat Bar 50x6mm x 6m",
        sku: "FB-50-6M",
        category_name: "Flat Bars",
        quantity: 150,
        price_per_kg: 56,
        weight_per_piece: 4.5,
      },
    ],
  },
];

/* ── Query Functions ── */

// Simulate async delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* People */
export async function getCrmPeople(): Promise<CrmPerson[]> {
  await delay(300);
  return [...MOCK_PEOPLE];
}

export async function getCrmPerson(id: string): Promise<CrmPerson | null> {
  await delay(200);
  return MOCK_PEOPLE.find((p) => p.id === id) ?? null;
}

export async function createCrmPerson(
  person: Omit<CrmPerson, "id" | "created_at" | "updated_at">
): Promise<CrmPerson> {
  await delay(300);
  const newPerson: CrmPerson = {
    ...person,
    id: `per-${String(MOCK_PEOPLE.length + 1).padStart(3, "0")}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  MOCK_PEOPLE.push(newPerson);
  return newPerson;
}

export async function updateCrmPerson(
  id: string,
  updates: Partial<CrmPerson>
): Promise<CrmPerson | null> {
  await delay(300);
  const idx = MOCK_PEOPLE.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  MOCK_PEOPLE[idx] = { ...MOCK_PEOPLE[idx], ...updates, updated_at: new Date().toISOString() };
  return MOCK_PEOPLE[idx];
}

export async function deleteCrmPerson(id: string): Promise<boolean> {
  await delay(200);
  const idx = MOCK_PEOPLE.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  MOCK_PEOPLE.splice(idx, 1);
  return true;
}

/* Companies */
export async function getCrmCompanies(): Promise<CrmCompany[]> {
  await delay(300);
  return [...MOCK_COMPANIES];
}

export async function getCrmCompany(id: string): Promise<CrmCompany | null> {
  await delay(200);
  return MOCK_COMPANIES.find((c) => c.id === id) ?? null;
}

export async function createCrmCompany(
  company: Omit<CrmCompany, "id" | "created_at" | "updated_at">
): Promise<CrmCompany> {
  await delay(300);
  const newCompany: CrmCompany = {
    ...company,
    id: `comp-${String(MOCK_COMPANIES.length + 1).padStart(3, "0")}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  MOCK_COMPANIES.push(newCompany);
  return newCompany;
}

export async function updateCrmCompany(
  id: string,
  updates: Partial<CrmCompany>
): Promise<CrmCompany | null> {
  await delay(300);
  const idx = MOCK_COMPANIES.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  MOCK_COMPANIES[idx] = { ...MOCK_COMPANIES[idx], ...updates, updated_at: new Date().toISOString() };
  return MOCK_COMPANIES[idx];
}

export async function deleteCrmCompany(id: string): Promise<boolean> {
  await delay(200);
  const idx = MOCK_COMPANIES.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  MOCK_COMPANIES.splice(idx, 1);
  return true;
}

/* Opportunities */
export async function getCrmOpportunities(): Promise<CrmOpportunity[]> {
  await delay(300);
  return [...MOCK_OPPORTUNITIES];
}

export async function getCrmOpportunity(id: string): Promise<CrmOpportunity | null> {
  await delay(200);
  return MOCK_OPPORTUNITIES.find((o) => o.id === id) ?? null;
}

export async function createCrmOpportunity(
  opportunity: Omit<CrmOpportunity, "id" | "created_at" | "updated_at">
): Promise<CrmOpportunity> {
  await delay(300);
  const newOpp: CrmOpportunity = {
    ...opportunity,
    id: `opp-${String(MOCK_OPPORTUNITIES.length + 1).padStart(3, "0")}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  MOCK_OPPORTUNITIES.push(newOpp);
  return newOpp;
}

export async function updateCrmOpportunity(
  id: string,
  updates: Partial<CrmOpportunity>
): Promise<CrmOpportunity | null> {
  await delay(300);
  const idx = MOCK_OPPORTUNITIES.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  MOCK_OPPORTUNITIES[idx] = {
    ...MOCK_OPPORTUNITIES[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return MOCK_OPPORTUNITIES[idx];
}

export async function deleteCrmOpportunity(id: string): Promise<boolean> {
  await delay(200);
  const idx = MOCK_OPPORTUNITIES.findIndex((o) => o.id === id);
  if (idx === -1) return false;
  MOCK_OPPORTUNITIES.splice(idx, 1);
  return true;
}

/* Activities */
export async function getCrmActivities(
  relatedType?: string,
  relatedId?: string
): Promise<CrmActivity[]> {
  await delay(200);
  let results = [...MOCK_ACTIVITIES];
  if (relatedType && relatedId) {
    results = results.filter((a) => a.related_type === relatedType && a.related_id === relatedId);
  }
  return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createCrmActivity(
  activity: Omit<CrmActivity, "id" | "created_at">
): Promise<CrmActivity> {
  await delay(200);
  const newActivity: CrmActivity = {
    ...activity,
    id: `act-${String(MOCK_ACTIVITIES.length + 1).padStart(3, "0")}`,
    created_at: new Date().toISOString(),
  };
  MOCK_ACTIVITIES.push(newActivity);
  return newActivity;
}

/* Stats */
export async function getCrmStats() {
  await delay(200);
  const totalPeople = MOCK_PEOPLE.length;
  const totalCompanies = MOCK_COMPANIES.length;
  const totalOpportunities = MOCK_OPPORTUNITIES.filter(
    (o) => o.stage !== "closed_won" && o.stage !== "closed_lost"
  ).length;
  const pipelineValue = MOCK_OPPORTUNITIES.filter(
    (o) => o.stage !== "closed_won" && o.stage !== "closed_lost"
  ).reduce((sum, o) => sum + o.amount, 0);
  const wonValue = MOCK_OPPORTUNITIES.filter((o) => o.stage === "closed_won").reduce(
    (sum, o) => sum + o.amount,
    0
  );
  const lostValue = MOCK_OPPORTUNITIES.filter((o) => o.stage === "closed_lost").reduce(
    (sum, o) => sum + o.amount,
    0
  );

  return {
    totalPeople,
    totalCompanies,
    totalOpportunities,
    pipelineValue,
    wonValue,
    lostValue,
  };
}

/* Search helpers */
export async function searchCrmPeople(query: string): Promise<CrmPerson[]> {
  await delay(200);
  const q = query.toLowerCase();
  return MOCK_PEOPLE.filter(
    (p) =>
      p.first_name.toLowerCase().includes(q) ||
      p.last_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.company_name ?? "").toLowerCase().includes(q) ||
      p.job_title.toLowerCase().includes(q)
  );
}

export async function searchCrmCompanies(query: string): Promise<CrmCompany[]> {
  await delay(200);
  const q = query.toLowerCase();
  return MOCK_COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
  );
}

/* ══════════════════════════════════════════
   PIPELINE STAGES — localStorage-backed
   ══════════════════════════════════════════ */

const STAGES_STORAGE_KEY = "regan_crm_stages";

export function readCustomStages(): StageConfig[] {
  if (typeof window === "undefined") return [...DEFAULT_STAGES];
  try {
    const raw = localStorage.getItem(STAGES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StageConfig[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    return [...DEFAULT_STAGES];
  } catch {
    return [...DEFAULT_STAGES];
  }
}

export function writeCustomStages(stages: StageConfig[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STAGES_STORAGE_KEY, JSON.stringify(stages));
  } catch {
    // localStorage full or unavailable
  }
}

export async function getStages(): Promise<StageConfig[]> {
  await delay(50);
  return readCustomStages();
}

export async function saveStages(stages: StageConfig[]): Promise<void> {
  await delay(50);
  writeCustomStages(stages);
}

/* ══════════════════════════════════════════
   QUOTATIONS — localStorage-backed
   ══════════════════════════════════════════ */

const QUOT_STORAGE_KEY = "regan_quotations";
const QUOT_DATA_VERSION = "3"; // bump when MOCK_QUOTATIONS changes
const QUOT_VERSION_KEY = "regan_quotations_version";

function readQuotations(): SavedQuotation[] {
  if (typeof window === "undefined") return [];
  try {
    const storedVersion = localStorage.getItem(QUOT_VERSION_KEY);
    if (storedVersion !== QUOT_DATA_VERSION) {
      // Mock data changed — reseed
      writeQuotations(MOCK_QUOTATIONS);
      localStorage.setItem(QUOT_VERSION_KEY, QUOT_DATA_VERSION);
      return [...MOCK_QUOTATIONS];
    }
    const raw = localStorage.getItem(QUOT_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SavedQuotation[];
    writeQuotations(MOCK_QUOTATIONS);
    localStorage.setItem(QUOT_VERSION_KEY, QUOT_DATA_VERSION);
    return [...MOCK_QUOTATIONS];
  } catch {
    return [];
  }
}

function writeQuotations(quotations: SavedQuotation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUOT_STORAGE_KEY, JSON.stringify(quotations));
  } catch {
    // localStorage full or unavailable
  }
}

export async function saveQuotation(
  data: Omit<SavedQuotation, "id" | "status" | "created_at" | "approved_by" | "approved_at" | "approval_notes" | "rejected_by" | "rejected_at" | "rejection_notes">,
  items: SavedQuotationItem[],
): Promise<SavedQuotation> {
  await delay(300);
  const quotation: SavedQuotation = {
    ...data,
    id: `qt-${Date.now()}`,
    status: "draft",
    created_at: new Date().toISOString(),
    approved_by: null,
    approved_at: null,
    approval_notes: null,
    rejected_by: null,
    rejected_at: null,
    rejection_notes: null,
    items,
  };
  const all = readQuotations();
  all.unshift(quotation);
  writeQuotations(all);
  return quotation;
}

export async function getQuotationsByOpportunity(opportunityId: string): Promise<SavedQuotation[]> {
  await delay(150);
  return readQuotations().filter((q) => q.opportunity_id === opportunityId);
}

export async function approveQuotation(id: string, approvedBy: string, approvalNotes?: string): Promise<SavedQuotation | null> {
  await delay(200);
  const all = readQuotations();
  const idx = all.findIndex((q) => q.id === id);
  if (idx === -1) return null;
  all[idx] = {
    ...all[idx],
    status: "approved",
    approved_by: approvedBy,
    approved_at: new Date().toISOString(),
    approval_notes: approvalNotes ?? null,
  };
  writeQuotations(all);
  return all[idx];
}

export async function rejectQuotation(id: string, rejectedBy: string, rejectionNotes?: string): Promise<SavedQuotation | null> {
  await delay(200);
  const all = readQuotations();
  const idx = all.findIndex((q) => q.id === id);
  if (idx === -1) return null;
  all[idx] = {
    ...all[idx],
    status: "rejected",
    rejected_by: rejectedBy,
    rejected_at: new Date().toISOString(),
    rejection_notes: rejectionNotes ?? null,
  };
  writeQuotations(all);
  return all[idx];
}

export async function getApprovedQuotationByNumber(quotationNumber: string): Promise<SavedQuotation | null> {
  await delay(200);
  const all = readQuotations();
  const found = all.find((q) => q.quotation_number === quotationNumber);
  if (!found || found.status !== "approved") return null;
  return found;
}
