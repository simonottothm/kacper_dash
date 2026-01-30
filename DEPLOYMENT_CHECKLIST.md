# Deployment Checklist - Kasper Dashboard

## Phase 1: Supabase Setup

### 1.1 Database Setup
- [ ] Run all migrations in order:
  - [ ] Phase 0: Base tables (tenants, memberships, campaigns, etc.)
  - [ ] Phase 4: Admin tables (status_definitions, update_templates, custom_field_definitions, invitations)
  - [ ] Phase 5: import_jobs table
  - [ ] Phase 6: api_keys table
  - [ ] Phase 8: notification_prefs, user_tenant_state tables
  - [ ] Phase 9: ingestion_requests table + indexes

### 1.2 Row Level Security (RLS)
- [ ] Verify RLS is enabled on all tables
- [ ] Test RLS policies:
  - [ ] Users can only access their tenant's data
  - [ ] Admins can manage tenant config
  - [ ] Clients can only see assigned campaigns (if USE_CAMPAIGN_ASSIGNMENTS=true)

### 1.3 Test Users Creation
- [ ] Create admin user via Supabase Dashboard:
  - Email: `admin@test.com`
  - Password: `TestAdmin123!` (change in production!)
  - Note the user ID
- [ ] Create client user via Supabase Dashboard:
  - Email: `client@test.com`
  - Password: `TestClient123!` (change in production!)
  - Note the user ID
- [ ] Run test users migration: `supabase/migrations/20240103000000_test_users.sql`
- [ ] Update user IDs in migration if needed
- [ ] Verify users can log in

## Phase 2: Environment Variables

### 2.1 Required Variables (Production)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-only!

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM="Kasper Leads <noreply@yourdomain.com>"

# App Config
APP_BASE_URL=https://your-domain.com
CRON_SECRET=generate-random-secret-here  # Use: openssl rand -hex 32

# Optional
API_KEY_PEPPER=optional-pepper-for-api-keys  # Use: openssl rand -hex 32
```

### 2.2 Vercel Environment Variables
- [ ] Add all variables in Vercel Dashboard > Settings > Environment Variables
- [ ] Set for Production, Preview, and Development environments
- [ ] Verify `SUPABASE_SERVICE_ROLE_KEY` is NOT exposed to client
- [ ] Verify `CRON_SECRET` is set and secure

## Phase 3: Vercel Deployment

### 3.1 Project Setup
- [ ] Connect GitHub repository to Vercel
- [ ] Configure build settings:
  - Framework Preset: Next.js
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`

### 3.2 Cron Jobs Configuration
- [ ] Update `vercel.json`:
  - Replace `CRON_SECRET_PLACEHOLDER` with actual `CRON_SECRET` value
  - OR use Vercel's environment variable substitution
- [ ] Verify cron schedule:
  - Daily: `0 9 * * *` (09:00 UTC = 10:00 Europe/Berlin)
  - Weekly: `0 9 * * 1` (Monday 09:00 UTC)
- [ ] Test cron endpoint manually:
  ```bash
  curl -X POST "https://your-domain.com/api/cron/notifications/digest?token=YOUR_CRON_SECRET&mode=daily"
  ```

### 3.3 Domain & SSL
- [ ] Configure custom domain in Vercel
- [ ] Verify SSL certificate is active
- [ ] Update `APP_BASE_URL` to match custom domain

## Phase 4: Email Configuration (Resend)

### 4.1 Resend Setup
- [ ] Create Resend account: https://resend.com
- [ ] Verify domain (if using custom domain)
- [ ] Create API key
- [ ] Add `RESEND_API_KEY` to environment variables
- [ ] Set `EMAIL_FROM` to verified sender address

### 4.2 Test Email Delivery
- [ ] Enable email notifications for test user
- [ ] Trigger a test digest (or wait for cron)
- [ ] Verify email is received
- [ ] Check email formatting and links

## Phase 5: Security Hardening

### 5.1 API Keys
- [ ] Create production API keys via admin UI
- [ ] Store keys securely (never commit to git)
- [ ] Rotate keys periodically
- [ ] Monitor API key usage

### 5.2 Rate Limiting
- [ ] Monitor rate limit logs
- [ ] Adjust limits in `src/lib/security/rateLimit.ts` if needed
- [ ] Consider Upstash Redis for multi-instance deployments

### 5.3 Secrets Management
- [ ] Verify no secrets in code/logs
- [ ] Use Vercel's environment variables
- [ ] Rotate `CRON_SECRET` periodically
- [ ] Rotate `API_KEY_PEPPER` if used

## Phase 6: Database Optimization

