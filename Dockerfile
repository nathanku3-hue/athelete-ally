FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci --workspaces --include-workspace-root
RUN npm run build:planning-engine
RUN test -d services/planning-engine/dist || exit 1
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh
final/working-dockerfile

ENV DATABASE_URL=${PLANNING_DATABASE_URL}

=======
main
ENTRYPOINT ["/app/start.sh"]
