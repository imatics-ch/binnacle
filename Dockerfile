# syntax=docker/dockerfile:1
FROM node:22-alpine AS base

# Patch underlying Alpine OS-level vulnerabilities (e.g., OpenSSL & Zlib CVEs)
RUN apk upgrade --no-cache

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security (prevents container escape via Docker socket)
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Automatically setup standalone mode via next.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"

USER nextjs

CMD ["node", "server.js"]
