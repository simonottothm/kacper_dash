-- Create ingestion_requests table for idempotency
CREATE TABLE IF NOT EXISTS public.ingestion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  response_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, key_hash)
);

-- Indexes for leads table
CREATE INDEX IF NOT EXISTS idx_leads_tenant_campaign ON public.leads(tenant_id, campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_status ON public.leads(campaign_id, status_id) WHERE status_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_campaign_followup ON public.leads(campaign_id, next_follow_up_at) WHERE next_follow_up_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_email_lower ON public.leads(lower(email)) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_external_id ON public.leads(tenant_id, external_id) WHERE external_id IS NOT NULL;

-- Indexes for lead_updates table
CREATE INDEX IF NOT EXISTS idx_lead_updates_lead_created ON public.lead_updates(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_updates_tenant_created ON public.lead_updates(tenant_id, created_at DESC);

-- Indexes for campaigns table
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant ON public.campaigns(tenant_id);

-- Indexes for memberships table
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_tenant_user ON public.memberships(tenant_id, user_id);

-- Indexes for import_jobs table
CREATE INDEX IF NOT EXISTS idx_import_jobs_campaign_created ON public.import_jobs(campaign_id, created_at DESC);

-- Indexes for notification_prefs table
CREATE INDEX IF NOT EXISTS idx_notification_prefs_tenant_user ON public.notification_prefs(tenant_id, user_id);

-- Indexes for user_tenant_state table
CREATE INDEX IF NOT EXISTS idx_user_tenant_state_tenant_user ON public.user_tenant_state(tenant_id, user_id);

-- Indexes for api_keys table
CREATE INDEX IF NOT EXISTS idx_api_keys_tenant ON public.api_keys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash) WHERE is_active = true;

-- Indexes for ingestion_requests table
CREATE INDEX IF NOT EXISTS idx_ingestion_requests_tenant_key ON public.ingestion_requests(tenant_id, key_hash);
CREATE INDEX IF NOT EXISTS idx_ingestion_requests_created ON public.ingestion_requests(created_at);

-- RLS for ingestion_requests (admin-only read, service role writes)
ALTER TABLE public.ingestion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read ingestion requests"
  ON public.ingestion_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.tenant_id = ingestion_requests.tenant_id
        AND memberships.user_id = auth.uid()
        AND memberships.role = 'admin'
    )
  );

-- Note: Service role will bypass RLS for writes

