# Multi-stage build for insights-engine service
FROM node:20.18-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY services/insights-engine/package.json ./services/insights-engine/
# 拷貝 scripts 目錄（preinstall 鉤子需要）
COPY scripts ./scripts
COPY packages/event-bus/package.json ./packages/event-bus/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/contracts/package.json ./packages/contracts/

# Install dependencies
RUN npm ci --only=production

# Build stage
FROM base AS builder
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY services/insights-engine/package.json ./services/insights-engine/
# 拷貝 scripts 目錄（preinstall 鉤子需要）
COPY scripts ./scripts
COPY packages/event-bus/package.json ./packages/event-bus/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/contracts/package.json ./packages/contracts/

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY services/insights-engine ./services/insights-engine
# 拷貝 scripts 目錄（preinstall 鉤子需要）
COPY scripts ./scripts
COPY packages ./packages
COPY tsconfig.base.json ./

# Generate Prisma client
WORKDIR /usr/src/app/services/insights-engine
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /usr/src/app

# Copy built application
COPY --from=builder /usr/src/app/services/insights-engine/dist ./dist
COPY --from=builder /usr/src/app/services/insights-engine/prisma ./prisma
COPY --from=builder /usr/src/app/services/insights-engine/package.json ./

# Copy node_modules
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=deps /usr/src/app/services/insights-engine/node_modules ./node_modules

# Expose port
EXPOSE 4103

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4103/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]