FROM node:20-alpine AS builder

WORKDIR /app

# Copy all source code first (needed for workspace structure)
COPY . .

# Install all dependencies
RUN npm ci --workspaces --include-workspace-root --include=dev --no-audit --no-fund

# Build packages and planning-engine (DATABASE_URL needed for prisma generate)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npm run build:planning-engine

# Verify build output exists
RUN ls -la services/planning-engine/dist && echo "Build successful" || (echo "ERROR: dist directory not found" && exit 1)

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built artifacts and necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/services/planning-engine/dist ./services/planning-engine/dist
COPY --from=builder /app/services/planning-engine/package*.json ./services/planning-engine/
COPY --from=builder /app/services/planning-engine/prisma ./services/planning-engine/prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Start the service
CMD ["node", "services/planning-engine/dist/index.js"]
