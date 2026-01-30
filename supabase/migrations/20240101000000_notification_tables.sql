-- Create notification_prefs table
CREATE TABLE IF NOT EXISTS public.notification_prefs (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_new_updates BOOLEAN NOT NULL DEFAULT false,
  email_overdue_followups BOOLEAN NOT NULL DEFAULT false,
  digest_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (digest_frequency IN ('daily', 'weekly', 'immediate')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id)
);

-- Create user_tenant_state table
CREATE TABLE IF NOT EXISTS public.user_tenant_state (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen_updates_at TIMESTAMPTZ DEFAULT now(),
  last_digest_sent_at TIMESTAMPTZ,
  PRIMARY KEY (tenant_id, user_id)
);

-- RLS for notification_prefs
ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notification preferences"
  ON public.notification_prefs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_prefs
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON public.notification_prefs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all preferences in their tenant
CREATE POLICY "Admins can read tenant notification preferences"
  ON public.notification_prefs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.tenant_id = notification_prefs.tenant_id
        AND memberships.user_id = auth.uid()
        AND memberships.role = 'admin'
    )
  );

-- RLS for user_tenant_state
ALTER TABLE public.user_tenant_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tenant state"
  ON public.user_tenant_state
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tenant state"
  ON public.user_tenant_state
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tenant state"
  ON public.user_tenant_state
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all state in their tenant
CREATE POLICY "Admins can read tenant user state"
  ON public.user_tenant_state
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.tenant_id = user_tenant_state.tenant_id
        AND memberships.user_id = auth.uid()
        AND memberships.role = 'admin'
    )
  );

