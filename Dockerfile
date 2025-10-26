FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm ci --workspaces --include-workspace-root

RUN npm run build:planning-engine

RUN test -d services/planning-engine/dist || (echo "Build verification failed" && exit 1)

fix/dockerfile-conflict
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENTRYPOINT ["/app/start.sh"]
=======
ENTRYPOINT ["node", "services/planning-engine/dist/index.js"]
main
