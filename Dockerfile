FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci --workspaces --include-workspace-root
RUN npm run build:planning-engine
RUN test -d services/planning-engine/dist || exit 1
RUN mkdir -p services/planning-engine/dist/services/planning-engine/prisma/generated && \
    cp -r services/planning-engine/prisma/generated/client services/planning-engine/dist/services/planning-engine/prisma/generated/
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh
ENV DATABASE_URL=${PLANNING_DATABASE_URL}
ENV NODE_ENV=production
ENTRYPOINT ["/app/start.sh"]
