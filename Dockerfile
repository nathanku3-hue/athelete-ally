FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci --workspaces --include-workspace-root
RUN npm run build:planning-engine
RUN test -d services/planning-engine/dist || exit 1
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh
ENV DATABASE_URL=${PLANNING_DATABASE_URL}
emergency/final-fix
ENV PORT=3004
ENV NODE_ENV=production
ENTRYPOINT ["/app/start.sh"]
=======
emergency/final-fix
ENV PORT=3004
ENV NODE_ENV=production

=======
main
ENTRYPOINT ["/app/start.sh"]
main
