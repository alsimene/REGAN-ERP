-- ============================================================
-- CRM: Opportunities Table
-- ============================================================
-- Creates opportunities table for tracking sales pipeline.
-- ============================================================

CREATE TABLE opportunities (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          text NOT NULL,
  amount        numeric DEFAULT 0,
  currency      text DEFAULT 'PHP',
  stage         text NOT NULL DEFAULT 'new'
                CHECK (stage IN ('new','qualification','meeting','proposal','negotiation','won','lost')),
  close_date    date,
  probability   integer DEFAULT 0
                CHECK (probability >= 0 AND probability <= 100),
  company_id    bigint REFERENCES clients(id),
  contact_id    bigint REFERENCES contacts(id),
  owner         text,
  source        text,
  lost_reason   text,
  notes         text,
  created_by    text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_opps_company ON opportunities(company_id);
CREATE INDEX idx_opps_contact ON opportunities(contact_id);
CREATE INDEX idx_opps_stage ON opportunities(stage);
CREATE INDEX idx_opps_close_date ON opportunities(close_date);
