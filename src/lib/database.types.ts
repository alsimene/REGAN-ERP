export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: never
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: never
          name?: string
        }
        Relationships: []
      }
      client_warehouses: {
        Row: {
          address: string | null
          city: string | null
          client_id: number
          contact_person: string | null
          created_at: string
          created_by: string | null
          id: number
          is_default: boolean
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          client_id: number
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          id?: never
          is_default?: boolean
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          client_id?: number
          contact_person?: string | null
          created_at?: string
          created_by?: string | null
          id?: never
          is_default?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_warehouses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_sales_summary"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "client_warehouses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_warehouses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "company_crm_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_warehouses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contact_with_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "client_warehouses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "opportunity_pipeline"
            referencedColumns: ["company_id"]
          },
        ]
      }
      clients: {
        Row: {
          account_owner: string | null
          address: string | null
          annual_revenue: number | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          employee_count: number | null
          id: number
          industry: string | null
          is_active: boolean | null
          linkedin_url: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          account_owner?: string | null
          address?: string | null
          annual_revenue?: number | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          employee_count?: number | null
          id?: never
          industry?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          account_owner?: string | null
          address?: string | null
          annual_revenue?: number | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          employee_count?: number | null
          id?: never
          industry?: string | null
          is_active?: boolean | null
          linkedin_url?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          code: string
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          city: string | null
          company_id: number | null
          country: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          first_name: string
          id: number
          is_primary: boolean | null
          job_title: string | null
          last_name: string
          linkedin_url: string | null
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          company_id?: number | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          first_name: string
          id?: never
          is_primary?: boolean | null
          job_title?: string | null
          last_name: string
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          company_id?: number | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          first_name?: string
          id?: never
          is_primary?: boolean | null
          job_title?: string | null
          last_name?: string
          linkedin_url?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "client_sales_summary"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_crm_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "contact_with_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "opportunity_pipeline"
            referencedColumns: ["company_id"]
          },
        ]
      }
      crm_activities: {
        Row: {
          activity_type: string
          company_id: number | null
          contact_id: number | null
          description: string | null
          id: number
          metadata: Json | null
          opportunity_id: number | null
          performed_at: string | null
          performed_by: string
          subject: string | null
        }
        Insert: {
          activity_type: string
          company_id?: number | null
          contact_id?: number | null
          description?: string | null
          id?: never
          metadata?: Json | null
          opportunity_id?: number | null
          performed_at?: string | null
          performed_by: string
          subject?: string | null
        }
        Update: {
          activity_type?: string
          company_id?: number | null
          contact_id?: number | null
          description?: string | null
          id?: never
          metadata?: Json | null
          opportunity_id?: number | null
          performed_at?: string | null
          performed_by?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "client_sales_summary"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "crm_activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_crm_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "contact_with_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "crm_activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "opportunity_pipeline"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "crm_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "opportunity_pipeline"
            referencedColumns: ["contact_id"]
          },
          {
            foreignKeyName: "crm_activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunity_pipeline"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          created_at: string | null
          delivered_at: string
          id: number
          notes: string | null
          order_id: number
          processed_by: string | null
          processed_by_name: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string
          id?: never
          notes?: string | null
          order_id: number
          processed_by?: string | null
          processed_by_name?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string
          id?: never
          notes?: string | null
          order_id?: number
          processed_by?: string | null
          processed_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_summary"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_items: {
        Row: {
          created_at: string | null
          delivery_id: number
          id: number
          order_item_id: number
          qty: number
        }
        Insert: {
          created_at?: string | null
          delivery_id: number
          id?: never
          order_item_id: number
          qty: number
        }
        Update: {
          created_at?: string | null
          delivery_id?: number
          id?: never
          order_item_id?: number
          qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "delivery_items_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      market_prices: {
        Row: {
          category_id: number | null
          created_at: string | null
          effective_date: string | null
          id: number
          is_active: boolean | null
          notes: string | null
          price_per_kg: number
          updated_by: string | null
        }
        Insert: {
          category_id?: number | null
          created_at?: string | null
          effective_date?: string | null
          id?: never
          is_active?: boolean | null
          notes?: string | null
          price_per_kg: number
          updated_by?: string | null
        }
        Update: {
          category_id?: number | null
          created_at?: string | null
          effective_date?: string | null
          id?: never
          is_active?: boolean | null
          notes?: string | null
          price_per_kg?: number
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_prices_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_prices_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "current_market_prices"
            referencedColumns: ["category_id"]
          },
        ]
      }
      opportunities: {
        Row: {
          amount: number | null
          close_date: string | null
          company_id: number | null
          contact_id: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          id: number
          lost_reason: string | null
          name: string
          notes: string | null
          owner: string | null
          probability: number | null
          source: string | null
          stage: string
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          close_date?: string | null
          company_id?: number | null
          contact_id?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: never
          lost_reason?: string | null
          name: string
          notes?: string | null
          owner?: string | null
          probability?: number | null
          source?: string | null
          stage?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          close_date?: string | null
          company_id?: number | null
          contact_id?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: never
          lost_reason?: string | null
          name?: string
          notes?: string | null
          owner?: string | null
          probability?: number | null
          source?: string | null
          stage?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "client_sales_summary"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_crm_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "contact_with_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "opportunity_pipeline"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contact_with_company"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "opportunity_pipeline"
            referencedColumns: ["contact_id"]
          },
        ]
      }
      order_approvals: {
        Row: {
          action: string
          created_at: string | null
          id: number
          notes: string | null
          order_id: number
          performed_by: string | null
          performed_by_name: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: never
          notes?: string | null
          order_id: number
          performed_by?: string | null
          performed_by_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: never
          notes?: string | null
          order_id?: number
          performed_by?: string | null
          performed_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_approvals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_summary"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_approvals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          classification: string
          created_at: string | null
          delivered_qty: number
          id: number
          line_total: number | null
          order_id: number
          price_per_kg: number
          product_id: number
          quantity: number
          total_weight: number | null
          warehouse_id: number | null
          weight_per_piece: number
        }
        Insert: {
          classification?: string
          created_at?: string | null
          delivered_qty?: number
          id?: never
          line_total?: number | null
          order_id: number
          price_per_kg: number
          product_id: number
          quantity: number
          total_weight?: number | null
          warehouse_id?: number | null
          weight_per_piece: number
        }
        Update: {
          classification?: string
          created_at?: string | null
          delivered_qty?: number
          id?: never
          line_total?: number | null
          order_id?: number
          price_per_kg?: number
          product_id?: number
          quantity?: number
          total_weight?: number | null
          warehouse_id?: number | null
          weight_per_piece?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_summary"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "company_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouse_inventory"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "order_items_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          client_id: number
          client_warehouse_id: number | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          created_by: string | null
          id: number
          notes: string | null
          order_date: string | null
          order_number: string
          payment_status: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_notes: string | null
          salesperson: string | null
          status: string
          subtotal: number | null
          supplier_id: number | null
          tax: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          client_id: number
          client_warehouse_id?: number | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: never
          notes?: string | null
          order_date?: string | null
          order_number: string
          payment_status?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_notes?: string | null
          salesperson?: string | null
          status?: string
          subtotal?: number | null
          supplier_id?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          client_id?: number
          client_warehouse_id?: number | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: never
          notes?: string | null
          order_date?: string | null
          order_number?: string
          payment_status?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_notes?: string | null
          salesperson?: string | null
          status?: string
          subtotal?: number | null
          supplier_id?: number | null
          tax?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client_sales_summary"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "company_crm_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "contact_with_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "opportunity_pipeline"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "orders_client_warehouse_id_fkey"
            columns: ["client_warehouse_id"]
            isOneToOne: false
            referencedRelation: "client_warehouses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "client_sales_summary"
            referencedColumns: ["client_id"]
          },
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "company_crm_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "contact_with_company"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "opportunity_pipeline"
            referencedColumns: ["company_id"]
          },
        ]
      }
      products: {
        Row: {
          capacity: number | null
          category_id: number
          created_at: string | null
          id: number
          kg_per_m: number | null
          length_m: number | null
          name: string
          sku: string
          specs: Json
          unit: string | null
          weight_per_length: number | null
        }
        Insert: {
          capacity?: number | null
          category_id: number
          created_at?: string | null
          id?: never
          kg_per_m?: number | null
          length_m?: number | null
          name: string
          sku: string
          specs?: Json
          unit?: string | null
          weight_per_length?: number | null
        }
        Update: {
          capacity?: number | null
          category_id?: number
          created_at?: string | null
          id?: never
          kg_per_m?: number | null
          length_m?: number | null
          name?: string
          sku?: string
          specs?: Json
          unit?: string | null
          weight_per_length?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "current_market_prices"
            referencedColumns: ["category_id"]
          },
        ]
      }
      shipments: {
        Row: {
          carrier: string | null
          created_at: string | null
          delivered_at: string | null
          departed_at: string | null
          destination: string | null
          eta: string | null
          id: number
          notes: string | null
          order_id: number
          shipment_number: string
          status: string
          total_weight_kg: number | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string | null
          delivered_at?: string | null
          departed_at?: string | null
          destination?: string | null
          eta?: string | null
          id?: never
          notes?: string | null
          order_id: number
          shipment_number: string
          status?: string
          total_weight_kg?: number | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string | null
          delivered_at?: string | null
          departed_at?: string | null
          destination?: string | null
          eta?: string | null
          id?: never
          notes?: string | null
          order_id?: number
          shipment_number?: string
          status?: string
          total_weight_kg?: number | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "order_summary"
            referencedColumns: ["order_id"]
          },
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          classification: string
          created_at: string | null
          id: number
          movement_type: string
          notes: string | null
          performed_by: string | null
          product_id: number
          quantity: number
          reference_id: string | null
          warehouse_id: number
        }
        Insert: {
          classification: string
          created_at?: string | null
          id?: never
          movement_type: string
          notes?: string | null
          performed_by?: string | null
          product_id: number
          quantity: number
          reference_id?: string | null
          warehouse_id: number
        }
        Update: {
          classification?: string
          created_at?: string | null
          id?: never
          movement_type?: string
          notes?: string | null
          performed_by?: string | null
          product_id?: number
          quantity?: number
          reference_id?: string | null
          warehouse_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "company_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouse_inventory"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "stock_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_stock: {
        Row: {
          c1: number | null
          c2: number | null
          c3: number | null
          id: number
          product_id: number
          updated_at: string | null
          warehouse_id: number
        }
        Insert: {
          c1?: number | null
          c2?: number | null
          c3?: number | null
          id?: never
          product_id: number
          updated_at?: string | null
          warehouse_id: number
        }
        Update: {
          c1?: number | null
          c2?: number | null
          c3?: number | null
          id?: never
          product_id?: number
          updated_at?: string | null
          warehouse_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "company_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "warehouse_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "low_stock_alerts"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "warehouse_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "product_stock_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "warehouse_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_stock_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouse_inventory"
            referencedColumns: ["warehouse_id"]
          },
          {
            foreignKeyName: "warehouse_stock_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          company_id: string
          created_at: string | null
          id: number
          location: string | null
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: never
          location?: string | null
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: never
          location?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_stock_summary"
            referencedColumns: ["company_id"]
          },
          {
            foreignKeyName: "warehouses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "warehouse_inventory"
            referencedColumns: ["company_id"]
          },
        ]
      }
    }
    Views: {
      client_sales_summary: {
        Row: {
          city: string | null
          client_id: number | null
          client_name: string | null
          last_order_date: string | null
          order_count: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      company_crm_summary: {
        Row: {
          account_owner: string | null
          address: string | null
          annual_revenue: number | null
          city: string | null
          contact_count: number | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          employee_count: number | null
          id: number | null
          industry: string | null
          is_active: boolean | null
          linkedin_url: string | null
          name: string | null
          notes: string | null
          opportunity_count: number | null
          order_count: number | null
          phone: string | null
          pipeline_value: number | null
          total_orders_value: number | null
          updated_at: string | null
          website: string | null
          won_revenue: number | null
          zip_code: string | null
        }
        Relationships: []
      }
      company_stock_summary: {
        Row: {
          capacity: number | null
          category: string | null
          company_id: string | null
          company_name: string | null
          flange_thickness_mm: string | null
          kg_per_m: number | null
          length_m: number | null
          name: string | null
          product_id: number | null
          size_inch: string | null
          size_mm: string | null
          sku: string | null
          thickness_mm: string | null
          total_c1: number | null
          total_c2: number | null
          total_c3: number | null
          total_stock: number | null
          unit: string | null
          weight_per_20ft: string | null
          weight_per_length: number | null
        }
        Relationships: []
      }
      contact_with_company: {
        Row: {
          city: string | null
          company_id: number | null
          company_name: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: number | null
          is_primary: boolean | null
          job_title: string | null
          last_name: string | null
          linkedin_url: string | null
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      current_market_prices: {
        Row: {
          category_id: number | null
          category_name: string | null
          effective_date: string | null
          price_per_kg: number | null
          price_source: string | null
        }
        Insert: {
          category_id?: number | null
          category_name?: string | null
          effective_date?: never
          price_per_kg?: never
          price_source?: never
        }
        Update: {
          category_id?: number | null
          category_name?: string | null
          effective_date?: never
          price_per_kg?: never
          price_source?: never
        }
        Relationships: []
      }
      low_stock_alerts: {
        Row: {
          capacity: number | null
          category: string | null
          flange_thickness_mm: string | null
          kg_per_m: number | null
          length_m: number | null
          name: string | null
          product_id: number | null
          size_inch: string | null
          size_mm: string | null
          sku: string | null
          thickness_mm: string | null
          total_c1: number | null
          total_c2: number | null
          total_c3: number | null
          total_stock: number | null
          unit: string | null
          weight_per_20ft: string | null
          weight_per_length: number | null
        }
        Relationships: []
      }
      monthly_sales: {
        Row: {
          month: string | null
          order_count: number | null
          revenue: number | null
          total_weight_kg: number | null
        }
        Relationships: []
      }
      opportunity_pipeline: {
        Row: {
          amount: number | null
          close_date: string | null
          company_id: number | null
          company_name: string | null
          contact_id: number | null
          contact_name: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          id: number | null
          lost_reason: string | null
          name: string | null
          notes: string | null
          owner: string | null
          probability: number | null
          source: string | null
          stage: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      order_summary: {
        Row: {
          client_name: string | null
          created_at: string | null
          item_count: number | null
          order_date: string | null
          order_id: number | null
          order_number: string | null
          payment_status: string | null
          ship_to_city: string | null
          ship_to_warehouse: string | null
          status: string | null
          subtotal: number | null
          tax: number | null
          total: number | null
          total_weight_kg: number | null
        }
        Relationships: []
      }
      product_stock_summary: {
        Row: {
          capacity: number | null
          category: string | null
          flange_thickness_mm: string | null
          kg_per_m: number | null
          length_m: number | null
          name: string | null
          product_id: number | null
          size_inch: string | null
          size_mm: string | null
          sku: string | null
          thickness_mm: string | null
          total_c1: number | null
          total_c2: number | null
          total_c3: number | null
          total_stock: number | null
          unit: string | null
          weight_per_20ft: string | null
          weight_per_length: number | null
        }
        Relationships: []
      }
      recent_movements: {
        Row: {
          classification: string | null
          created_at: string | null
          id: number | null
          movement_type: string | null
          notes: string | null
          performed_by: string | null
          product_name: string | null
          quantity: number | null
          reference_id: string | null
          sku: string | null
          warehouse_name: string | null
        }
        Relationships: []
      }
      warehouse_inventory: {
        Row: {
          c1: number | null
          c2: number | null
          c3: number | null
          category: string | null
          company_id: string | null
          company_name: string | null
          length_m: number | null
          product_name: string | null
          size_mm: string | null
          sku: string | null
          stock_id: number | null
          subtotal: number | null
          thickness_mm: string | null
          updated_at: string | null
          warehouse_id: number | null
          warehouse_name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_order_with_items: {
        Args: {
          p_client_id: number
          p_client_warehouse_id?: number
          p_created_by?: string
          p_items: Json
          p_notes: string
          p_order_number: string
          p_salesperson: string
          p_supplier_id?: number
        }
        Returns: number
      }
      get_categories_with_counts: {
        Args: { p_company_id?: string }
        Returns: {
          id: number
          name: string
          product_count: number
        }[]
      }
      get_crm_stats: { Args: never; Returns: Json }
      get_dashboard_stats: { Args: { p_company_id?: string }; Returns: Json }
      get_fast_moving_items: {
        Args: { p_company_id?: string; p_days?: number; p_limit?: number }
        Returns: Json
      }
      get_low_stock_alerts: {
        Args: { p_company_id?: string; p_limit?: number }
        Returns: {
          capacity: number
          category: string
          flange_thickness_mm: string
          kg_per_m: number
          length_m: number
          name: string
          product_id: number
          size_inch: string
          size_mm: string
          sku: string
          thickness_mm: string
          total_c1: number
          total_c2: number
          total_c3: number
          total_stock: number
          unit: string
          weight_per_20ft: string
          weight_per_length: number
        }[]
      }
      get_low_stock_count: { Args: { p_company_id?: string }; Returns: number }
      get_sales_stats: { Args: never; Returns: Json }
      get_total_stock: { Args: { p_company_id?: string }; Returns: number }
      move_opportunity_stage: {
        Args: {
          p_lost_reason?: string
          p_new_stage: string
          p_opportunity_id: number
          p_performed_by: string
        }
        Returns: undefined
      }
      record_delivery:
        | { Args: { p_deliveries: Json; p_order_id: number }; Returns: Json }
        | {
            Args: {
              p_delivered_by?: string
              p_deliveries: Json
              p_notes?: string
              p_order_id: number
            }
            Returns: Json
          }
        | {
            Args: {
              p_delivered_by?: string
              p_deliveries: Json
              p_notes?: string
              p_order_id: number
              p_processed_by?: string
            }
            Returns: Json
          }
      restore_order_stock: {
        Args: {
          p_movement_type: string
          p_order_id: number
          p_performed_by?: string
        }
        Returns: undefined
      }
      update_market_price:
        | {
            Args: { p_category_id: number; p_notes?: string; p_price: number }
            Returns: undefined
          }
        | {
            Args: {
              p_category_id: number
              p_notes?: string
              p_price: number
              p_updated_by?: string
            }
            Returns: undefined
          }
      update_order_item_prices: {
        Args: { p_items: Json; p_order_id: number; p_updated_by?: string }
        Returns: Json
      }
      update_order_status:
        | {
            Args: { p_new_status: string; p_order_id: number }
            Returns: undefined
          }
        | {
            Args: {
              p_new_status: string
              p_order_id: number
              p_performed_by?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_new_status: string
              p_notes?: string
              p_order_id: number
              p_performed_by?: string
              p_performed_by_id?: string
            }
            Returns: undefined
          }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
