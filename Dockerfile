# Dockerfile for Next.js Frontend - Monorepo Optimized

# --- Stage 1: Installer ---
# This stage installs all dependencies, including monorepo workspaces
FROM node:lts-alpine AS installer
WORKDIR /app

# Copy all package.json and lock files from the entire monorepo
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared/package.json ./packages/shared/
COPY packages/event-bus/package.json ./packages/event-bus/
COPY packages/contracts/package.json ./packages/contracts/

# Install all dependencies for the entire monorepo
RUN npm ci

# --- Stage 2: Builder ---
# This stage builds the Next.js application
FROM node:lts-alpine AS builder
WORKDIR /app

# Copy the fully installed node_modules from the installer stage
COPY --from=installer /app/node_modules ./node_modules
# Copy the root package.json and lock files
COPY package.json package-lock.json ./
# Copy the source code of the packages we need
COPY packages/shared-types ./packages/shared-types
COPY packages/shared ./packages/shared
COPY packages/event-bus ./packages/event-bus
COPY packages/contracts ./packages/contracts
# Copy the frontend source code
COPY src ./src
COPY public ./public
COPY next.config.mjs ./
COPY tailwind.config.mjs ./
COPY postcss.config.mjs ./
COPY tsconfig.json ./
COPY tsconfig.base.json ./

# Build the Next.js application
RUN npm run build

# --- Stage 3: Production Runner ---
FROM node:lts-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV production

# Copy the standalone output from the builder stage
# It will contain the necessary node_modules and code from shared packages
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose the port Next.js runs on
EXPOSE 3000

# The command to start the server
CMD ["node", "server.js"]