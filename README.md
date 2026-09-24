# 🛒 Modern E-Commerce Backend RESTful API

Hệ thống Backend RESTful API thương mại điện tử hoàn chỉnh, hiệu năng cao và bảo mật, được xây dựng theo kiến trúc Modular Monolith bằng **NestJS 11**, **TypeScript**, **PostgreSQL**, **Prisma ORM 7** và **Redis**.

---

## 💼 Mục Dành Riêng Cho CV / Resume (Copy & Paste)

> [!TIP]
> Bạn có thể trích xuất trực tiếp các bullet points dưới đây vào mục **Projects** hoặc **Work Experience** trong CV / Portfolio cá nhân (được viết theo công thức chuẩn ATS: *Action Verb + Task/Problem + Tech Stack + Result/Impact*).

### 🇻🇳 Bản Tiếng Việt:
* **Kiến trúc & Công nghệ:** Thiết kế và xây dựng hệ thống backend e-commerce hoàn chỉnh với NestJS 11, TypeScript, PostgreSQL (Prisma ORM) và Redis theo kiến trúc Modular Monolith và Clean Architecture.
* **Xác thực & Bảo mật (RBAC):** Triển khai hệ thống xác thực kép JWT (Access/Refresh Token) qua HTTP-Only Cookie kết hợp cơ chế phân quyền dựa trên vai trò (Role-Based Access Control - RBAC). Tích hợp Redis Throttler chống tấn công Brute-force lúc đăng nhập.
* **Catalog & Biến thể phức tạp:** Xây dựng mô hình dữ liệu sản phẩm đa biến thể (Attributes: Color, Size, SKU, giá và tồn kho riêng); hỗ trợ upload ảnh streaming lên Cloudinary.
* **Tìm kiếm, Lọc & Phân trang:** Phát triển API tìm kiếm full-text đa trường, bộ lọc đa tiêu chí (danh mục, thương hiệu, khoảng giá biến thể, tình trạng tồn kho) và sắp xếp linh hoạt theo chuẩn phân trang tối ưu.
* **Xử lý Đơn hàng & Concurrency:** Thiết kế cơ chế đặt hàng trong Prisma `$transaction`, ngăn chặn race-condition khi trừ kho đồng thời (atomic deduction) và giải quyết triệt để vấn đề Transaction Deadlock bằng kỹ thuật sắp xếp khóa ID tài nguyên.
* **Thanh toán tự động:** Tích hợp cổng thanh toán SePay (VietQR), xử lý Webhook IPN thời gian thực với cơ chế xác thực chữ ký số bảo mật, tự động kích hoạt trạng thái đơn hàng.
* **Bộ nhớ đệm (Caching):** Áp dụng mô hình Cache-Aside với Redis cho các truy vấn đọc nhiều (danh mục, chi tiết sản phẩm), kết hợp cơ chế tự động xóa/làm mới cache khi dữ liệu thay đổi.
* **Tài liệu & DevOps:** Chuẩn hóa toàn bộ phản hồi API bằng NestJS Interceptor; tự động hóa tài liệu OpenAPI/Swagger 3.0 qua Nest CLI Plugin; container hóa ứng dụng và cơ sở dữ liệu bằng Docker & Docker Compose.

---

