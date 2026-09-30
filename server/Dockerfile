# ==========================================
# STAGE 1: Builder
# ==========================================
FROM node:22-bookworm-slim AS builder

WORKDIR /usr/src/app

# Kích hoạt pnpm có sẵn trong Node.js qua corepack
RUN corepack enable pnpm

# Copy package manifests & prisma schema để tận dụng cache layers
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Cài đặt toàn bộ dependencies (bao gồm cả devDependencies để build)
RUN pnpm install

# Sinh Prisma Client
RUN pnpm prisma generate

# Copy toàn bộ mã nguồn
COPY . .

# Biên dịch NestJS sang Javascript
RUN pnpm run build

# Lọc bỏ devDependencies để thu gọn node_modules
RUN pnpm prune --prod

# ==========================================
# STAGE 2: Production Runner
# ==========================================
FROM node:22-bookworm-slim AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Cài đặt OpenSSL cho Prisma Engine
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Chỉ copy những file cần thiết từ builder
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/prisma.config.ts ./
COPY --from=builder /usr/src/app/generated ./generated

# Phân quyền cho non-root user 'node'
RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000

# Tự động migrate database trước khi start server
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && if [ -f dist/src/main.js ]; then node dist/src/main.js; else node dist/main.js; fi"]
