# ================================================================
# Multi-stage Docker build for FinanceServer Backend
# Optimized for production with security and performance
# ================================================================

# ================================================================
# Stage 1: Dependencies
# ================================================================
FROM node:18-alpine AS dependencies

# Set working directory
WORKDIR /app

# Install system dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    && ln -sf python3 /usr/bin/python

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install --only=production \
    && npm cache clean --force

# ================================================================
# Stage 2: Build
# ================================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev)
RUN npm install

# Copy source code
COPY src ./src/

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# ================================================================
# Stage 3: Production
# ================================================================
FROM node:18-alpine AS production

# Create app user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Install production system dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy configuration files
COPY --chown=nodejs:nodejs .env.example ./.env.example

# Create necessary directories
RUN mkdir -p /app/logs /app/uploads \
    && chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Start the application with proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]

# ================================================================
# Labels for metadata
# ================================================================
LABEL maintainer="FinanceServer Team"
LABEL version="1.0.0"
LABEL description="FinanceServer Backend - Enterprise Financial Management API"
LABEL org.opencontainers.image.source="https://github.com/hengtan/financeServer"
LABEL org.opencontainers.image.description="Enterprise-grade financial management backend"
LABEL org.opencontainers.image.vendor="FinanceServer"