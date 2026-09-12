# ============================================================
# Payment API — Dockerfile (Node.js Alpine + tini)
# ============================================================

FROM node:20-alpine AS base

RUN apk add --no-cache tini

RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

COPY src/ ./src/

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 5001

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/server.js"]