### 🇬🇧 English Version (ATS-Friendly):
* **Architecture & Core:** Designed and engineered a high-performance e-commerce RESTful API using **NestJS 11**, **TypeScript**, **PostgreSQL (Prisma ORM 7)**, and **Redis** adhering to Modular Monolith and Clean Architecture principles.
* **Authentication & Security:** Implemented dual-token JWT authentication (Access & Refresh tokens) via HTTP-Only cookies with Role-Based Access Control (RBAC). Mitigated brute-force attacks by integrating a Redis-backed login rate limiter.
* **Product Catalog & Variant System:** Modeled complex product variants (supporting dynamic attributes: Color, Size, individual SKUs, pricing, and stock tracking) with buffer-streaming multi-image uploads to Cloudinary.
* **Search, Filtering & Pagination:** Engineered an optimized product discovery API supporting case-insensitive multi-field search, relational multi-facet filtering (categories, brands, variant price ranges, stock status), dynamic sorting, and offset pagination.
* **Order Processing & Concurrency Control:** Architected a resilient order placement workflow using Prisma `$transaction` with atomic stock deductions to prevent inventory overselling; eliminated database transaction deadlocks via sorted resource ID locking.
* **Automated Payments:** Integrated SePay (VietQR) payment gateway, handling real-time IPN webhooks with cryptographic signature verification for automated order status transitions.
* **High-Throughput Caching:** Implemented Cache-Aside pattern via Redis for read-heavy operations (categories and product details), reducing database load and enforcing automated cache invalidation upon entity mutations.
* **Documentation & DevOps:** Standardized global API response contracts via NestJS Interceptors; auto-generated interactive OpenAPI 3.0 (Swagger) specifications; containerized services using Docker and Docker Compose.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Lớp (Layer) | Công nghệ | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Framework & Ngôn ngữ** | **NestJS 11**, **TypeScript 5**, **Node.js** | Nền tảng backend module hóa, Dependency Injection, type-safety |
| **Database & ORM** | **PostgreSQL**, **Prisma ORM 7** (`@prisma/adapter-pg`) | Lưu trữ dữ liệu quan hệ, type-safe queries, migration tự động |
| **Caching & In-Memory** | **Redis** (`ioredis`) | Cache-aside cho danh mục/sản phẩm, Rate Limiter chống brute-force |
| **Bảo mật & Auth** | **Passport.js**, **JWT**, **Argon2**, **Helmet**, **Cookie-Parser** | Băm mật khẩu cao cấp, mã hóa token, chống tấn công web phổ biến |
| **Third-Party Services** | **Cloudinary**, **SePay**, **Nodemailer** | Quản lý media đám mây, cổng thanh toán VietQR, gửi mail kích hoạt/reset mật khẩu |
| **Validation & Docs** | **class-validator**, **class-transformer**, **Swagger (OpenAPI 3.0)** | Tự động validate & cast kiểu tham số, sinh tài liệu API trực quan tại `/api/docs` |
| **DevOps & Container** | **Docker**, **Docker Compose** | Đóng gói môi trường đồng nhất (App, PostgreSQL, Redis) |

---

## 🌟 Chi Tiết Các Phân Hệ Chức Năng (Core Modules)

### 1. Phân Hệ Xác Thực & Phân Quyền (Auth & RBAC)
- **Đăng ký & Đăng nhập:** Băm mật khẩu bằng thuật toán **Argon2** an toàn hơn bcrypt.
- **Cơ chế Dual-Token:** Cấp Access Token ngắn hạn và Refresh Token dài hạn lưu trong HTTP-Only Cookie chống XSS.
- **Phân quyền (RBAC):** Decorator `@Roles(Role.ADMIN, Role.USER)` kết hợp `RolesGuard` bảo vệ các endpoint nhạy cảm.
- **Chống Brute-force:** Tích hợp `LoginThrottlerService` dựa trên Redis để khóa tạm thời IP/tài khoản khi đăng nhập sai nhiều lần liên tiếp.
- **Email Service:** Tích hợp Nodemailer gửi mã xác thực tài khoản và link khôi phục mật khẩu qua SMTP.

