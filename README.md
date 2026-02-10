# 🎯 Lead Dashboard

Ein modernes, professionelles Lead-Management-System gebaut mit Next.js, Supabase und TypeScript.

![Lead Dashboard](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Powered-green?style=for-the-badge&logo=supabase)

## ✨ Features

### 🎨 Modernes Design
- **Apple-inspiriertes UI** mit sauberen Linien und subtilen Animationen
- **Responsive Design** für Desktop, Tablet und Mobile
- **Dark Mode Ready** mit CSS Variablen
- **Gradient Accents** für moderne Ästhetik

### 🌍 Mehrsprachig
- **Deutsch** (Standard)
- **English**
- **Polski**
- Cookie-basierte Sprachpersistenz
- Einfacher Sprachwechsel in den Einstellungen

### 🔐 Sicherheit
- **Row Level Security (RLS)** auf allen Tabellen
- **Multi-Tenant Architektur** mit strikter Datentrennung
- **API Key Management** mit Pepper-Hashing
- **Rate Limiting** zum Schutz vor Missbrauch
- **Sichere Session-Verwaltung** mit Supabase Auth

### 📊 Lead-Management
- **Lead-Verwaltung** - Erstellen, Bearbeiten, Löschen
- **Kampagnen-Tracking** - Organisieren Sie Leads in Kampagnen
- **Status-Pipeline** - Konfigurierbare Status-Workflows
- **Custom Fields** - Flexible Datenfelder
- **Timeline** - Vollständige Aktivitätshistorie
- **CSV Import** - Bulk-Import von Leads

### 🔔 Benachrichtigungen
- **Echtzeit-Benachrichtigungen** im Dashboard
- **Email-Digests** (täglich/wöchentlich)
- **Konfigurierbare Präferenzen** pro User
- **Badge-Counts** für ungelesene Benachrichtigungen

### 👥 Team-Funktionen
- **Multi-User Support** mit Rollen (Admin/Client)
- **Tenant-Verwaltung** für Agenturen
- **Einladungssystem** für neue User
- **Kampagnen-Zuweisungen** (optional)

### 🔌 Integrationen
- **Make.com Webhook** für automatische Lead-Erfassung
- **Resend** für Email-Versand
- **Vercel Cron Jobs** für automatische Digests

## 🚀 Quick Start

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn
- Supabase Account
- Resend Account (für Emails)

### Installation

```bash
# Repository klonen
git clone <your-repo-url>
cd kacper-dashboard

# Dependencies installieren
npm install

# Environment Variables kopieren
cp .env.example .env.local

# Environment Variables ausfüllen (siehe unten)
# Dann Development Server starten
npm run dev
```

### Environment Variables

Erstelle eine `.env.local` Datei:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://pbcpjasiogdfyqmqvibv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_aUqaPD89BuOHxrIYhmiZtA_R6TTJYsD
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Email (Resend)
RESEND_API_KEY=<your-resend-api-key>
EMAIL_FROM="Kacper Dashboard <noreply@yourdomain.com>"

# App
APP_BASE_URL=http://localhost:3002
NODE_ENV=development

# Security
CRON_SECRET=5395b9e09962f804a4228791d9bc0c7ed1e63c5899d22ecb1835b1fb55350422
API_KEY_PEPPER=f0814fccfe9ccf3e0bce3bd09eb9c8080eaa50abf21f0fcc56828b674f534465
```

## 📦 Tech Stack

### Frontend
- **Next.js 14** - React Framework mit App Router
- **TypeScript** - Type Safety
- **Tailwind CSS** - Utility-First CSS
- **Lucide React** - Icon Library
- **next-intl** - Internationalisierung

### Backend
- **Supabase** - PostgreSQL Database + Auth
- **Supabase RLS** - Row Level Security
- **Resend** - Email Service
- **Vercel** - Hosting & Serverless Functions

### Development
- **ESLint** - Code Linting
- **Prettier** - Code Formatting (optional)
- **Git** - Version Control

## 📁 Projekt-Struktur

```
kacper-dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth-Seiten (Login, etc.)
│   │   ├── (protected)/       # Geschützte Seiten (Dashboard, etc.)
│   │   ├── api/               # API Routes
│   │   ├── layout.tsx         # Root Layout
│   │   └── page.tsx           # Landing Page
│   ├── components/            # React Components
│   │   ├── layout/           # Layout Components
│   │   ├── leads/            # Lead Components
│   │   ├── settings/         # Settings Components
│   │   └── ...
│   ├── lib/                   # Utilities & Helpers
│   │   ├── auth/             # Auth Utilities
│   │   ├── data/             # Data Fetching
│   │   ├── i18n/             # Internationalization
│   │   ├── security/         # Security (Rate Limiting, etc.)
│   │   └── supabase/         # Supabase Clients
│   └── styles/               # Global Styles
├── messages/                  # i18n Translation Files
│   ├── de.json               # Deutsch
│   ├── en.json               # English
│   └── pl.json               # Polski
├── public/                    # Static Assets
├── .env.example              # Environment Variables Template
├── vercel.json               # Vercel Configuration (Cron Jobs)
├── tailwind.config.ts        # Tailwind Configuration
├── next.config.js            # Next.js Configuration
└── package.json              # Dependencies
```

## 🎨 Design System

### Farben
- **Background**: `#f7f8fa` - Soft Gray
- **Accent**: `#4f46e5` - Vibrant Indigo
- **Success**: `#10b981` - Green
- **Warning**: `#f59e0b` - Amber
- **Error**: `#ef4444` - Red
- **Info**: `#3b82f6` - Blue

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

### Shadows
- Ultra-subtle shadows (0.03-0.07 opacity)
- Smooth transitions
- Hover effects

## 🔒 Sicherheit

### RLS Policies
Alle Tabellen haben Row Level Security aktiviert:
- Users können nur Daten ihres Tenants sehen
- Admins haben erweiterte Rechte
- Service Role Key wird nur server-side verwendet

### API Security
- Rate Limiting auf allen API Routes
- CRON_SECRET für Cron Jobs
- API_KEY_PEPPER für API Key Hashing

### Best Practices
- Keine Secrets im Client-Code
- Environment Variables für alle Konfiguration
- Sichere Session-Verwaltung

## 📖 Deployment

Siehe [DEPLOYMENT.md](./DEPLOYMENT.md) für detaillierte Deployment-Anweisungen.

### Quick Deploy zu Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

## 🧪 Testing

```bash
# Build testen
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📝 Lizenz

Alle Rechte vorbehalten © 2026

## 🤝 Support

Bei Fragen oder Problemen:
1. Überprüfe [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Schaue in die Vercel Logs
3. Überprüfe Supabase Logs

## 🎯 Roadmap

- [ ] Export-Funktionen (CSV, PDF)
- [ ] Erweiterte Filterung
- [ ] Dashboard Analytics
- [ ] Mobile App
- [ ] Weitere Integrationen (Zapier, etc.)

---

**Built with ❤️ using Next.js, Supabase & TypeScript**
