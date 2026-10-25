# ─────────────────────────────────────────────────────────────
# Madras Macha — Backend Container (Assignment 3, Step 2)
# Production-ready Node.js 22 LTS Alpine base
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine

# Set working directory inside container
WORKDIR /app

# Set default production environment variables
ENV NODE_ENV=production \
    PORT=3000

# Install dependencies deterministically from lockfile
# Include devDependencies required for Vite build and tsx runtime execution
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# Copy application source code (ignoring paths in .dockerignore)
COPY . .

# Build Vite frontend assets into /app/dist for Express production static serving
RUN npm run build

# Ensure local data directory exists and assign ownership to non-root node user
# Note: /app/data/users.json stores local user records for authentication.
# In a multi-replica setup, this storage is per-container and not shared.
RUN mkdir -p /app/data && chown -R node:node /app

# Run as non-root user for container security
USER node

# Expose internal Express server port
EXPOSE 3000

# Start Express server via tsx to resolve TypeScript imports and Supabase modules
CMD ["npx", "tsx", "server.ts"]
