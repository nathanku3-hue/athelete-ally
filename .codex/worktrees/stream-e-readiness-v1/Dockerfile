# Multi-stage build (monorepo-aware, Node 20.18.0)
FROM node:20.18.0-alpine AS base
RUN apk add --no-cache libc6-compat gcompat curl
WORKDIR /app

# Dependencies layer (dev deps for build)
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts && npm cache clean --force

# Builder (root build compiles monorepo; Next.js app at apps/frontend)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/package.json /app/package-lock.json ./
COPY . .
RUN npm ci && npm run build

# Runtime (non-root, minimal)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy Next.js standalone output
COPY --from=builder /app/apps/frontend/public ./public
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./.next/static

# Permissions
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# HEALTHCHECK to in-app endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD curl -fsS http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]

