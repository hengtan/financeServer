# ================================================================
# Multi-stage Docker build for FinanceServer Frontend
# Optimized for production with NGINX serving
# ================================================================

# ================================================================
# Stage 1: Build
# ================================================================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Add build arguments for optimization
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Install dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Copy package files first for better layer caching
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Install dependencies
RUN npm ci --frozen-lockfile \
    && npm cache clean --force

# Copy source code
COPY src ./src/
COPY public ./public/
COPY index.html ./
COPY .env* ./

# Build the application with optimizations
RUN npm run build

# Remove development dependencies to reduce size
RUN npm prune --production

# ================================================================
# Stage 2: Production with NGINX
# ================================================================
FROM nginx:1.25-alpine AS production

# Install required packages
RUN apk add --no-cache \
    curl \
    tzdata \
    && rm -rf /var/cache/apk/*

# Create nginx user and set timezone
RUN addgroup -g 1001 -S nginx-app \
    && adduser -S nginx-app -u 1001 -G nginx-app \
    && cp /usr/share/zoneinfo/UTC /etc/localtime \
    && echo "UTC" > /etc/timezone

# Create necessary directories
RUN mkdir -p /var/cache/nginx/client_temp \
    && mkdir -p /var/cache/nginx/proxy_temp \
    && mkdir -p /var/cache/nginx/fastcgi_temp \
    && mkdir -p /var/cache/nginx/uwsgi_temp \
    && mkdir -p /var/cache/nginx/scgi_temp \
    && mkdir -p /var/log/nginx \
    && mkdir -p /var/run

# Copy built assets from builder stage
COPY --from=builder --chown=nginx-app:nginx-app /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY --chown=nginx-app:nginx-app nginx.conf /etc/nginx/nginx.conf

# Set proper permissions
RUN chown -R nginx-app:nginx-app /var/cache/nginx \
    && chown -R nginx-app:nginx-app /var/log/nginx \
    && chown -R nginx-app:nginx-app /etc/nginx \
    && chown -R nginx-app:nginx-app /usr/share/nginx/html \
    && chown -R nginx-app:nginx-app /var/run \
    && chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx-app

# Expose port
EXPOSE 80

# Health check with improved configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx with improved signal handling
STOPSIGNAL SIGQUIT
CMD ["nginx", "-g", "daemon off;"]

# ================================================================
# Labels for metadata
# ================================================================
LABEL maintainer="FinanceServer Team"
LABEL version="1.0.0"
LABEL description="FinanceServer Frontend - React Application with Vite"
LABEL org.opencontainers.image.source="https://github.com/hengtan/financeServer"
LABEL org.opencontainers.image.description="Enterprise financial management frontend built with React, TypeScript, and Vite"
LABEL org.opencontainers.image.vendor="FinanceServer"
LABEL org.opencontainers.image.title="FinanceServer Frontend"
LABEL org.opencontainers.image.created="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"