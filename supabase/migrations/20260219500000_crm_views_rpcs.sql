-- ============================================================
-- CRM: Views & RPCs
-- ============================================================
-- Creates CRM views for aggregated data and RPCs for
-- stage management and stats.
-- ============================================================

-- A. company_crm_summary — full client profile with CRM aggregates
CREATE OR REPLACE VIEW company_crm_summary AS
SELECT
  cl.id,
  cl.name,
  cl.contact_person,
  cl.email,
  cl.phone,
  cl.address,
  cl.city,
  cl.country,
  cl.zip_code,
  cl.website,
  cl.industry,
  cl.employee_count,
  cl.annual_revenue,
  cl.linkedin_url,
  cl.account_owner,
  cl.is_active,
  cl.notes,
  cl.created_by,
  cl.created_at,
  cl.updated_at,
  count(DISTINCT ct.id)::integer AS contact_count,
  count(DISTINCT o.id)::integer AS opportunity_count,
  COALESCE(sum(CASE WHEN o.stage = 'won' THEN o.amount ELSE 0 END), 0) AS won_revenue,
  COALESCE(sum(CASE WHEN o.stage NOT IN ('won','lost') THEN o.amount ELSE 0 END), 0) AS pipeline_value,
  count(DISTINCT ord.id)::integer AS order_count,
  COALESCE(sum(ord.total), 0) AS total_orders_value
FROM clients cl
LEFT JOIN contacts ct ON ct.company_id = cl.id
LEFT JOIN opportunities o ON o.company_id = cl.id
LEFT JOIN orders ord ON ord.client_id = cl.id AND ord.status NOT IN ('cancelled','rejected')
GROUP BY cl.id;

-- B. contact_with_company — contacts joined with their company
CREATE OR REPLACE VIEW contact_with_company AS
SELECT
  c.id,
  c.first_name,
  c.last_name,
  c.first_name || ' ' || c.last_name AS full_name,
  c.email,
  c.phone,
  c.job_title,
  c.city,
  c.country,
  c.linkedin_url,
  c.is_primary,
  c.notes,
  c.created_by,
  c.created_at,
  c.updated_at,
  cl.id AS company_id,
  cl.name AS company_name
FROM contacts c
LEFT JOIN clients cl ON cl.id = c.company_id;

-- C. opportunity_pipeline — opportunities with company & contact names
CREATE OR REPLACE VIEW opportunity_pipeline AS
SELECT
  o.id,
  o.name,
  o.amount,
  o.currency,
  o.stage,
  o.close_date,
  o.probability,
  o.owner,
  o.source,
  o.lost_reason,
  o.notes,
  o.created_by,
  o.created_at,
  o.updated_at,
  cl.id AS company_id,
  cl.name AS company_name,
  ct.id AS contact_id,
  ct.first_name || ' ' || ct.last_name AS contact_name
FROM opportunities o
LEFT JOIN clients cl ON cl.id = o.company_id
LEFT JOIN contacts ct ON ct.id = o.contact_id;

-- D. get_crm_stats RPC
CREATE OR REPLACE FUNCTION get_crm_stats()
RETURNS json
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_companies', (SELECT COUNT(*) FROM clients WHERE is_active IS NOT false),
    'total_contacts', (SELECT COUNT(*) FROM contacts),
    'total_opportunities', (SELECT COUNT(*) FROM opportunities WHERE stage NOT IN ('won','lost')),
    'pipeline_value', COALESCE((SELECT SUM(amount) FROM opportunities WHERE stage NOT IN ('won','lost')), 0),
    'won_this_month', COALESCE((SELECT SUM(amount) FROM opportunities
                                WHERE stage = 'won' AND updated_at >= date_trunc('month', now())), 0),
    'lost_this_month', (SELECT COUNT(*) FROM opportunities
                        WHERE stage = 'lost' AND updated_at >= date_trunc('month', now()))
  ) INTO result;
  RETURN result;
END;
$$;

-- E. move_opportunity_stage RPC — with activity logging
CREATE OR REPLACE FUNCTION move_opportunity_stage(
  p_opportunity_id bigint,
  p_new_stage text,
  p_performed_by text,
  p_lost_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_stage text;
  v_opp_name text;
BEGIN
  SELECT stage, name INTO v_old_stage, v_opp_name
  FROM opportunities
  WHERE id = p_opportunity_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Opportunity not found: %', p_opportunity_id;
  END IF;

  IF p_new_stage NOT IN ('new','qualification','meeting','proposal','negotiation','won','lost') THEN
    RAISE EXCEPTION 'Invalid stage: %', p_new_stage;
  END IF;

  UPDATE opportunities
  SET stage = p_new_stage,
      lost_reason = CASE WHEN p_new_stage = 'lost' THEN p_lost_reason ELSE lost_reason END,
      updated_at = now()
  WHERE id = p_opportunity_id;

  INSERT INTO crm_activities (activity_type, subject, description, opportunity_id, performed_by, metadata)
  VALUES (
    'stage_change',
    v_old_stage || ' → ' || p_new_stage,
    'Opportunity "' || v_opp_name || '" moved from ' || v_old_stage || ' to ' || p_new_stage,
    p_opportunity_id,
    p_performed_by,
    jsonb_build_object('old_stage', v_old_stage, 'new_stage', p_new_stage)
  );
END;
$$;
