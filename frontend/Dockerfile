# ================================================================
# Multi-stage Docker build for FinanceServer Frontend
# Optimized for production with NGINX serving
# ================================================================

# ================================================================
# Stage 1: Dependencies
# ================================================================
FROM node:18-alpine AS dependencies

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production \
    && npm cache clean --force

# ================================================================
# Stage 2: Build
# ================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY src ./src/
COPY public ./public/
COPY index.html ./
COPY .env* ./

# Build the application
RUN npm run build

# ================================================================
# Stage 3: Production with NGINX
# ================================================================
FROM nginx:alpine AS production

# Install additional packages
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Create nginx user and directories
RUN addgroup -g 1001 -S nginx-app \
    && adduser -S nginx-app -u 1001 -G nginx-app

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create log directory and set permissions
RUN mkdir -p /var/log/nginx \
    && chown -R nginx-app:nginx-app /var/log/nginx \
    && chown -R nginx-app:nginx-app /usr/share/nginx/html \
    && chown -R nginx-app:nginx-app /var/cache/nginx \
    && chown -R nginx-app:nginx-app /etc/nginx

# Switch to non-root user
USER nginx-app

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# ================================================================
# Labels for metadata
# ================================================================
LABEL maintainer="FinanceServer Team"
LABEL version="1.0.0"
LABEL description="FinanceServer Frontend - React Application"
LABEL org.opencontainers.image.source="https://github.com/hengtan/financeServer"
LABEL org.opencontainers.image.description="Enterprise financial management frontend"
LABEL org.opencontainers.image.vendor="FinanceServer"