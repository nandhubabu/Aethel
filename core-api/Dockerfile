# ============================================================
# Core API — Dockerfile (Node.js Alpine + tini)
# ============================================================
# tini is used as PID 1 to properly handle signals and
# reap zombie processes inside the container.

FROM node:20-alpine AS base

# Install tini for proper PID 1 signal handling
RUN apk add --no-cache tini

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# ── Dependency layer (cached) ────────────────────────────────
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# ── Application layer ───────────────────────────────────────
COPY src/ ./src/

# Own all files by non-root user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

# tini as entrypoint ensures SIGTERM is forwarded to node
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/server.js"]