### 2. Phân Hệ Sản Phẩm & Biến Thể (Products & Variants Catalog)
- **Quản lý biến thể đa tầng:** Hỗ trợ sản phẩm có nhiều biến thể tổ hợp từ các thuộc tính (Màu sắc, Kích thước, Dung lượng...), mỗi biến thể có SKU, giá (`price`) và tồn kho (`countInStock`) độc lập.
- **Upload đa ảnh:** Sử dụng luồng `Readable Stream` tải ảnh trực tiếp lên Cloudinary từ buffer bộ nhớ mà không cần lưu file tạm vào ổ cứng server.
- **Bộ lọc, Tìm kiếm & Phân trang nâng cao:**
  - Tìm kiếm từ khóa theo tên hoặc mô tả (`name`, `description`).
  - Lọc theo danh mục (`categoryId` hoặc `categorySlug`).
  - Lọc theo thương hiệu (`brandId` hoặc `brandSlug`).
  - Lọc theo khoảng giá biến thể (`minPrice`, `maxPrice`).
  - Lọc sản phẩm còn hàng (`inStock=true`).
  - Sắp xếp: Mới nhất (`createdAt`) hoặc theo giá (`price` tăng/giảm dần).
  - Phân trang kiểm soát `page` và `limit` (giới hạn tối đa 50 item/trang).

### 3. Phân Hệ Danh Mục & Thương Hiệu (Categories & Brands)
- Quản lý đầy đủ CRUD Danh mục và Thương hiệu.
- Tự động tạo URL-friendly slug bằng tiện ích `slugify`.
- Tích hợp **Redis Caching** (TTL 24h) phục vụ menu/header với tốc độ phản hồi tính bằng mili-giây, tự động xóa cache khi có thao tác thêm/sửa/xóa.

### 4. Phân Hệ Giỏ Hàng (Shopping Cart)
- Lưu trữ giỏ hàng bền vững trong database gắn liền với tài khoản người dùng.
- Thêm sản phẩm theo từng biến thể cụ thể, cập nhật số lượng, tự động kiểm tra tồn kho trước khi thêm.
- Tự động đồng bộ và tính toán tổng tiền tạm tính.

### 5. Phân Hệ Đơn Hàng & Xử Lý Đồng Thời (Orders & Concurrency Control)
- **Database Transaction:** Toàn bộ quá trình tạo đơn hàng và trừ kho được bọc trong `prisma.$transaction`.
- **Phòng ngừa Deadlock:** Sắp xếp danh sách `variantId` theo thứ tự tăng dần trước khi thực thi truy vấn cập nhật, loại bỏ nguy cơ deadlock khi nhiều người cùng đặt các sản phẩm giống nhau cùng lúc.
- **Atomic Stock Deduction:** Trừ tồn kho bằng điều kiện `countInStock: { gte: requiredQty }`. Nếu tồn kho không đủ, giao dịch lập tức rollback (Fail-Fast) kèm thông báo chi tiết mã SKU bị thiếu hàng.

### 6. Phân Hệ Thanh Toán Tự Động (SePay VietQR Gateway)
- Khởi tạo giao diện mã QR VietQR động theo đơn hàng với nội dung chuyển khoản tự động.
- Tiếp nhận Webhook IPN (Instant Payment Notification) từ SePay khi khách hàng chuyển khoản thành công.
- Kiểm tra tính toàn vẹn và xác thực chữ ký số (`signature verification`) trước khi cập nhật trạng thái đơn hàng sang `PAID`.

### 7. Tối Ưu Hóa & Chuẩn Hóa Hệ Thống (System Polish)
- **TransformInterceptor:** Mọi phản hồi thành công từ API đều được chuẩn hóa theo format:
  ```json
  {
    "statusCode": 200,
    "success": true,
    "data": { ... },
    "timestamp": "2026-09-15T10:00:00.000Z"
  }
  ```
- **Swagger Documentation:** Tự động tạo tài liệu OpenAPI trực quan tại `/api/docs`.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Quick Start)

### 1. Yêu cầu môi trường
- Node.js >= 20
- pnpm (khuyên dùng) hoặc npm / yarn
- PostgreSQL & Redis (hoặc sử dụng Docker Compose)

### 2. Cài đặt Dependencies
```bash
pnpm install
```

