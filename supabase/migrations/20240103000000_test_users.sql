-- Test Users Setup
-- This migration creates test users for admin and client roles
-- IMPORTANT: Run this only in development/staging, NOT in production!

-- Step 1: Create test users in Supabase Auth (must be done via Supabase Dashboard or Auth API)
-- For now, we'll create the tenant and membership records assuming users exist
-- You need to create these users first via Supabase Auth:
-- 1. admin@test.com / password: TestAdmin123!
-- 2. client@test.com / password: TestClient123!

-- Step 2: Create a test tenant
INSERT INTO public.tenants (id, name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Tenant',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Get user IDs (replace with actual user IDs from auth.users after creating users)
-- You can find user IDs in Supabase Dashboard > Authentication > Users
-- Or query: SELECT id, email FROM auth.users WHERE email IN ('admin@test.com', 'client@test.com');

-- Step 4: Create memberships (replace USER_IDs with actual IDs from step 3)
-- Admin membership
INSERT INTO public.memberships (tenant_id, user_id, role, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM auth.users WHERE email = 'admin@test.com' LIMIT 1),
  'admin',
  now()
)
ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = 'admin';

-- Client membership
INSERT INTO public.memberships (tenant_id, user_id, role, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  (SELECT id FROM auth.users WHERE email = 'client@test.com' LIMIT 1),
  'client',
  now()
)
ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = 'client';

-- Step 5: Create a test campaign
INSERT INTO public.campaigns (id, tenant_id, name, description, is_archived, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Test Campaign',
  'Test campaign for development',
  false,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Step 6: Create default status for test tenant
INSERT INTO public.status_definitions (id, tenant_id, label, sort_order, is_default, is_closed, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000001',
  'Neu',
  1,
  true,
  false,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

