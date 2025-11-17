# --- STAGE 1: Builder ---
FROM node:lts-alpine AS builder
WORKDIR /app

# Copy all required files from root context
COPY package*.json ./
COPY tsconfig.base.json ./
COPY turbo.json ./
# Copy scripts directory (needed for preinstall hook)
COPY scripts ./scripts
# Copy config directory (needed for tsconfig.base.json)
COPY config ./config
# Copy all workspace packages
COPY packages ./packages
COPY apps/gateway-bff ./apps/gateway-bff

# Install all dependencies
RUN npm ci

# Build workspace dependencies (in dependency order)
RUN npm run build -w @athlete-ally/logger || true
RUN npm run build -w @athlete-ally/health-schema || true
RUN npm run build -w @athlete-ally/shared-types || true
RUN npm run build -w @athlete-ally/shared || true

# Build gateway-bff
RUN npm run build -w @athlete-ally/gateway-bff

# --- STAGE 2: Runner ---
FROM node:lts-alpine
WORKDIR /usr/src/app

# Install OpenSSL and required system libraries
RUN apk add --no-cache openssl

# Copy built artifacts from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
# Copy built workspace packages (includes OpenAPI spec)
COPY --from=builder /app/packages ./packages
# Copy gateway-bff app (includes dist and package.json)
COPY --from=builder /app/apps/gateway-bff ./apps/gateway-bff
# Install production dependencies only (will link built workspace packages)
RUN npm ci --production --workspaces --include-workspace-root

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

# Expose port
EXPOSE 4000

# Start command
CMD ["node", "apps/gateway-bff/dist/index.js"]
