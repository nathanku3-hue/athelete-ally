FROM node:20-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies with npm ci (deterministic, production-standard)
RUN npm ci --workspaces --include-workspace-root

# Build the planning-engine service
RUN npm run build:planning-engine

# Verify build succeeded
RUN test -d services/planning-engine/dist || (echo "ERROR: dist directory not found after build" && exit 1)

emergency/dockerfile-fix
# Start the service - use ENTRYPOINT to prevent Railway from overriding
ENTRYPOINT ["node", "services/planning-engine/dist/index.js"]
=======
# Start the service
CMD ["node", "services/planning-engine/dist/index.js"]
main
