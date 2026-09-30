# ============================================================
# STAGE 1: BUILD
# ============================================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

RUN corepack enable pnpm

# Copy package manifests
COPY package.json pnpm-lock.yaml* ./

# Cài đặt dependencies để build
RUN pnpm install

# Copy source code
COPY . .

# Build Next.js với standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm run build

# ============================================================
# STAGE 2: RUN (Node runtime standalone)
# ============================================================
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# Copy static assets và standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3001

CMD ["node", "server.js"]
