/**
 * Landing AI Agentic Document Extraction — PO schema & types.
 *
 * The JSON schema is sent to the Landing AI extract() endpoint.
 * The TypeScript types mirror the schema for client-side use.
 */

/* ── TypeScript types ─────────────────────────────── */

export interface ExtractedPurchaseOrder {
  client_name: string | null;
  contact_person: string | null;
  po_number: string | null;
  po_date: string | null;
  ship_to_address: string | null;
  ship_to_city: string | null;
  notes: string | null;
  items: ExtractedLineItem[];
}

export interface ExtractedLineItem {
  product_name: string;
  quantity: number | null;
  price: number | null;
  unit: string | null;
  size: string | null;
  thickness: string | null;
}

/* ── JSON Schema for Landing AI ───────────────────── */

export const purchaseOrderJsonSchema = {
  type: "object",
  properties: {
    client_name: {
      type: ["string", "null"],
      description:
        "The name of the buyer, client, or customer company on the purchase order. Look for fields labeled 'Bill To', 'Buyer', 'Customer', 'Ordered By', or the company name at the top.",
    },
    contact_person: {
      type: ["string", "null"],
      description:
        "The contact person name of the buyer. Look for 'Attn', 'Attention', 'Contact Person'.",
    },
    po_number: {
      type: ["string", "null"],
      description:
        "The purchase order number or reference number. Look for 'PO #', 'PO Number', 'Order No', 'Reference'.",
    },
    po_date: {
      type: ["string", "null"],
      description:
        "The date on the purchase order in ISO format (YYYY-MM-DD) if possible. Look for 'Date', 'PO Date', 'Order Date'.",
    },
    ship_to_address: {
      type: ["string", "null"],
      description:
        "The shipping or delivery address. Look for 'Ship To', 'Deliver To', 'Delivery Address'.",
    },
    ship_to_city: {
      type: ["string", "null"],
      description: "The city of the shipping address.",
    },
    notes: {
      type: ["string", "null"],
      description:
        "Any general notes, remarks, or special instructions on the purchase order.",
    },
    items: {
      type: "array",
      description:
        "The list of line items or products being ordered. Each row in the items table on the PO.",
      items: {
        type: "object",
        properties: {
          product_name: {
            type: "string",
            description:
              "The product name, description, or item description. Include the full description as written.",
          },
          quantity: {
            type: ["number", "null"],
            description:
              "The quantity ordered. Look for 'Qty', 'Quantity', 'Pcs', 'Order Qty'. Should be a number.",
          },
          price: {
            type: ["number", "null"],
            description:
              "The unit price, price per kg, or rate. Look for 'Price', 'Unit Price', 'Rate', 'Price/kg'. Should be a number without currency symbols.",
          },
          unit: {
            type: ["string", "null"],
            description:
              "The unit of measure: 'pcs', 'kg', 'meters', 'lengths', etc.",
          },
          size: {
            type: ["string", "null"],
            description:
              "The product size if mentioned, e.g., '2 x 4', '1/2 inch', '50mm'.",
          },
          thickness: {
            type: ["string", "null"],
            description:
              "The product thickness if mentioned, e.g., '1.2mm', '0.5mm'.",
          },
        },
        required: ["product_name"],
      },
    },
  },
  required: ["items"],
};
