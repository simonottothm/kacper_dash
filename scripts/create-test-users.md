# Test Users Creation Guide

## Option 1: Via Supabase Dashboard (Recommended)

### Step 1: Create Users in Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Users**
3. Click **"Add user"** > **"Create new user"**

#### Create Admin User:
- **Email**: `admin@test.com`
- **Password**: `TestAdmin123!`
- **Auto Confirm User**: ✅ (check this)
- Click **"Create user"**
- **Copy the User ID** (you'll need it)

#### Create Client User:
- **Email**: `client@test.com`
- **Password**: `TestClient123!`
- **Auto Confirm User**: ✅ (check this)
- Click **"Create user"**
- **Copy the User ID** (you'll need it)

### Step 2: Create Tenant and Memberships

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this SQL (replace USER_IDs with actual IDs from Step 1):

```sql
-- Create test tenant
INSERT INTO public.tenants (id, name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Tenant',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Get user IDs (run this first to find IDs)
SELECT id, email FROM auth.users WHERE email IN ('admin@test.com', 'client@test.com');

-- Replace ADMIN_USER_ID and CLIENT_USER_ID below with actual IDs from query above
-- Create admin membership
INSERT INTO public.memberships (tenant_id, user_id, role, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ADMIN_USER_ID_HERE',  -- Replace with actual admin user ID
  'admin',
  now()
)
ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = 'admin';

-- Create client membership
INSERT INTO public.memberships (tenant_id, user_id, role, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'CLIENT_USER_ID_HERE',  -- Replace with actual client user ID
  'client',
  now()
)
ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = 'client';

-- Create test campaign
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

-- Create default status
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
```

## Option 2: Via Supabase CLI

### Step 1: Create Users via Auth API

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Create users (requires service role key)
curl -X POST 'https://your-project.supabase.co/auth/v1/admin/users' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "TestAdmin123!",
    "email_confirm": true
  }'

curl -X POST 'https://your-project.supabase.co/auth/v1/admin/users' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@test.com",
    "password": "TestClient123!",
    "email_confirm": true
  }'
```

### Step 2: Run Migration

```bash
# Run the test users migration
supabase db push
```

## Option 3: Automated Script (Node.js)

Create a file `scripts/setup-test-users.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupTestUsers() {
  // Create admin user
  const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
    email: 'admin@test.com',
    password: 'TestAdmin123!',
    email_confirm: true
  });

  if (adminError) {
    console.error('Error creating admin user:', adminError);
  } else {
    console.log('Admin user created:', adminUser.user.id);
  }

  // Create client user
  const { data: clientUser, error: clientError } = await supabase.auth.admin.createUser({
    email: 'client@test.com',
    password: 'TestClient123!',
    email_confirm: true
  });

  if (clientError) {
    console.error('Error creating client user:', clientError);
  } else {
    console.log('Client user created:', clientUser.user.id);
  }

  // Create tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .upsert({
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Test Tenant'
    })
    .select()
    .single();

  if (tenantError) {
    console.error('Error creating tenant:', tenantError);
  } else {
    console.log('Tenant created');
  }

  // Create memberships
  if (adminUser && clientUser) {
    await supabase.from('memberships').upsert([
      {
        tenant_id: '00000000-0000-0000-0000-000000000001',
        user_id: adminUser.user.id,
        role: 'admin'
      },
      {
        tenant_id: '00000000-0000-0000-0000-000000000001',
        user_id: clientUser.user.id,
        role: 'client'
      }
    ]);

    console.log('Memberships created');
  }
}

setupTestUsers();
```

Run with:
```bash
node scripts/setup-test-users.js
```

## Verification

After creating users, verify they work:

1. **Test Login:**
   - Go to `/login`
   - Login with `admin@test.com` / `TestAdmin123!`
   - Should redirect to `/app` and show "Test Tenant"

2. **Test Admin Access:**
   - Login as admin
   - Go to `/admin`
   - Should see tenant management

3. **Test Client Access:**
   - Login as client
   - Should see campaigns (if any exist)
   - Should NOT see `/admin` (redirected to `/app`)

## Security Notes

⚠️ **IMPORTANT:**
- These are TEST credentials - change passwords in production!
- Never commit test credentials to git
- Use strong, unique passwords in production
- Consider using environment-specific test users

