FROM node:20-alpine

WORKDIR /app

# Copy all source code
COPY . .

# Install dependencies
RUN npm ci --workspaces --include-workspace-root --include=dev --no-audit --no-fund

# Build (DATABASE_URL needed for prisma generate)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npm run build:planning-engine

# Verify build output exists and NEVER gets overwritten
RUN ls -la services/planning-engine/dist && echo "✓ Build successful - dist exists" || (echo "✗ ERROR: dist not found" && exit 1)

# Start the service
CMD ["node", "services/planning-engine/dist/index.js"]
