FROM node:20-alpine
WORKDIR /app
hotfix/clean-dockerfile
COPY . .
RUN npm ci --workspaces --include-workspace-root
RUN npm run build:planning-engine
=======
emergency/ci-blocker-final
=======

main
COPY . .
RUN npm ci --workspaces --include-workspace-root
RUN npm run build:planning-engine
emergency/ci-blocker-final
main
RUN test -d services/planning-engine/dist || exit 1
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh
ENTRYPOINT ["/app/start.sh"]
hotfix/clean-dockerfile
=======
=======

RUN test -d services/planning-engine/dist || (echo "Build verification failed" && exit 1)

fix/dockerfile-conflict
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENTRYPOINT ["/app/start.sh"]
=======
ENTRYPOINT ["node", "services/planning-engine/dist/index.js"]
main
main
main
