# Quick Start Guide

## Schritt 1: Datenbank-Schema erstellen

### Option A: Via Supabase Dashboard (Empfohlen)

1. Öffne dein Supabase Projekt
2. Gehe zu **SQL Editor**
3. Öffne die Datei: `supabase/migrations/20240101000000_initial_schema.sql`
4. Kopiere den gesamten Inhalt
5. Füge ihn in den SQL Editor ein
6. Klicke auf **Run** (oder drücke Cmd/Ctrl + Enter)

### Option B: Via Supabase CLI

```bash
# Falls noch nicht installiert
npm install -g supabase

# Login
supabase login

# Link zu deinem Projekt
supabase link --project-ref dein-project-ref

# Migration ausführen
supabase db push
```

## Schritt 2: Test-User erstellen

1. Gehe zu **Authentication** > **Users** im Supabase Dashboard
2. Klicke auf **"Add user"** > **"Create new user"**

**Admin User erstellen:**
- Email: `admin@test.com`
- Password: `TestAdmin123!`
- ✅ Auto Confirm User
- **WICHTIG:** Kopiere die **User ID** (wird später benötigt)

**Client User erstellen:**
- Email: `client@test.com`
- Password: `TestClient123!`
- ✅ Auto Confirm User
- **WICHTIG:** Kopiere die **User ID** (wird später benötigt)

## Schritt 3: Test-Daten einfügen

1. Gehe zurück zum **SQL Editor**
2. Führe diese Abfrage aus, um die User IDs zu finden:

```sql
SELECT id, email FROM auth.users WHERE email IN ('admin@test.com', 'client@test.com');
```

3. Kopiere die User IDs aus dem Ergebnis
4. Führe dann dieses SQL aus (ersetze `ADMIN_USER_ID` und `CLIENT_USER_ID`):

```sql
-- Tenant erstellen
INSERT INTO public.tenants (id, name, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test Tenant',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Memberships erstellen (USER_IDs ersetzen!)
INSERT INTO public.memberships (tenant_id, user_id, role, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'ADMIN_USER_ID_HIER', 'admin', now()),
  ('00000000-0000-0000-0000-000000000001', 'CLIENT_USER_ID_HIER', 'client', now())
ON CONFLICT (tenant_id, user_id) DO UPDATE SET role = EXCLUDED.role;

-- Test Campaign erstellen
INSERT INTO public.campaigns (id, tenant_id, name, description, is_archived, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'Test Campaign',
  'Meine erste Test-Kampagne',
  false,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Default Status erstellen
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

## Schritt 4: Environment Variables setzen

Erstelle eine `.env.local` Datei im Projekt-Root:

```bash
# Supabase (aus deinem Supabase Dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional für jetzt (später für Production)
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# RESEND_API_KEY=re_xxxxx
# EMAIL_FROM="Kasper Leads <noreply@example.com>"
# APP_BASE_URL=http://localhost:3000
# CRON_SECRET=xxxxx
```

## Schritt 5: App starten

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev
```

Die App sollte jetzt auf `http://localhost:3000` laufen.

## Schritt 6: Testen

1. Öffne `http://localhost:3000/login`
2. Logge dich ein mit:
   - **Admin:** `admin@test.com` / `TestAdmin123!`
   - **Client:** `client@test.com` / `TestClient123!`
3. Du solltest zur Dashboard-Seite weitergeleitet werden

## Fehlerbehebung

### "Could not find the table 'public.memberships'"
→ **Lösung:** Schritt 1 ausführen (Schema-Migration)

### "Invalid login credentials"
→ **Lösung:** Prüfe, ob User in Supabase erstellt wurden und "Auto Confirm" aktiviert war

### "No access" oder leere Seite
→ **Lösung:** Prüfe, ob Memberships korrekt erstellt wurden (Schritt 3)

### RLS Policy Fehler
→ **Lösung:** Die RLS Policies in der Migration sollten funktionieren. Falls nicht, prüfe die User ID in den Memberships.

## Nächste Schritte

Nachdem alles funktioniert:
1. ✅ Indexes-Migration ausführen (`20240102000000_phase9_indexes_and_idempotency.sql`)
2. ✅ Weitere Features testen (CSV Import, API Keys, etc.)
3. ✅ Production Setup vorbereiten (siehe `DEPLOYMENT_CHECKLIST.md`)

