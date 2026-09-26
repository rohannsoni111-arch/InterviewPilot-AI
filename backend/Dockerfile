# Multi-stage Dockerfile for Backend API
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root manifests and lockfile
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies across workspaces
RUN npm ci

# Copy sources
COPY tsconfig.base.json ./
COPY shared/ ./shared/
COPY backend/ ./backend/

# Build shared and backend packages
RUN npm --workspace=shared run build
RUN npm --workspace=backend run build

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install dumb-init for clean PID 1 signal management
RUN apk add --no-cache dumb-init

# Copy package files and install production dependencies only
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

RUN npm ci --omit=dev

# Copy compiled artifacts from builder stage
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/backend/dist ./backend/dist

# Security: run as non-root user
USER node

EXPOSE 5000

CMD ["dumb-init", "node", "backend/dist/server.js"]
