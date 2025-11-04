# Multi-stage build for Next.js frontend
# Updated to force Railway rebuild
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files (root and workspaces needed for install)
COPY package.json package-lock.json* ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/health-schema/package.json ./packages/health-schema/
COPY packages/logger/package.json ./packages/logger/
COPY packages/protocol-types/package.json ./packages/protocol-types/
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared-types/package.json ./packages/shared-types/

# Copy scripts directory (needed for preinstall hook)
COPY scripts ./scripts

# Install dependencies
RUN npm ci --workspaces --include-workspace-root

# Build stage
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps stage (workspaces hoist to root)
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

hotfix/main-sync
# Build workspace dependencies that frontend imports (in dependency order)
RUN npm run build -w @athlete-ally/health-schema
RUN npm run build -w @athlete-ally/shared-types
RUN npm run build -w @athlete-ally/logger
RUN npm run build -w @athlete-ally/shared
=======
hotfix/frontend-final-clean
=======
hotfix/frontend-followup
=======
hotfix/frontend-build-all-deps
main
main
# Build workspace dependencies that frontend imports (in dependency order)
RUN npm run build -w @athlete-ally/health-schema
RUN npm run build -w @athlete-ally/shared-types
RUN npm run build -w @athlete-ally/logger
RUN npm run build -w @athlete-ally/shared
hotfix/frontend-final-clean
=======
hotfix/frontend-followup
=======
=======
# Build workspace dependencies that frontend imports
RUN npm run build -w @athlete-ally/health-schema
RUN npm run build -w @athlete-ally/shared-types
main
main
main
main

# Build Next.js application
WORKDIR /app/apps/frontend
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="*******"

CMD ["node", "apps/frontend/server.js"]
