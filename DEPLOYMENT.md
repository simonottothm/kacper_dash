# 🚀 Lead Dashboard - Deployment Guide

## Schnellstart für Vercel Deployment

### 1. Vorbereitung

**Benötigte Informationen:**
- ✅ Supabase Project ID: `pbcpjasiogdfyqmqvibv`
- ✅ Supabase URL: `https://pbcpjasiogdfyqmqvibv.supabase.co`
- ✅ Supabase Anon Key: `sb_publishable_aUqaPD89BuOHxrIYhmiZtA_R6TTJYsD`
- ⚠️ **BENÖTIGT**: Supabase Service Role Key (aus Supabase Dashboard > Settings > API)
- ⚠️ **BENÖTIGT**: Resend API Key (von https://resend.com)
- ⚠️ **BENÖTIGT**: EMAIL_FROM Adresse (z.B. "Kacper Dashboard <noreply@yourdomain.com>")

### 2. Vercel Deployment

#### Option A: Via Vercel Dashboard (Empfohlen)

1. **Repository zu Vercel verbinden:**
   - Gehe zu https://vercel.com/new
   - Wähle dein GitHub Repository
   - Klicke auf "Import"

2. **Environment Variables hinzufügen:**
   
   Gehe zu "Environment Variables" und füge folgende hinzu:

   ```bash
   # Supabase (ALLE ERFORDERLICH)
   NEXT_PUBLIC_SUPABASE_URL=https://pbcpjasiogdfyqmqvibv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_aUqaPD89BuOHxrIYhmiZtA_R6TTJYsD
   SUPABASE_SERVICE_ROLE_KEY=<IHR_SERVICE_ROLE_KEY>

   # Email (ERFORDERLICH für Benachrichtigungen)
   RESEND_API_KEY=<IHR_RESEND_API_KEY>
   EMAIL_FROM=Kacper Dashboard <noreply@yourdomain.com>

   # App Config
   APP_BASE_URL=https://your-domain.vercel.app
   NODE_ENV=production

   # Security (BEREITS GENERIERT)
   CRON_SECRET=5395b9e09962f804a4228791d9bc0c7ed1e63c5899d22ecb1835b1fb55350422
   API_KEY_PEPPER=f0814fccfe9ccf3e0bce3bd09eb9c8080eaa50abf21f0fcc56828b674f534465
   ```

3. **Deploy:**
   - Klicke auf "Deploy"
   - Warte bis Deployment abgeschlossen ist
   - Notiere dir die Deployment URL

#### Option B: Via Vercel CLI

```bash
# Vercel CLI installieren
npm i -g vercel

# In Projekt-Verzeichnis wechseln
cd /Users/simonotto/Desktop/Kacper\ -\ Dashboard

# Deployment starten
vercel

# Environment Variables setzen
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add RESEND_API_KEY
vercel env add EMAIL_FROM
vercel env add APP_BASE_URL
vercel env add CRON_SECRET
vercel env add API_KEY_PEPPER

# Production Deployment
vercel --prod
```

### 3. Supabase Service Role Key finden

1. Gehe zu https://supabase.com/dashboard/project/pbcpjasiogdfyqmqvibv
2. Klicke auf "Settings" (⚙️) in der Sidebar
3. Klicke auf "API"
4. Scrolle zu "Project API keys"
5. Kopiere den **service_role** Key (⚠️ GEHEIM HALTEN!)

### 4. Resend API Key erstellen

1. Gehe zu https://resend.com
2. Erstelle einen Account (falls noch nicht vorhanden)
3. Gehe zu "API Keys"
4. Klicke auf "Create API Key"
5. Gib einen Namen ein (z.B. "Kacper Dashboard Production")
6. Kopiere den API Key

**Optional: Domain verifizieren**
- Gehe zu "Domains" in Resend
- Füge deine Domain hinzu
- Folge den DNS-Anweisungen
- Verwende dann `noreply@yourdomain.com` als EMAIL_FROM

### 5. Nach dem Deployment

#### Cron Jobs verifizieren:
```bash
# Teste Daily Digest
curl -X POST "https://your-domain.vercel.app/api/cron/notifications/digest?token=5395b9e09962f804a4228791d9bc0c7ed1e63c5899d22ecb1835b1fb55350422&mode=daily"

# Teste Weekly Digest
curl -X POST "https://your-domain.vercel.app/api/cron/notifications/digest?token=5395b9e09962f804a4228791d9bc0c7ed1e63c5899d22ecb1835b1fb55350422&mode=weekly"
```

#### Ersten Admin-User erstellen:
1. Gehe zu Supabase Dashboard > Authentication > Users
2. Klicke auf "Add user" > "Create new user"
3. Email: `admin@yourdomain.com`
4. Password: Sicheres Passwort generieren
5. Klicke auf "Create user"

#### Ersten Tenant erstellen:
1. Melde dich im Dashboard an
2. Gehe zu Admin > Tenants
3. Erstelle einen neuen Tenant
4. Weise den Admin-User dem Tenant zu

### 6. Custom Domain (Optional)

1. Gehe zu Vercel Dashboard > Settings > Domains
2. Füge deine Domain hinzu (z.B. `dashboard.yourdomain.com`)
3. Folge den DNS-Anweisungen
4. Warte auf SSL-Zertifikat (automatisch)
5. Update `APP_BASE_URL` in Environment Variables

### 7. Sicherheits-Checkliste

- ✅ `SUPABASE_SERVICE_ROLE_KEY` ist gesetzt und GEHEIM
- ✅ `CRON_SECRET` ist gesetzt (bereits generiert)
- ✅ `API_KEY_PEPPER` ist gesetzt (bereits generiert)
- ✅ RLS Policies sind aktiv (bereits erstellt)
- ✅ SSL ist aktiv (automatisch via Vercel)
- ✅ Environment Variables sind nur für Production/Preview/Development gesetzt

## Troubleshooting

### Problem: "RLS policy violation"
**Lösung:** RLS Policies wurden bereits erstellt. Falls Probleme auftreten:
- Überprüfe ob User ein Membership hat
- Überprüfe ob tenant_id korrekt ist

### Problem: "Email not sending"
**Lösung:**
- Überprüfe `RESEND_API_KEY` in Vercel
- Überprüfe `EMAIL_FROM` Format
- Schaue in Resend Dashboard > Logs

### Problem: "Cron jobs not running"
**Lösung:**
- Überprüfe `vercel.json` ist committed
- Teste Cron endpoint manuell (siehe oben)
- Schaue in Vercel Dashboard > Deployments > Functions

### Problem: "Build fails"
**Lösung:**
```bash
# Lokal testen
npm run build

# Logs in Vercel anschauen
vercel logs
```

## Support

Bei Fragen oder Problemen:
1. Überprüfe Vercel Logs
2. Überprüfe Supabase Logs
3. Überprüfe Browser Console

## Nächste Schritte nach Deployment

1. ✅ Ersten Admin-User erstellen
2. ✅ Ersten Tenant erstellen
3. ✅ Kampagne erstellen
4. ✅ Status-Pipeline konfigurieren
5. ✅ Leads importieren
6. ✅ Email-Benachrichtigungen testen
7. ✅ Client-Users einladen

---

**Deployment Status:**
- ✅ RLS Policies: Erstellt
- ✅ Secrets: Generiert
- ✅ Vercel Config: Bereit
- ✅ Landing Page: Modern & Responsive
- ✅ i18n: Deutsch, English, Polish
- ⚠️ Benötigt: Service Role Key, Resend API Key, EMAIL_FROM
