# Thiết Kế Đóng Gói Container (Docker & Docker Compose) - Modern E-Commerce

## 1. Tóm Tắt Thấu Hiểu (Understanding Summary)
- **Mục tiêu**: Đóng gói ứng dụng Modern E-Commerce (NestJS 11 + Prisma ORM + PostgreSQL) thành Docker container chuẩn production và thiết lập Docker Compose cho môi trường phát triển local.
- **Mục đích**: Chuẩn hóa môi trường chạy đồng nhất, khởi chạy trọn vẹn toàn bộ hệ thống (NestJS App, PostgreSQL, Redis) chỉ bằng 1 lệnh `docker compose up`, và tạo ra production image nhẹ, an toàn để sẵn sàng triển khai lên Cloud/VPS.
- **Đối tượng sử dụng**: Developers, DevOps Engineers, QA Testers.
- **Ràng buộc kỹ thuật**:
  - Quản lý dependencies bằng `pnpm` (`corepack enable pnpm`).
  - Thư viện native C++ `argon2` và Prisma 7.5.0: dùng base image `node:22-bookworm-slim` để đảm bảo tương thích glibc.
  - Tự động chạy `pnpm prisma migrate deploy` trước khi chạy server `node dist/main`.
  - Service PostgreSQL có healthcheck để đảm bảo DB sẵn sàng trước khi App kết nối.
  - Bổ sung service Redis (`redis:7-alpine`) cho nhu cầu caching/queue tương lai.
- **Non-goals**:
  - Không cấu hình CI/CD pipeline push image lên registry ở giai đoạn này.
  - Không cấu hình Kubernetes / Helm.

---

## 2. Yêu Cầu Phi Chức Năng & Giả Định (Assumptions)
1. **Dung lượng & Hiệu năng (Size & Performance)**:
   - Áp dụng kỹ thuật **Multi-stage build** để tách riêng tầng `builder` (chứa toàn bộ source TS, devDependencies, compiler) và tầng `runner` (chỉ chứa `dist/`, production `node_modules`, schema). Kích thước image cuối chỉ khoảng ~200MB.
2. **Bảo mật (Security)**:
   - Image thành phẩm chuyển sang quyền `USER node` (non-root), hạn chế tối đa rủi ro bảo mật container.
   - Không chứa file `.env` nhạy cảm trong Docker image (loại trừ qua `.dockerignore`).
3. **Độ tin cậy & Thứ tự khởi động (Reliability & Startup Order)**:
   - Dùng `healthcheck` trên `postgres` và `redis`, dịch vụ `app` sử dụng `depends_on: { condition: service_healthy }` để tránh lỗi kết nối DB khi khởi động đồng thời.
4. **Bảo toàn dữ liệu (Data Persistence)**:
   - Dữ liệu PostgreSQL và Redis được lưu vào các named volume (`pgdata`, `redisdata`), không bị mất khi restart hay rebuild container.

---

## 3. Nhật Ký Quyết Định (Decision Log)
| STT | Quyết định | Các phương án đã cân nhắc | Lý do lựa chọn |
|---|---|---|---|
| 1 | Áp dụng **Phương án 1: Multi-Stage Build + Docker Compose** | - Phương án 2: Single-stage dev mount volume.<br>- Phương án 3: Multi-target dev/prod trong 1 Dockerfile. | Image gọn nhẹ, bảo mật, đáp ứng chuẩn production ngay từ đầu và cực kỳ dễ dùng cho local dev. |
| 2 | Chạy `pnpm prisma migrate deploy` trong lệnh `CMD` | - Viết script entrypoint riêng `.sh`.<br>- Chạy migrate thủ công ngoài container. | Tránh lỗi định dạng dòng CRLF của Windows khi tạo file `.sh`, đảm bảo database luôn được cập nhật schema tự động. |
| 3 | Chọn base image `node:22-bookworm-slim` | - `node:22-alpine`<br>- `node:22` (full) | Tương thích 100% với `argon2` và Prisma engine mà không cần cài thêm gcc/make nặng nề như trên Alpine. |
| 4 | Cấu hình `healthcheck` cho PostgreSQL | - Chỉ dùng `depends_on` thông thường. | `depends_on` thông thường chỉ chờ container khởi chạy chứ không chờ database sẵn sàng nhận kết nối, dẫn đến lỗi app crash khi migrate. |
| 5 | Tích hợp thêm service **Redis** (`redis:7-alpine`) | - Bỏ qua Redis hoặc chỉ cài Postgres. | Sẵn sàng cho nhu cầu caching session, token blacklist, rate limiting hoặc BullMQ sau này. |

