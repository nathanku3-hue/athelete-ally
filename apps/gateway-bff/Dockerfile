# --- STAGE 1: Builder ---
FROM node:lts-alpine AS builder
WORKDIR /app

# Copy all required files from root context
COPY package*.json ./
COPY tsconfig.base.json ./
COPY turbo.json ./
hotfix/main-clean-dockerfile
=======
fix/gateway-bff-dockerfile
=======
fix/deploy-workflow-dockerfile-backend
main
main
# Copy scripts directory (needed for preinstall hook)
COPY scripts ./scripts
# Copy config directory (needed for tsconfig.base.json)
COPY config ./config
# Copy all workspace packages
hotfix/main-clean-dockerfile
=======
fix/gateway-bff-dockerfile
=======
=======
# 拷貝 scripts 目錄 (preinstall hook 需要)
COPY scripts ./scripts
fix/deploy-workflow-dockerfile-backend
# 拷貝 config 目錄 (tsconfig.base.json 需要)
COPY config ./config
=======
main
# 拷貝所有需要被 link 的 workspace
main
main
main
COPY packages ./packages
COPY apps/gateway-bff ./apps/gateway-bff

# Install all dependencies
RUN npm ci

hotfix/main-clean-dockerfile
# Build workspace dependencies (in dependency order)
=======
fix/gateway-bff-dockerfile
# Build workspace dependencies (in dependency order)
=======
fix/deploy-workflow-dockerfile-backend
# Build workspace dependencies (in dependency order)
=======
# 構建 workspace 依賴（按依賴順序）
main
main
main
RUN npm run build -w @athlete-ally/logger || true
RUN npm run build -w @athlete-ally/health-schema || true
RUN npm run build -w @athlete-ally/shared-types || true
RUN npm run build -w @athlete-ally/shared || true

hotfix/main-clean-dockerfile
# Build gateway-bff
=======
fix/gateway-bff-dockerfile
# Build gateway-bff
=======
fix/deploy-workflow-dockerfile-backend
# Build gateway-bff
=======
# 在完整的 monorepo 上下文中，只構建我們需要的那個服務
main
main
main
RUN npm run build -w @athlete-ally/gateway-bff

# --- STAGE 2: Runner ---
FROM node:lts-alpine
WORKDIR /usr/src/app

# Install OpenSSL and required system libraries
RUN apk add --no-cache openssl

hotfix/main-clean-dockerfile
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
=======
fix/gateway-bff-dockerfile
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
=======
fix/deploy-workflow-dockerfile-backend
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
=======
# 從 builder 階段，拷貝編譯好的產物和生產依賴
# 注意路徑是相對於 builder 內部的 /app 目錄
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
# 拷貝構建好的 workspace packages（包含 OpenAPI 規格文件）
COPY --from=builder /app/packages ./packages
# 拷貝 gateway-bff app（包含 dist 和 package.json）
COPY --from=builder /app/apps/gateway-bff ./apps/gateway-bff
# 僅安裝生產依賴（會 link 已構建的 workspace packages）
RUN npm ci --production --workspaces --include-workspace-root

# 創建非 root 用戶
main
main
main
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

# Expose port
EXPOSE 4000

hotfix/main-clean-dockerfile
# Start command
CMD ["node", "apps/gateway-bff/dist/index.js"]
=======
fix/gateway-bff-dockerfile
# Start command
CMD ["node", "apps/gateway-bff/dist/index.js"]
=======
fix/deploy-workflow-dockerfile-backend
# Start command
CMD ["node", "apps/gateway-bff/dist/index.js"]
=======
# 啟動服務器的命令
CMD ["node", "apps/gateway-bff/dist/index.js"]
main
main
main
