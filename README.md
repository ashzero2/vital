# Vital

A mobile-first PWA for tracking body composition via InBody scanner data, getting AI-powered insights, and receiving personalized meal and workout plans. Built for a small, invite-only group.

## Stack

- **Next.js 16** (App Router, webpack mode)
- **TypeScript** strict
- **Tailwind CSS** + **shadcn/ui**
- **Prisma 7** + **SQLite** (via libsql adapter)
- **NextAuth v5** — credentials-based, invite-only
- **Gemini / Claude / OpenAI** — switchable AI provider
- **Recharts** — progress trend charts
- **next-pwa** — installable PWA

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite path, e.g. `file:./vital.db` |
| `NEXTAUTH_SECRET` | Random 32-char string |
| `AI_PROVIDER` | `gemini` \| `claude` \| `openai` |
| `GEMINI_API_KEY` | Google Gemini API key |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key |

### 3. Run migrations and seed

```bash
pnpm exec prisma migrate dev
pnpm exec prisma db seed
```

### 4. Start dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Default credentials (after seed): `admin@vital.app` / `Admin@123`

## Project Structure

```
app/
  (auth)/login/        # Login page
  (app)/dashboard/     # Main dashboard
  (app)/scans/         # InBody scan management
  (app)/meal-plan/     # AI meal plan generation
  (app)/workout-plan/  # AI workout plan generation
  (app)/progress/      # Trend charts
  api/                 # API routes
lib/
  db/prisma.ts         # Prisma singleton
  ai/                  # AI provider layer
  parsers/             # InBody CSV/Excel parsers
  utils/               # Metric calculations
components/
  ui/                  # shadcn/ui components
  dashboard/           # Dashboard widgets
  scans/               # Scan form & cards
  meal-plan/           # Meal plan views
  workout-plan/        # Workout plan views
  progress/            # Trend charts
prisma/
  schema.prisma        # DB schema
```

## Production

```bash
# Build
pnpm build

# Docker
docker build -t vital:latest .
docker compose up -d
```

See `IMPLEMENTATION_PLAN.md` for the full phase-by-phase build plan.
