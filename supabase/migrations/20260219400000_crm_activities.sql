-- ============================================================
-- CRM: Activities Table
-- ============================================================
-- Creates crm_activities table for logging interactions
-- (notes, calls, emails, meetings, stage changes).
-- ============================================================

CREATE TABLE crm_activities (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  activity_type   text NOT NULL
                  CHECK (activity_type IN ('note','call','email','meeting','stage_change','created','updated')),
  subject         text,
  description     text,
  company_id      bigint REFERENCES clients(id),
  contact_id      bigint REFERENCES contacts(id),
  opportunity_id  bigint REFERENCES opportunities(id),
  performed_by    text NOT NULL,
  performed_at    timestamptz DEFAULT now(),
  metadata        jsonb DEFAULT '{}'
);

CREATE INDEX idx_crm_act_company ON crm_activities(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX idx_crm_act_contact ON crm_activities(contact_id) WHERE contact_id IS NOT NULL;
CREATE INDEX idx_crm_act_opportunity ON crm_activities(opportunity_id) WHERE opportunity_id IS NOT NULL;
CREATE INDEX idx_crm_act_performed_at ON crm_activities(performed_at);
