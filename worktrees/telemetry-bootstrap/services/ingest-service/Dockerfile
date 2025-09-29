# --- STAGE 1: Builder ---
FROM node:20.18-slim AS builder
WORKDIR /app

# Copy monorepo build context from root
COPY package*.json ./
COPY tsconfig.base.json ./
COPY turbo.json ./
COPY packages ./packages
COPY services/ingest-service ./services/ingest-service

# Install and build
RUN npm ci
RUN npx turbo run build --filter=ingest

# --- STAGE 2: Runner ---
FROM node:20.18-slim
WORKDIR /usr/src/app

# System certs/openssl for TLS
RUN apt-get update && apt-get install -y ca-certificates openssl && rm -rf /var/lib/apt/lists/*

# Copy built artifacts and dependencies
COPY --from=builder /app/services/ingest-service/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Non-root
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs
USER nodejs

# Port
EXPOSE 4101

CMD ["node", "dist/index.js"]