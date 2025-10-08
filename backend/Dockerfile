# Multi-stage build for Node.js + Python hybrid backend
FROM node:20-slim AS base

# Install Python 3.11 and system dependencies
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3.11-venv \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL Node.js dependencies (including devDependencies for build)
RUN npm install

# Copy Python requirements
COPY requirements.txt ./

# Install Python dependencies
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy application code
COPY . .

# Build TypeScript (prisma generate is in the build script)
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# Set environment variables
ENV NODE_ENV=production
ENV PYTHONPATH=/app
ENV PYTHON_SERVICE_URL=http://localhost:8000

# Expose ports
EXPOSE 3001 8000

# Start the hybrid backend
CMD ["npm", "run", "start:hybrid"]
