# syntax=docker/dockerfile:1.7

# ---------- base ----------
FROM oven/bun:1-alpine AS base
WORKDIR /app

# ---------- deps: install all deps for build (cached) ----------
FROM base AS deps
COPY package.json bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# ---------- builder: build Next standalone ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# ---------- prod-deps: lean node_modules for migrations ----------
FROM base AS prod-deps
COPY package.json bun.lock* ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile --production
# drizzle-kit is a dev dep but needed at runtime for db:migrate / db:push
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun add --no-save drizzle-kit

# ---------- runner: minimal runtime image ----------
FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

# Migration tooling: package.json + drizzle config + lib files + migration SQL
COPY --chown=nextjs:nodejs --from=builder /app/package.json ./package.json
COPY --chown=nextjs:nodejs --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --chown=nextjs:nodejs --from=builder /app/src/lib/schema.ts ./src/lib/schema.ts
COPY --chown=nextjs:nodejs --from=builder /app/src/lib/db.ts ./src/lib/db.ts
COPY --chown=nextjs:nodejs --from=builder /app/src/lib/seed.ts ./src/lib/seed.ts
COPY --chown=nextjs:nodejs --from=builder /app/drizzle ./drizzle

# Lean node_modules (prod deps + drizzle-kit for db:push at startup)
COPY --chown=nextjs:nodejs --from=prod-deps /app/node_modules ./node_modules

# Public assets + Next standalone server + static
COPY --chown=nextjs:nodejs --from=builder /app/public ./public
COPY --chown=nextjs:nodejs --from=builder /app/.next/standalone ./
COPY --chown=nextjs:nodejs --from=builder /app/.next/static ./.next/static

# Entrypoint runs db:push then starts the server
COPY --chown=nextjs:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

USER nextjs
EXPOSE 3000

CMD ["/app/docker-entrypoint.sh"]
