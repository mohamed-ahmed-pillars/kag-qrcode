# Use Node.js for building (more compatible)
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app

# Install dependencies using npm
COPY package.json package-lock.json* ./
RUN npm ci

# Build the application with Node.js
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image with Node.js
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy package files for migration tools
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json* ./package-lock.json

# Copy database schema and migration config
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/src/lib/schema.ts ./src/lib/schema.ts
COPY --from=builder /app/src/lib/db.ts ./src/lib/db.ts
COPY --from=builder /app/src/lib/seed.ts ./src/lib/seed.ts

# Copy node_modules for drizzle-kit and dependencies
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/public ./public

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Fix permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
