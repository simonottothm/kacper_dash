-- Initial Schema Migration
-- Creates all base tables needed for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Memberships table
CREATE TABLE IF NOT EXISTS public.memberships (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id)
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Status definitions table
CREATE TABLE IF NOT EXISTS public.status_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, label)
);

-- Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  full_name TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  external_id TEXT,
  status_id UUID REFERENCES public.status_definitions(id) ON DELETE SET NULL,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  next_follow_up_at TIMESTAMPTZ,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lead updates table
CREATE TABLE IF NOT EXISTS public.lead_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL CHECK (update_type IN ('call_attempt', 'note', 'status_change', 'follow_up')),
  call_outcome TEXT CHECK (call_outcome IN ('reached', 'not_reached')),
  comment TEXT,
  from_status_id UUID REFERENCES public.status_definitions(id),
  to_status_id UUID REFERENCES public.status_definitions(id),
  follow_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update templates table
CREATE TABLE IF NOT EXISTS public.update_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  update_type TEXT NOT NULL CHECK (update_type IN ('call_attempt', 'note')),
  default_call_outcome TEXT CHECK (default_call_outcome IN ('reached', 'not_reached')),
  comment TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Custom field definitions table
CREATE TABLE IF NOT EXISTS public.custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'select')),
  options JSONB,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, key)
);

-- Invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Campaign users table (optional, for campaign assignments)
CREATE TABLE IF NOT EXISTS public.campaign_users (
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id, user_id)
);

-- Import jobs table
CREATE TABLE IF NOT EXISTS public.import_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  mapping JSONB NOT NULL,
  stats JSONB NOT NULL,
  error_rows JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- API keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_prefs (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_new_updates BOOLEAN NOT NULL DEFAULT false,
  email_overdue_followups BOOLEAN NOT NULL DEFAULT false,
  digest_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (digest_frequency IN ('daily', 'weekly', 'immediate')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id)
);

-- User tenant state table
CREATE TABLE IF NOT EXISTS public.user_tenant_state (
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_seen_updates_at TIMESTAMPTZ DEFAULT now(),
  last_digest_sent_at TIMESTAMPTZ,
  PRIMARY KEY (tenant_id, user_id)
);

-- Ingestion requests table (for idempotency)
CREATE TABLE IF NOT EXISTS public.ingestion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL,
  response_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, key_hash)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tenant_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_requests ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (you may need to customize these)

-- Tenants: Users can see tenants they're members of
CREATE POLICY "Users can view their tenants"
  ON public.tenants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.tenant_id = tenants.id
        AND memberships.user_id = auth.uid()
    )
  );

-- Memberships: Users can see their own memberships
CREATE POLICY "Users can view their memberships"
  ON public.memberships FOR SELECT
  USING (auth.uid() = user_id);

-- Campaigns: Users can see campaigns in their tenant
CREATE POLICY "Users can view tenant campaigns"
  ON public.campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.tenant_id = campaigns.tenant_id
        AND memberships.user_id = auth.uid()
    )
  );

-- Leads: Users can see leads in campaigns they have access to
CREATE POLICY "Users can view accessible leads"
  ON public.leads FOR SELECT
  USING (
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
        )
    )
  );

-- Lead updates: Users can see updates for leads they can access
CREATE POLICY "Users can view accessible lead updates"
  ON public.lead_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leads l
      JOIN public.memberships m ON m.tenant_id = l.tenant_id
      WHERE l.id = lead_updates.lead_id
        AND m.user_id = auth.uid()
    )
  );

-- Status definitions: Users can see statuses in their tenant
CREATE POLICY "Users can view tenant statuses"
  ON public.status_definitions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE memberships.tenant_id = status_definitions.tenant_id
        AND memberships.user_id = auth.uid()
    )
  );

-- Add more RLS policies as needed for other tables
-- For now, these basic policies should allow the app to work

