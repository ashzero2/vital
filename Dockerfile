# ─── Stage 1: base ───────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

# ─── Stage 2: deps ───────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ─── Stage 3: builder ────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN pnpx prisma generate

# Build Next.js with standalone output enabled
ENV NEXT_TELEMETRY_DISABLED=1
ENV STANDALONE=1
RUN pnpm build --webpack

# ─── Stage 4: runner ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@latest --activate

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static    ./.next/static
COPY --from=builder /app/public          ./public

# Copy Prisma for migrations at runtime
COPY --from=builder /app/node_modules/.pnpm              ./node_modules/.pnpm
COPY --from=builder /app/node_modules/@prisma            ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma             ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma        ./node_modules/.bin/prisma
COPY --from=builder /app/prisma                          ./prisma
COPY --from=builder /app/prisma.config.ts                ./prisma.config.ts
COPY --from=builder /app/lib/generated                   ./lib/generated

# SQLite data directory (mounted as volume)
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