### 3. Cấu hình Biến Môi Trường (`.env`)
Tạo file `.env` tại thư mục gốc với các thông số mẫu:
```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Database & Cache
DATABASE_URL="postgresql://postgres:123456@localhost:5432/ecommerce?schema=public"
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secrets
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Mailer (Gmail SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM="Modern E-Commerce <noreply@ecommerce.com>"

# SePay Payment Gateway
SEPAY_MERCHANT_ID=your_merchant_id
SEPAY_SECRET_KEY=your_sepay_secret_key
SEPAY_ENV=sandbox
```

### 4. Đồng bộ Database Schema & Khởi tạo dữ liệu
```bash
# Đẩy schema lên database
npx prisma db push

# Chạy seed dữ liệu quyền và tài khoản admin mặc định
pnpm run prisma:seed
```

### 5. Khởi chạy ứng dụng

**Chạy môi trường phát triển (Development):**
```bash
pnpm run start:dev
```

**Hoặc chạy toàn bộ qua Docker Compose (PostgreSQL, Redis, NestJS):**
```bash
docker compose up -d --build
```

Truy cập Swagger API Documentation tại: **`http://localhost:3000/api/docs`**

---

## 📋 Danh Sách API Endpoints Chính

| Module | Method | Endpoint | Quyền hạn | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Public | Đăng ký tài khoản người dùng mới |
| | `POST` | `/api/v1/auth/login` | Public | Đăng nhập (có Redis rate-limit chống brute-force) |
| | `POST` | `/api/v1/auth/refresh` | Public | Làm mới Access Token qua Refresh Token cookie |
| | `POST` | `/api/v1/auth/logout` | Authenticated | Đăng xuất, hủy session |
| **Products** | `GET` | `/api/v1/products` | Public | Tìm kiếm, lọc (danh mục, brand, giá, tồn kho), sắp xếp & phân trang |
| | `GET` | `/api/v1/products/:id` | Public | Chi tiết sản phẩm (kèm biến thể, đánh giá, cache Redis 1h) |
| | `POST` | `/api/v1/products` | Admin | Tạo sản phẩm mới kèm danh sách variants |
| | `PATCH` | `/api/v1/products/:id` | Admin | Cập nhật sản phẩm & tự động xóa cache |
| | `DELETE` | `/api/v1/products/:id` | Admin | Xóa sản phẩm & tự động xóa cache |
| **Categories** | `GET` | `/api/v1/categories` | Public | Danh sách danh mục (cache Redis 24h) |
| | `POST` | `/api/v1/categories` | Admin | Tạo danh mục mới |
| **Brands** | `GET` | `/api/v1/brands` | Public | Danh sách thương hiệu (cache Redis 24h) |
| | `POST` | `/api/v1/brands` | Admin | Tạo thương hiệu mới |
| **Cart** | `GET` | `/api/v1/cart` | Authenticated | Lấy giỏ hàng hiện tại của user |
| | `POST` | `/api/v1/cart/items` | Authenticated | Thêm sản phẩm biến thể vào giỏ |
| | `DELETE` | `/api/v1/cart/items/:id` | Authenticated | Xóa sản phẩm khỏi giỏ |
| **Orders** | `POST` | `/api/v1/orders` | Authenticated | Tạo đơn hàng (chạy `$transaction` trừ kho an toàn) |
| | `GET` | `/api/v1/orders/my-orders` | Authenticated | Danh sách đơn hàng cá nhân |
| | `GET` | `/api/v1/orders/:id` | Authenticated | Chi tiết đơn hàng |
| **Payment** | `POST` | `/api/v1/payment/checkout/:orderId`| Authenticated | Khởi tạo thanh toán VietQR với SePay |
| | `POST` | `/api/v1/payment/webhook` | Public | Nhận IPN tự động từ SePay với xác thực chữ ký |

---

## 📄 Bản Quyền (License)
Dự án được phân phối dưới giấy phép [MIT License](LICENSE).
