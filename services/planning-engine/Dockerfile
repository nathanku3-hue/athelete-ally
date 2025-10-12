# --- STAGE 1: Builder ---
FROM node:lts-alpine AS builder
WORKDIR /app

# 關鍵：從根上下文，拷貝所有構建所需的文件
COPY package*.json ./
COPY tsconfig.base.json ./
COPY turbo.json ./
# 拷貝所有需要被 link 的 workspace
COPY packages ./packages
COPY services/planning-engine ./services/planning-engine
# 拷貝 scripts 目錄（preinstall 鉤子需要）
COPY scripts ./scripts

# 運行完整的 monorepo 安裝
RUN npm ci

# 在完整的 monorepo 上下文中，只構建我們需要的那個服務
RUN npx turbo run build --filter=planning-engine

# --- STAGE 2: Runner ---
FROM node:lts-alpine
WORKDIR /usr/src/app

# 安裝 OpenSSL 和必要的系統庫
RUN apk add --no-cache openssl ca-certificates

# 從 builder 階段，拷貝編譯好的產物和完整的依賴
# 注意路徑是相對於 builder 內部的 /app 目錄
COPY --from=builder /app/services/planning-engine/dist ./dist
COPY --from=builder /app/services/planning-engine/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# 生成 Prisma 客戶端
RUN npx prisma generate

# 創建非 root 用戶
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

# 暴露端口 - 与配置保持一致
EXPOSE 4102

# 啟動服務器的命令
CMD ["node", "dist/index.js"]