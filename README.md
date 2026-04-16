# Vital

A mobile-first PWA for tracking body composition via InBody scanner data. Upload your scan, get AI-powered insights, and receive personalised 7-day meal and workout plans. Built for small, invite-only groups.

---

## Features

- **InBody scan import** — upload a CSV/Excel export or enter values manually
- **AI insights** — plain-English analysis of your scan with comparison to previous
- **Meal plans** — AI-generated 7-day plan with macros, based on your goal and scan data
- **Workout plans** — AI-generated weekly training plan (PPL, Upper-Lower, Full Body, Bro Split)
- **Progress charts** — trend lines for weight, body fat %, muscle mass, BMI, visceral fat
- **PWA** — installable on iOS and Android, works offline after first load
- **Invite-only** — no registration flow; users are seeded directly into the database

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, webpack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | SQLite via Prisma 7 + libsql adapter |
| Auth | NextAuth v5 (credentials, JWT) |
| AI | Gemini / Claude / OpenAI — switchable |
| Charts | Recharts v3 |
| PWA | next-pwa |

---

## Local Development

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)

### 1. Clone and install

```bash
git clone https://github.com/your-username/vital.git
cd vital
pnpm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="file:./vital.db"
NEXTAUTH_SECRET="any-random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"

AI_PROVIDER="gemini"          # gemini | claude | openai
GEMINI_API_KEY="AIzaSy..."    # from aistudio.google.com
ANTHROPIC_API_KEY=""          # from console.anthropic.com
OPENAI_API_KEY=""             # from platform.openai.com
```

Only the key matching your chosen `AI_PROVIDER` needs to be set.

**Free AI tier:** Gemini `gemini-2.5-flash` has a free tier (1,500 req/day) — no billing needed for personal use.

### 3. Database setup

```bash
pnpm exec prisma migrate dev
pnpm exec prisma db seed
```

This creates `vital.db` and seeds three accounts:

| Email | Password | Role |
|---|---|---|
| `admin@vital.app` | `Admin@123` | admin |
| `user1@vital.app` | `User@123` | user |
| `user2@vital.app` | `User@123` | user |

### 4. Run

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

---

## Adding Users

There is no registration page by design. To add a new user, run a one-off seed script or insert directly:

```bash
# Interactive — open Prisma Studio
pnpm exec prisma studio

# Or add to prisma/seed.ts and re-run
pnpm exec prisma db seed
```

---

## InBody CSV Import

On the **New Scan** page, drag and drop (or click to upload) a CSV or Excel export from any InBody device. The parser handles column name variations across InBody models (270, 380, 770, etc.) and auto-derives lean body mass if the column is absent.

Fields that cannot be parsed from the file are highlighted in amber — fill them in manually before saving.

---

## AI Configuration

The AI provider is selected via the `AI_PROVIDER` environment variable. All three providers implement the same interface so switching is a one-line change.

| Provider | Model | Free tier |
|---|---|---|
| `gemini` | `gemini-2.5-flash` | Yes (1,500 req/day) |
| `claude` | `claude-sonnet-4-6` | No (pay-per-token) |
| `openai` | `gpt-4o` | No (pay-per-token) |

Get keys:
- Gemini — [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- Claude — [console.anthropic.com](https://console.anthropic.com)
- OpenAI — [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

---

## Project Structure

```
app/
├── (auth)/login/           Login page
└── (app)/
    ├── dashboard/          Home — latest scan + quick actions
    ├── scans/              Scan list, detail, new scan form
    ├── meal-plan/          AI meal plan generator + 7-day viewer
    ├── workout/            AI workout plan generator + viewer
    └── progress/           Trend charts + scan timeline

components/
├── shell/                  Sidebar, TopBar, BottomNav
├── scans/                  ScanForm, ScanCard, ScanCompare
├── meal-plan/              GenerateForm, PlanViewer
├── workout/                GenerateForm, PlanViewer
└── progress/               TrendChart, ScanTimeline

lib/
├── ai/
│   ├── providers/          claude.ts, gemini.ts, openai.ts
│   ├── prompts/            insights.ts, meal-plan.ts, workout-plan.ts
│   └── index.ts            Factory (reads AI_PROVIDER env var)
├── db/prisma.ts            Prisma singleton
├── parsers/                InBody CSV/Excel parser
└── utils/                  BMI / body fat classifiers

prisma/
├── schema.prisma           User, InBodyScan, MealPlan, WorkoutPlan
└── seed.ts                 Default users
```

---

## Running Tests

```bash
pnpm test
```

Tests cover the InBody CSV parser and column normalisation logic.

---

## Production Deployment

### Docker (recommended)

**1. Create production env file**

```bash
cp .env.production.example .env.production
```

Edit `.env.production`:

```env
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://your-domain.com"
AI_PROVIDER="gemini"
GEMINI_API_KEY="AIzaSy..."
```

> `DATABASE_URL` is set automatically by `docker-compose.yml` — do not add it here.

**2. Build and start**

```bash
docker compose up -d --build
```

The container runs `prisma migrate deploy` on every start, so migrations apply automatically on updates.

**3. Seed initial users** (first deploy only)

```bash
docker compose exec vital sh -c "npx tsx prisma/seed.ts"
```

**4. Check logs**

```bash
docker compose logs -f
```

---

### Reverse proxy with Caddy (HTTPS)

Install Caddy on your server, then edit `/etc/caddy/Caddyfile`:

```
your-domain.com {
    reverse_proxy localhost:3000
}
```

```bash
sudo systemctl reload caddy
```

Caddy automatically obtains and renews a Let's Encrypt certificate.

---

### Updates

```bash
git pull
docker compose up -d --build
```

---

### SQLite Backups

The database is stored in a named Docker volume. Back it up with a cron job:

```bash
# /etc/cron.d/vital-backup
0 3 * * * root cp /var/lib/docker/volumes/vital_data/_data/vital.db \
  /opt/vital-backups/vital-$(date +\%Y\%m\%d).db
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite path — `file:./vital.db` (local) or `file:/app/data/vital.db` (Docker) |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT signing — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Full app URL — `http://localhost:3000` or `https://your-domain.com` |
| `AI_PROVIDER` | Yes | `gemini` \| `claude` \| `openai` |
| `GEMINI_API_KEY` | If using Gemini | Google AI Studio key |
| `ANTHROPIC_API_KEY` | If using Claude | Anthropic console key |
| `OPENAI_API_KEY` | If using OpenAI | OpenAI platform key |

---

## License

MIT
