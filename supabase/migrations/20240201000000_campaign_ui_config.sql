-- Campaign UI config table + policies

CREATE TABLE IF NOT EXISTS public.campaign_ui_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID UNIQUE NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  columns JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaign_ui_config_campaign ON public.campaign_ui_config(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_ui_config_tenant ON public.campaign_ui_config(tenant_id);

ALTER TABLE public.campaign_ui_config ENABLE ROW LEVEL SECURITY;

-- Campaign UI config: select for tenant members with campaign access
CREATE POLICY "Users can view campaign UI config"
  ON public.campaign_ui_config FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = campaign_ui_config.tenant_id
        AND m.user_id = auth.uid()
        AND (
          m.role = 'admin'
          OR EXISTS (
            SELECT 1 FROM public.campaign_users cu
            WHERE cu.campaign_id = campaign_ui_config.campaign_id
              AND cu.user_id = auth.uid()
          )
          OR NOT EXISTS (
            SELECT 1 FROM public.campaign_users cu
            WHERE cu.campaign_id = campaign_ui_config.campaign_id
          )
        )
    )
  );

-- Campaign UI config: insert for tenant members with campaign access
CREATE POLICY "Users can insert campaign UI config"
  ON public.campaign_ui_config FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = campaign_ui_config.tenant_id
        AND m.user_id = auth.uid()
        AND (
          m.role = 'admin'
          OR EXISTS (
            SELECT 1 FROM public.campaign_users cu
            WHERE cu.campaign_id = campaign_ui_config.campaign_id
              AND cu.user_id = auth.uid()
          )
          OR NOT EXISTS (
            SELECT 1 FROM public.campaign_users cu
            WHERE cu.campaign_id = campaign_ui_config.campaign_id
          )
        )
    )
  );

-- Campaign UI config: update for tenant members with campaign access
CREATE POLICY "Users can update campaign UI config"
  ON public.campaign_ui_config FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = campaign_ui_config.tenant_id
        AND m.user_id = auth.uid()
        AND (
          m.role = 'admin'
          OR EXISTS (
            SELECT 1 FROM public.campaign_users cu
            WHERE cu.campaign_id = campaign_ui_config.campaign_id
              AND cu.user_id = auth.uid()
          )
          OR NOT EXISTS (
            SELECT 1 FROM public.campaign_users cu
            WHERE cu.campaign_id = campaign_ui_config.campaign_id
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = campaign_ui_config.tenant_id
        AND m.user_id = auth.uid()
        AND (
          m.role = 'admin'
          OR EXISTS (
            SELECT 1 FROM public.campaign_users cu
            WHERE cu.campaign_id = campaign_ui_config.campaign_id
              AND cu.user_id = auth.uid()
          )
          OR NOT EXISTS (
            SELECT 1 FROM public.campaign_users cu
            WHERE cu.campaign_id = campaign_ui_config.campaign_id
          )
        )
    )
  );

-- Allow tenant members to view custom field definitions
CREATE POLICY "Users can view custom fields"
  ON public.custom_field_definitions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.tenant_id = custom_field_definitions.tenant_id
        AND memberships.user_id = auth.uid()
    )
  );

-- Allow tenant members with campaign access to create leads
CREATE POLICY "Users can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.tenant_id = leads.tenant_id
        AND m.user_id = auth.uid()
        AND (
          m.role = 'admin'
          OR EXISTS (
            SELECT 1 FROM public.campaign_users cu
            WHERE cu.campaign_id = leads.campaign_id
              AND cu.user_id = auth.uid()
          )
          OR NOT EXISTS (
            SELECT 1 FROM public.campaign_users cu
            WHERE cu.campaign_id = leads.campaign_id
          )
        )
    )
  );

