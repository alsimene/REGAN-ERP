-- ============================================================
-- CRM: Contacts Table
-- ============================================================
-- Creates contacts table for tracking people at client companies.
-- ============================================================

CREATE TABLE contacts (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  email         text,
  phone         text,
  job_title     text,
  company_id    bigint REFERENCES clients(id),
  city          text,
  country       text,
  linkedin_url  text,
  notes         text,
  is_primary    boolean DEFAULT false,
  created_by    text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_contacts_name ON contacts(last_name, first_name);
CREATE INDEX idx_contacts_email ON contacts(email);