---

## 4. Thiết Kế Chi Tiết (Final Design)

### 4.1. File `.dockerignore`
```text
node_modules
dist
.git
.env
.env.*
test
coverage
*.log
README.md
```

### 4.2. File `Dockerfile` (Multi-stage)
```dockerfile
# ==========================================
# STAGE 1: Builder
# ==========================================
FROM node:22-bookworm-slim AS builder

WORKDIR /usr/src/app

RUN corepack enable pnpm

# Copy package manifests & prisma schema
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Cài đặt toàn bộ dependencies
RUN pnpm install --frozen-lockfile

# Sinh Prisma Client
RUN pnpm prisma generate

# Copy toàn bộ mã nguồn
COPY . .

# Biên dịch NestJS sang Javascript
RUN pnpm run build

# Lọc bỏ devDependencies
RUN pnpm prune --prod

# ==========================================
# STAGE 2: Production Runner
# ==========================================
FROM node:22-bookworm-slim AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

RUN corepack enable pnpm

# Copy các thành phần tối thiểu từ builder
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/generated ./generated

# Phân quyền cho user node
RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000

# Tự động migrate DB trước khi khởi động server
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main"]
```

### 4.3. File `docker-compose.yml`
```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: ecommerce_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-ecommerce}
    ports:
      - '${POSTGRES_PORT:-5432}:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER:-postgres} -d ${POSTGRES_DB:-ecommerce}']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: ecommerce_redis
    restart: unless-stopped
    ports:
      - '${REDIS_PORT:-6379}:6379'
    volumes:
      - redisdata:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ecommerce_app
    restart: unless-stopped
    ports:
      - '${PORT:-3000}:3000'
    environment:
      NODE_ENV: ${NODE_ENV:-production}
      PORT: 3000
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-ecommerce}?schema=public
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_URL: redis://redis:6379
      JWT_ACCESS_SECRET: ${JWT_ACCESS_SECRET:-access_secret_sample}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET:-refresh_secret_sample}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  pgdata:
  redisdata:
```

### 4.4. File `.env.docker.example`
Mẫu các biến môi trường cấu hình khi chạy bằng Docker Compose:
```env
PORT=3000
NODE_ENV=development

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ecommerce
POSTGRES_PORT=5432

REDIS_PORT=6379

JWT_ACCESS_SECRET=your_jwt_access_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
```

---

## 5. Kế Hoạch Nghiệm Thu (Verification Plan)
1. **Kiểm tra cú pháp & Build Image**:
   - Chạy `docker compose build` để xác nhận Dockerfile build hoàn tất không lỗi.
2. **Khởi chạy hệ thống**:
   - Chạy `docker compose up -d` để khởi động 3 containers (`postgres`, `redis`, `app`).
3. **Kiểm tra Logs & Healthcheck**:
   - Xem logs: `docker compose logs -f app` để thấy quá trình `prisma migrate deploy` chạy thành công và server lắng nghe port `3000`.
4. **Kiểm tra Swagger UI**:
   - Mở `http://localhost:3000/api/docs` trên máy host để xác nhận tài liệu và API hoạt động bình thường.
5. **Kiểm tra Redis & Postgres persistence**:
   - `docker compose down` rồi `docker compose up -d`, kiểm tra dữ liệu trong volumes vẫn nguyên vẹn.
