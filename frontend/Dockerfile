# Multi-stage Dockerfile for Frontend SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root manifests and workspace package.json files
COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm ci

# Copy source trees
COPY tsconfig.base.json ./
COPY shared/ ./shared/
COPY frontend/ ./frontend/

# Build shared package then frontend production bundle
RUN npm --workspace=shared run build
RUN npm --workspace=frontend run build

# Production Nginx Server
FROM nginx:alpine AS runner

# Copy customized Nginx server configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy production static assets from builder stage
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