### 6.1 Indexes
- [ ] Run Phase 9 migration to create indexes
- [ ] Monitor query performance
- [ ] Add additional indexes if needed based on query patterns

### 6.2 Connection Pooling
- [ ] Configure Supabase connection pooling (if needed)
- [ ] Monitor connection usage
- [ ] Set up connection limits

### 6.3 Backup Strategy
- [ ] Enable Supabase automatic backups
- [ ] Test restore procedure
- [ ] Document backup schedule

## Phase 7: Monitoring & Observability

### 7.1 Error Tracking (Optional)
- [ ] Set up Sentry (if desired):
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```
- [ ] Configure Sentry DSN
- [ ] Test error reporting

### 7.2 Logging
- [ ] Monitor Vercel logs
- [ ] Set up log aggregation (optional)
- [ ] Monitor request IDs for debugging

### 7.3 Health Checks
- [ ] Test `/api/health` endpoint
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure alerts for downtime

## Phase 8: Testing

### 8.1 Authentication
- [ ] Test login flow
- [ ] Test logout
- [ ] Test session persistence
- [ ] Test password reset (if enabled)

### 8.2 Tenant & Campaign Access
- [ ] Test tenant switching
- [ ] Test campaign access control
- [ ] Test admin vs client permissions

### 8.3 Lead Management
- [ ] Test lead creation (via import)
- [ ] Test lead updates
- [ ] Test status changes
- [ ] Test follow-up setting
- [ ] Test timeline updates

### 8.4 Admin Features
- [ ] Test tenant creation
- [ ] Test campaign management
- [ ] Test status pipeline configuration
- [ ] Test invite creation and acceptance
- [ ] Test API key creation

### 8.5 Import & Ingestion
- [ ] Test CSV import
- [ ] Test Make.com ingestion endpoint
- [ ] Test idempotency (duplicate requests)
- [ ] Test rate limiting

### 8.6 Notifications
- [ ] Test notification preferences
- [ ] Test badge counts
- [ ] Test email digest sending
- [ ] Test cron job execution

## Phase 9: Production Data

### 9.1 Initial Setup
- [ ] Create production tenant(s)
- [ ] Create production admin user(s)
- [ ] Set up initial campaigns
- [ ] Configure status pipelines
- [ ] Set up custom fields (if needed)

### 9.2 User Onboarding
- [ ] Create user accounts
- [ ] Send invitation emails
- [ ] Verify invite acceptance flow
- [ ] Test user access

## Phase 10: Documentation

### 10.1 User Documentation
- [ ] Create user guide
- [ ] Document workflows
- [ ] Create FAQ

### 10.2 API Documentation
- [ ] Document Make.com ingestion endpoint
- [ ] Provide example requests
- [ ] Document error codes

### 10.3 Admin Documentation
- [ ] Document admin features
- [ ] Create setup guide
- [ ] Document troubleshooting

## Phase 11: Maintenance

### 11.1 Regular Tasks
- [ ] Monitor error rates
- [ ] Review logs weekly
- [ ] Check database performance
- [ ] Review API usage
- [ ] Rotate secrets quarterly

### 11.2 Updates
- [ ] Keep dependencies updated
- [ ] Test updates in staging first
- [ ] Monitor security advisories
- [ ] Apply security patches promptly

## Quick Start Commands

### Create Test Users (Supabase Dashboard)
1. Go to Authentication > Users
2. Click "Add user" > "Create new user"
3. Create admin@test.com with password
4. Create client@test.com with password
5. Note the user IDs

### Run Migrations
```bash
# Via Supabase CLI
supabase db push

# Or via SQL Editor in Supabase Dashboard
# Copy and paste each migration file
```

### Test Locally
```bash
npm install
npm run dev
# Visit http://localhost:3000
```

### Deploy to Vercel
```bash
# Via Vercel CLI
vercel --prod

# Or push to main branch (if connected to GitHub)
git push origin main
```

## Troubleshooting

### Common Issues

**RLS blocking queries:**
- Check RLS policies are enabled
- Verify user has correct membership
- Check tenant_id matches in queries

**Cron jobs not running:**
- Verify `CRON_SECRET` is set in Vercel
- Check cron schedule in vercel.json
- Test endpoint manually with token

**Email not sending:**
- Verify Resend API key is correct
- Check email domain is verified
- Review Resend dashboard for errors

**Rate limiting too strict:**
- Adjust limits in `src/lib/security/rateLimit.ts`
- Consider Redis for distributed rate limiting

**Database performance:**
- Run index migration
- Monitor slow queries
- Add indexes for specific query patterns

