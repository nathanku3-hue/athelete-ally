# --- STAGE 1: Builder ---
FROM node:20.18-slim AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY turbo.json ./
COPY packages ./packages
COPY services/adaptive-engine ./services/adaptive-engine

RUN npm ci --no-audit --no-fund
RUN npx turbo run build --filter=adaptive-engine

# --- STAGE 2: Runner ---
FROM node:20.18-slim
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y ca-certificates openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/services/adaptive-engine/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

USER node
EXPOSE 4104
CMD ["node", "dist/index.js"]
