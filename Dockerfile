FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files - copy workspace directories first to preserve structure
COPY package*.json ./
COPY packages ./packages
COPY services ./services
COPY apps ./apps
hotfix/docker-build-127

# Copy scripts directory for preinstall hook
COPY scripts ./scripts
=======
main

# Install all dependencies
RUN npm ci --workspaces --include-workspace-root --include=dev --no-audit --no-fund

# Copy source code
COPY . .

# Build packages and planning-engine
RUN npm run build:planning-engine

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built artifacts and necessary files
COPY --from=builder /app/services/planning-engine/dist ./services/planning-engine/dist
COPY --from=builder /app/services/planning-engine/package*.json ./services/planning-engine/
COPY --from=builder /app/services/planning-engine/prisma ./services/planning-engine/prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Start the service
CMD ["node", "services/planning-engine/dist/index.js"]
