# ─────────────────────────────────────────────────────────────
# MADRAS MACHA — HARDENED MULTI-STAGE DOCKERFILE (DA 3 QUESTION 2)
# Production-ready, non-root, minimal attack surface Node.js 22 Alpine
# ─────────────────────────────────────────────────────────────

# ── STAGE 1: Build Application & Bundle Server ───────────────
FROM node:22-alpine AS builder

WORKDIR /build

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install all dependencies (including dev tools for building)
RUN npm ci --include=dev

# Copy application source tree
COPY . .

# Build Vite frontend assets (/build/dist) & bundle backend (/build/dist/server.js)
RUN npm run build:all

# ── STAGE 2: Hardened Minimal Production Runtime ─────────────
FROM node:22-alpine AS runner

# Set working directory inside container
WORKDIR /app

# Set production environment defaults
ENV NODE_ENV=production \
    PORT=3000

# Install production-only dependencies (excludes vite, tsc, esbuild from final image)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy pre-compiled production artifacts from builder stage
COPY --from=builder /build/dist ./dist

# Copy legacy data directory (with non-root permissions)
COPY --from=builder /build/data ./data

# Ensure persistent directories exist and set strict non-root ownership
RUN mkdir -p /app/data && chown -R node:node /app

# Switch to standard non-root user (node, UID 1000)
USER node

# Expose internal Express server port
EXPOSE 3000

# Container Health Check (polls /api/backend-status every 30s)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/backend-status || exit 1

# Start bundled Node.js server directly (no dev compiler or tsx at runtime)
CMD ["node", "dist/server.js"]
