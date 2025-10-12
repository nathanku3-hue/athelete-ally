# --- STAGE 1: Builder ---
FROM node:20.18-slim AS builder
WORKDIR /app

# Copy monorepo build context from root
COPY package*.json ./
COPY tsconfig.base.json ./
COPY turbo.json ./
COPY packages ./packages
COPY services/normalize-service ./services/normalize-service
# 拷貝 scripts 目錄（preinstall 鉤子需要）
COPY scripts ./scripts

# Install and generate Prisma client
RUN npm ci
RUN cd services/normalize-service && npx prisma generate

# Build service
RUN npx turbo run build --filter=normalize-service

# --- STAGE 2: Runner ---
FROM node:20.18-slim
WORKDIR /usr/src/app

# System certs/openssl for TLS
RUN apt-get update && apt-get install -y ca-certificates openssl && rm -rf /var/lib/apt/lists/*

# Copy built artifacts and Prisma schema
COPY --from=builder /app/services/normalize-service/dist ./dist
COPY --from=builder /app/services/normalize-service/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Non-root
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs
USER nodejs

# Port
EXPOSE 4102

CMD ["node", "dist/index.js"]