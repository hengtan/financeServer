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

# Install Node.js dependencies
RUN npm ci --only=production

# Copy Python requirements
COPY requirements.txt ./

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# Build TypeScript
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PYTHONPATH=/app
ENV PYTHON_SERVICE_URL=http://localhost:8000

# Expose ports
EXPOSE 3001 8000

# Start the hybrid backend
CMD ["npm", "run", "start:hybrid"]
