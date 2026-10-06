# 🛒 Modern E-Commerce Platform (Full-Stack Monorepo)

<p align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NestJS-Dark.svg" width="48" height="48" alt="NestJS" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/NextJS-Dark.svg" width="48" height="48" alt="Next.js" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TypeScript.svg" width="48" height="48" alt="TypeScript" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/PostgreSQL-Dark.svg" width="48" height="48" alt="PostgreSQL" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Prisma.svg" width="48" height="48" alt="Prisma" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Redis-Dark.svg" width="48" height="48" alt="Redis" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Docker.svg" width="48" height="48" alt="Docker" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TailwindCSS-Dark.svg" width="48" height="48" alt="TailwindCSS" />
</p>

<p align="center">
  <strong>Nền tảng thương mại điện tử Full-stack chuẩn Production được xây dựng theo kiến trúc Monorepo hiệu năng cao.</strong><br/>
  Tích hợp Storefront hiện đại (Next.js 16 + React 19), Hệ thống Quản trị Admin Dashboard, Backend RESTful API (NestJS 11), Trợ lý tư vấn mua sắm AI thông minh (RAG với PostgreSQL pgvector & Google Gemini), cùng quy trình thanh toán VietQR tự động.
</p>

<p align="center">
  <a href="#-tính-năng-nổi-bật">Tính năng</a> •
  <a href="#-kiến-trúc-hệ-thống">Kiến trúc</a> •
  <a href="#-công-nghệ-sử-dụng">Tech Stack</a> •
  <a href="#-cấu-trúc-dự-án">Cấu trúc Monorepo</a> •
  <a href="#-hướng-dẫn-cài-đặt--khởi-chạy">Cài đặt & Khởi chạy</a> •
  <a href="#-tài-khoản-thử-nghiệm">Tài khoản mẫu</a> •
  <a href="#-tài-liệu-api-endpoints">API Docs</a>
</p>

---

## 📖 Giới Thiệu Dự Án

**Modern E-Commerce Platform** là giải pháp thương mại điện tử hoàn chỉnh, giải quyết các bài toán kỹ thuật thực tế trong các hệ thống bán lẻ trực tuyến quy mô lớn:

- **Customer Storefront:** Trải nghiệm mua sắm mượt mà, tối ưu SEO, hỗ trợ phân loại danh mục đa tầng, tìm kiếm toàn văn, lọc thuộc tính linh hoạt và sản phẩm đa biến thể (Matrix Variants: Màu sắc, Kích cỡ, SKU độc lập).
- **Hệ Thống Quản Trị (Admin Portal):** Bộ công cụ quản trị tập trung dành cho vận hành: biểu đồ trực quan hóa doanh thu, quản lý tồn kho real-time, xử lý quy trình đơn hàng nhiều bước, quản lý mã giảm giá và phân quyền nhân viên theo vai trò (RBAC).
- **Trợ Lý Mua Sắm AI (RAG Assistant):** Chatbot hỗ trợ 24/7 nhúng trực tiếp, áp dụng kỹ thuật RAG (Retrieval-Augmented Generation) kết hợp Vector Search (`pgvector`) và Google Gemini để tư vấn sản phẩm, giải đáp chính sách bảo hành, đổi trả, chọn size theo thời gian thực.
- **Backend Chuyên Sâu & Xử Lý Đồng Thời:** Giải quyết triệt để bài toán **Race Condition** và **Transaction Deadlock** khi nhiều người cùng đặt hàng đồng thời thông qua Prisma `$transaction`, trừ kho nguyên tử (`Atomic Stock Deduction`), và cơ chế khóa tài nguyên theo thứ tự tăng dần (`Sorted Resource Locking`).

---

## 🏗️ Kiến Trúc Hệ Thống

Dự án áp dụng mô hình **Monorepo** được quản lý bởi `pnpm workspaces`, phân tách rõ ràng giữa các tầng ứng dụng:

```mermaid
flowchart TB
    subgraph ClientLayer["🖥️ Frontend Client (Next.js 16 + React 19)"]
        Storefront["🛍️ Customer Storefront\n(Shop, Cart, Checkout, Profile)"]
        AdminUI["📊 Admin Management Portal\n(Dashboard, Inventory, Orders, RBAC)"]
        AIChatWidget["🤖 AI Shopping Assistant Widget\n(Contextual RAG Chat)"]
    end

    subgraph Gateway["🌐 Reverse Proxy / Gateway"]
        Nginx["Nginx Reverse Proxy\n(Port 8888 / Routing & SSL)"]
    end

    subgraph BackendLayer["⚙️ Backend RESTful API (NestJS 11 - Port 3000)"]
        AuthModule["Auth & RBAC\n(JWT, Argon2, Throttler)"]
        ProductModule["Catalog & Variants\n(Multi-Attribute Matrix)"]
        OrderModule["Orders & Concurrency\n(Prisma Transaction & Locking)"]
        PaymentModule["Payment Integration\n(SePay VietQR Webhook, Stripe)"]
        AIModule["AI & RAG Service\n(Gemini 1.5 & Vector Retrieval)"]
    end

    subgraph DataLayer["💾 Data & Cache Storage"]
        Postgres[("🐘 PostgreSQL 16\n- Relational Data\n- pgvector (768-dim Embeddings)")]
        Redis[("⚡ Redis 7\n- Cache-Aside (Catalog & Products)\n- Brute-Force Rate Limiting")]
    end

    subgraph ExternalServices["☁️ External Services"]
        Cloudinary["☁️ Cloudinary\n(Buffer-Streaming Image CDN)"]
        SePay["💳 SePay Gateway\n(VietQR Instant IPN Webhook)"]
        GeminiAPI["🧠 Google Gemini API\n(Embeddings & Generation)"]
        SMTP["✉️ Gmail SMTP\n(Verification & Order Mails)"]
    end

    ClientLayer -->|HTTP / WebSocket| Nginx
    Nginx -->|/v1/*| BackendLayer
    Nginx -->|/api/docs| BackendLayer
    Nginx -->|/*| ClientLayer

    BackendLayer --> Postgres
    BackendLayer --> Redis
    BackendLayer --> Cloudinary
    BackendLayer --> SePay
    BackendLayer --> GeminiAPI
    BackendLayer --> SMTP
```

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### 1. Frontend Client (`client/`)
| Công nghệ | Phiên bản | Vai trò & Mục đích |
| :--- | :--- | :--- |
| **Next.js** | `16.3.x` | Framework App Router, Server & Client Components, Route Handlers, SEO tối ưu |
| **React** | `19.3.x` | Thư viện UI hiện đại nhất, hỗ trợ Actions, Transitions & Concurrent Mode |
| **TypeScript** | `5.x` | Đảm bảo tính nhất quán kiểu dữ liệu từ Server tới Client |
| **Tailwind CSS** | `v4.0.0` | CSS framework thế hệ mới với hiệu năng biên dịch vượt trội |
| **Radix UI / Shadcn** | Mới nhất | Hệ thống UI headless primitives dễ dàng tùy biến, chuẩn Accessibility (a11y) |
| **TanStack Query** | `v5.x` | Quản lý Server State, đồng bộ dữ liệu ngầm, caching và optimistic updates |
| **Zustand** | `v5.x` | Client State Management nhẹ, hiệu quả cho giỏ hàng và UI preferences |
| **Framer Motion / Motion**| `v12.x` | Tạo animation mượt mà cho trải nghiệm duyệt web và modal tương tác |
| **Recharts & Chart.js** | Mới nhất | Trực quan hóa dữ liệu biểu đồ kinh doanh trong Admin Dashboard |
| **React Hook Form + Zod**| Mới nhất | Quản lý form hiệu năng cao, validate dữ liệu 2 chiều chặt chẽ |

### 2. Backend Server (`server/`)
| Công nghệ | Phiên bản | Vai trò & Mục đích |
| :--- | :--- | :--- |
| **NestJS** | `11.0.x` | Nền tảng backend chuẩn Enterprise theo kiến trúc Modular Monolith & Clean Code |
| **PostgreSQL & pgvector**| `16.x` | Cơ sở dữ liệu quan hệ mạnh mẽ, tích hợp vector similarity search 768 chiều |
| **Prisma ORM** | `7.5.x` | Type-safe Database Client kết hợp `@prisma/adapter-pg` cho kết nối tối ưu |
| **Redis** | `7.x` | Cache-Aside cho dữ liệu đọc nhiều; Rate-limiter trượt ngăn chặn tấn công dò mật khẩu |
| **Argon2** | `0.44.x` | Thuật toán băm mật khẩu bảo mật hàng đầu (đoạt giải Password Hashing Competition) |
| **Passport & JWT** | Mới nhất | Cơ chế xác thực kép Access Token & Refresh Token qua HTTP-Only Cookie an toàn |
| **Swagger / OpenAPI** | `11.x` | Tự động sinh tài liệu API tương tác tại `/api/docs` |
| **Cloudinary SDK** | Mới nhất | Quản lý và biến đổi hình ảnh tải lên dạng memory stream trực tiếp |

### 3. AI & RAG Engine
| Công nghệ | Mục đích sử dụng |
| :--- | :--- |
| **Google Generative AI** | Tích hợp Google Gemini (`@google/generative-ai`) tạo câu trả lời tự nhiên |
| **text-embedding-004** | Sinh vector đặc trưng 768 chiều từ dữ liệu catalog sản phẩm & văn bản chính sách |
| **PostgreSQL pgvector** | Lưu trữ và truy vấn tương đồng cosine (`<=>`) với độ trễ thấp ngay trên cùng database |
| **Grounding Context** | Cơ chế chống hallucination, trích xuất chính xác nguồn dữ liệu của cửa hàng |

---

## 🌟 Tính Năng Nổi Bật

### 🛍️ 1. Trải Nghiệm Khách Hàng (Customer Storefront)
- **Danh mục & Thương hiệu:** Cấu trúc phân tầng danh mục cha - con (Nested Categories), kết hợp slug thân thiện SEO.
- **Tìm kiếm & Bộ lọc linh hoạt (Faceted Search):** Tìm kiếm theo tên/mô tả sản phẩm, lọc theo danh mục, thương hiệu, khoảng giá biến thể (`minPrice` - `maxPrice`), trạng thái còn hàng (`inStock`), sắp xếp theo mới nhất hoặc giá tăng/giảm.
- **Hệ thống Biến thể Sản phẩm phức tạp:** Mô hình Product Attribute Matrix (Color, Size) với từng SKU có giá, số lượng tồn kho và hình ảnh riêng biệt; cập nhật tồn kho tức thì khi chọn cấu hình.
- **Giỏ hàng bền vững (Persistent Cart):** Đồng bộ giỏ hàng theo tài khoản người dùng, kiểm tra tồn kho thời gian thực trước khi thêm hoặc tăng số lượng.
- **Mã giảm giá (Coupons / Vouchers):** Áp dụng mã khuyến mãi theo điều kiện giá trị đơn hàng tối thiểu và hạn mức sử dụng.
- **Sổ địa chỉ & Giao hàng:** Quản lý nhiều địa chỉ nhận hàng (Tỉnh/Thành phố, Quận/Huyện, Phường/Xã, Địa chỉ chi tiết), thiết lập địa chỉ mặc định.
- **Thanh toán đa dạng:**
  - **VietQR SePay (Tự động):** Tạo mã QR động kèm nội dung thanh toán riêng cho từng đơn hàng; hệ thống tự động xác nhận `PAID` qua Webhook IPN thời gian thực.
  - **Stripe / PayPal:** Thanh toán quốc tế qua thẻ tín dụng và cổng ví điện tử.
  - **COD:** Thanh toán khi nhận hàng.
- **Lịch sử đơn hàng & Đánh giá:** Xem chi tiết lộ trình vận chuyển, xuất/in hóa đơn PDF (`InvoiceTemplate`), gửi đánh giá sao (1-5★) và bình luận sản phẩm sau khi mua.

---

### 🤖 2. Trợ Lý Mua Sắm AI (AI Shopping Assistant & RAG)
- **Tư vấn thông minh:** Khung chat AI thời gian thực hỗ trợ khách hàng tìm kiếm sản phẩm phù hợp với nhu cầu, ngân sách, phong cách thời trang.
- **Tra cứu chính sách tức thì:** Tự động giải đáp chính xác về chính sách đổi trả (7 ngày), biểu phí vận chuyển (Freeship từ 500k), bảo hành sản phẩm chính hãng (6 tháng), và hướng dẫn chọn size.
- **Kiến trúc RAG không nhầm lẫn:** 
  1. Khi người dùng đặt câu hỏi, hệ thống tạo vector câu hỏi qua model `text-embedding-004`.
  2. Truy vấn top-K vector tương đồng nhất trong các bảng `product_embeddings` và `store_documents` bằng toán tử Cosine Similarity trên PostgreSQL.
  3. Ghép ngữ cảnh thực tế vào prompt và gửi tới Gemini LLM để trả về câu trả lời chính xác, kèm link sản phẩm trực tiếp.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách hàng
    participant Client as Frontend (Chat Widget)
    participant Server as NestJS (AI Assistant)
    participant VectorDB as PostgreSQL (pgvector)
    participant Gemini as Google Gemini API

    Customer->>Client: "Tôi cao 1m75 nặng 65kg, có mẫu áo sơ mi nào vừa và chính sách đổi trả thế nào?"
    Client->>Server: POST /v1/ai-assistant/chat { message }
    Server->>Gemini: Generate Embedding (text-embedding-004)
    Gemini-->>Server: Vector 768 chiều
    Server->>VectorDB: Truy vấn Cosine Distance (<=>) tìm Products & Policy Docs
    VectorDB-->>Server: Top K sản phẩm phù hợp + Chính sách liên quan
    Server->>Gemini: Prompt Kèm Dữ Liệu Ngữ Cảnh (Grounding Context)
    Gemini-->>Server: Câu trả lời tư vấn hoàn chỉnh + Gợi ý sản phẩm
    Server-->>Client: Phản hồi định dạng Markdown kèm Metadata sản phẩm
    Client-->>Customer: Hiển thị câu trả lời & Card sản phẩm có thể bấm xem ngay
```

---

### 📊 3. Hệ Thống Quản Trị Chuyên Sâu (Admin Portal)
- **Bảng điều khiển kinh doanh (Dashboard):** Thống kê doanh thu theo thời gian thực, tổng số lượng đơn hàng, sản phẩm bán chạy, lượng khách hàng đăng ký mới với biểu đồ trực quan.
- **Quản lý Catalog Sản phẩm:**
  - Thêm/sửa/xóa sản phẩm, cấu hình thuộc tính Màu sắc (Color picker Hex) và Size (S, M, L, XL, XXL...).
  - Tạo tổ hợp biến thể, gán SKU, giá bán lẻ và tồn kho ban đầu cho từng biến thể.
  - Tải lên nhiều hình ảnh cùng lúc qua Cloudinary (chọn ảnh đại diện, sắp xếp thứ tự).
- **Kiểm soát Tồn kho (Stock Management):** Theo dõi số lượng tồn của từng biến thể theo SKU, cảnh báo sắp hết hàng.
- **Vận hành Đơn hàng (Order Management):**
  - Quản lý quy trình vòng đời đơn hàng theo trạng thái:  
    `PENDING` ➔ `CONFIRMED` ➔ `PACKING` ➔ `PAID` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED` *(hoặc `CANCELLED`)*.
  - Xem chi tiết phương thức thanh toán, thông tin giao hàng, log thanh toán webhook.
  - Tạo và in hóa đơn xuất kho chuẩn hóa.
- **Quản lý Mã giảm giá (Coupons):** Tạo mã khuyến mãi, thiết lập số lần dùng tối đa, hạn mức cho từng người dùng, ngày bắt đầu và kết thúc.
- **Quản lý Tài khoản & Phân quyền (RBAC):** Danh sách người dùng, kích hoạt/khóa tài khoản, thêm nhân viên (`staff`) và phân quyền vai trò.

---

### 🛡️ 4. Kỹ Thuật Xử Lý Backend Chuyên Sâu

#### ⚡ Kiểm soát Concurrency & Phòng Chống Overselling (Race Condition)
Trong kịch bản nhiều khách hàng cùng thanh toán món hàng cuối cùng tại một thời điểm:
- Toàn bộ quy trình tạo đơn và trừ tồn kho được bao bọc trong một **Prisma `$transaction`**.
- Trừ kho nguyên tử với điều kiện kiểm tra trực tiếp tại database:
  ```typescript
  // Trừ tồn kho có điều kiện (Atomic Deduction)
  await tx.productVariant.update({
    where: {
      id: item.variantId,
      countInStock: { gte: item.quantity }, // Bắt buộc tồn kho hiện tại >= số lượng mua
    },
    data: {
      countInStock: { decrement: item.quantity },
    },
  });
  ```
- Nếu tồn kho không đủ, câu lệnh cập nhật lập tức thất bại, kích hoạt cơ chế **Rollback toàn bộ giao dịch (Fail-Fast)** và trả về thông báo lỗi chi tiết mã SKU bị thiếu hàng.

#### 🔒 Triệt Tiêu Nguy Cơ Deadlock Bằng Thuật Toán Sắp Xếp ID Khóa
Khi 2 khách hàng đồng thời đặt các giỏ hàng chứa cùng các sản phẩm A và B nhưng theo thứ tự ngược nhau (User 1: A rồi B; User 2: B rồi A), việc khóa hàng theo thứ tự ngẫu nhiên sẽ dẫn tới Database Deadlock.
- **Giải pháp:** Hệ thống tự động sắp xếp mảng `variantId` theo thứ tự tăng dần (`ASC`) trước khi thực hiện cập nhật kho trong transaction:
  ```typescript
  const sortedItems = [...cartItems].sort((a, b) => a.variantId - b.variantId);
  ```
- Việc luôn thu nạp khóa (Lock Acquisition) theo một thứ tự duy nhất đảm bảo không bao giờ xảy ra tình trạng Circular Wait, triệt tiêu hoàn toàn Transaction Deadlock.

#### 🛡️ Bảo Mật Hai Lớp Dual-Token & Redis Throttler
- **Dual-Token Auth:** Access Token có thời hạn ngắn (15 phút) dùng cho các request thông thường; Refresh Token có thời hạn dài (7 ngày) được lưu trữ an toàn trong **HTTP-Only Cookie**, ngăn chặn hoàn toàn tấn công đánh cắp token qua XSS.
- **Redis Login Throttler:** Giám sát tần suất đăng nhập theo IP và username. Khi vượt quá ngưỡng cho phép (ví dụ: quá 5 lần thất bại liên tiếp), tài khoản/IP bị tạm khóa trong khung thời gian quy định nhằm ngăn chặn tấn công Brute-force.
- **Cache-Aside Caching:** Các danh mục (`/categories`) và thông tin sản phẩm đọc nhiều được lưu cache trên Redis với TTL tối ưu. Mọi thao tác thêm/sửa/xóa (`Mutation`) đều kích hoạt cơ chế xóa cache (`Cache Invalidation`) tự động để dữ liệu luôn nhất quán.

---

## 📁 Cấu Trúc Dự Án (Monorepo)

```text
Modern_ecommerce/
├── client/                          # 🌐 Ứng dụng Frontend (Next.js 16 + React 19)
│   ├── public/                      # Static assets, icons, fonts
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/              # Luồng đăng nhập, đăng ký, quên mật khẩu
│   │   │   ├── (shop)/              # Giao diện mua sắm khách hàng (Home, Cart, Products, Checkout...)
│   │   │   └── admin/               # Cổng quản trị Admin (Dashboard, Products, Orders, Stock, Users...)
│   │   ├── components/
│   │   │   ├── common/              # Navbar, Footer, Header, Breadcrumbs
│   │   │   ├── features/            # AI Chatbot widget, Image galleries
│   │   │   └── ui/                  # Shadcn / Radix primitives (Button, Dialog, Input, Table...)
│   │   ├── hooks/                   # Custom React hooks (useCart, useDebounce, useAuth...)
│   │   ├── services/                # Tầng gọi API Backend (Axios client)
│   │   ├── stores/                  # Global state với Zustand (cartStore, userStore...)
│   │   └── types/                   # TypeScript interfaces & DTOs
│   ├── package.json
│   └── tsconfig.json
│
├── server/                          # ⚙️ Ứng dụng Backend API (NestJS 11)
│   ├── prisma/
│   │   ├── schema.prisma            # Mô hình dữ liệu PostgreSQL & pgvector definitions
│   │   └── seed.ts                  # Script khởi tạo tài khoản, catalog & quyền mặc định
│   ├── scripts/
│   │   └── seed-knowledge-base.ts   # Script vector hóa chính sách shop cho AI RAG
│   ├── src/
│   │   ├── ai-assistant/            # Phân hệ AI: Gemini, Vector Store, pgvector search
│   │   ├── auth/                    # Phân hệ Auth: JWT dual-token, RBAC, Guards
│   │   ├── products/                # Phân hệ Sản phẩm & Ma trận biến thể (Color/Size/SKU)
│   │   ├── orders/                  # Phân hệ Đơn hàng: Xử lý giao dịch & kiểm soát concurrency
│   │   ├── payment/                 # Phân hệ Thanh toán: SePay VietQR webhook, Stripe
│   │   ├── cart/                    # Phân hệ Giỏ hàng người dùng
│   │   ├── categories/              # Phân hệ Danh mục (kèm Redis Cache-Aside)
│   │   ├── brands/                  # Phân hệ Thương hiệu
│   │   ├── coupons/                 # Phân hệ Mã giảm giá
│   │   ├── dashboard/               # Phân hệ Thống kê số liệu Admin
│   │   ├── inventories/             # Phân hệ Quản lý tồn kho
│   │   ├── redis/                   # Module kết nối Redis & Throttler
│   │   ├── mail/                    # Module gửi email SMTP qua Nodemailer
│   │   ├── cloudinary/              # Module streaming upload media
│   │   └── main.ts                  # Entry point: Helmet, Cors, Swagger, Interceptors
│   ├── package.json
│   └── tsconfig.json
│
├── reverse_proxy/                   # 🌐 Cấu hình Nginx reverse proxy cho production
│   ├── nginx_release.conf           # Điều hướng /v1/ sang backend, / sang frontend
│   └── Dockerfile
│
├── docker-compose.yml               # Môi trường chạy Local DB (PostgreSQL pgvector, Redis)
├── docker-compose-build.yaml        # Môi trường chạy trọn gói Production Services
├── package.json                     # Monorepo Root Script orchestration (pnpm)
└── README.md
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản `>= 20.x`
- **pnpm**: Phiên bản `>= 9.x` hoặc `10.x` *(Khuyên dùng)*
- **Docker & Docker Compose**: Đã cài đặt và đang chạy

---

### 2. Cài đặt Dependencies Monorepo

Clone repository và cài đặt các gói phụ thuộc tại thư mục gốc:

```bash
git clone https://github.com/JustTaiCorn/Modern-e-commerce.git
cd Modern_ecommerce

# Cài đặt toàn bộ packages cho cả root, client và server
pnpm install
```

---

### 3. Thiết lập Biến Môi Trường (`.env`)

#### a. Cấu hình Backend (`server/.env`)
Tạo file `server/.env` dựa theo mẫu dưới đây:

```env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000

# PostgreSQL Database (kèm extension pgvector)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce?schema=public"

# Redis Cache & Throttler
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Secret Keys
JWT_ACCESS_SECRET=your_jwt_access_secret_key_at_least_32_characters
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_at_least_32_characters

# Google Gemini API Key (phục vụ tính năng AI Shopping Assistant RAG)
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary (Quản lý hình ảnh sản phẩm)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Cổng thanh toán VietQR SePay
SEPAY_MERCHANT_ID=your_merchant_id
SEPAY_SECRET_KEY=your_sepay_secret_key
SEPAY_ENV=sandbox

# Gửi email (Gmail SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM="Modern E-Commerce <noreply@ecommerce.vn>"
```

#### b. Cấu hình Frontend (`client/.env.local`)
Tạo file `client/.env.local`:

```env
# URL kết nối tới Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
PORT=3001

# Tùy chọn bổ sung (nếu dùng)
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

### 4. Khởi Chạy Database & Redis Bằng Docker

Sử dụng Docker Compose để khởi chạy dịch vụ PostgreSQL (tích hợp sẵn extension `pgvector`) và Redis:

```bash
# Khởi động PostgreSQL và Redis chạy nền
docker compose up postgres redis -d
```

---

### 5. Khởi Tạo Cơ Sở Dữ Liệu & Seed Dữ Liệu Mẫu

Chạy các lệnh sau để tạo bảng, tạo tài khoản mẫu và nạp dữ liệu tri thức AI:

```bash
# Đẩy schema Prisma lên database
pnpm --filter @ecommerce/server exec prisma db push

# Khởi tạo dữ liệu mẫu (Roles, User, Admin, Danh mục, Sản phẩm đa biến thể)
pnpm --filter @ecommerce/server run prisma:seed

# Khởi tạo Vector Knowledge Base cho AI Chatbot (Vectorize chính sách cửa hàng)
pnpm --filter @ecommerce/server run seed:ai
```

---

### 6. Khởi Chạy Ứng Dụng (Development)

Bạn có thể chạy đồng thời cả Frontend và Backend từ thư mục gốc:

```bash
# Chạy đồng thời cả Client và Server
pnpm dev
```

Hoặc chạy từng phân hệ độc lập trong từng terminal riêng:

```bash
# Terminal 1: Chạy Backend NestJS (cổng 3000)
pnpm dev:server

# Terminal 2: Chạy Frontend Next.js (cổng 3001)
pnpm dev:client
```

Sau khi khởi chạy thành công:
- **🛍️ Giao diện Khách hàng (Storefront):** [http://localhost:3001](http://localhost:3001)
- **📊 Giao diện Quản trị (Admin Portal):** [http://localhost:3001/admin](http://localhost:3001/admin)
- **⚙️ Backend API Base URL:** [http://localhost:3000/v1](http://localhost:3000/v1)
- **📚 Tài liệu Swagger API:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

### 7. Khởi Chạy Trọn Gói Bằng Docker Compose (Production Setup)

Để triển khai trọn gói toàn bộ hệ thống gồm Nginx Gateway, Next.js Frontend, NestJS Backend, PostgreSQL pgvector và Redis:

```bash
docker compose -f docker-compose-build.yaml up --build -d
```
Hệ thống sẽ chạy qua Nginx Reverse Proxy tại cổng `http://localhost:8888`.

---

## 🔑 Tài Khoản Thử Nghiệm

Dữ liệu seed mẫu cung cấp sẵn các tài khoản với mật khẩu mặc định là: **`123456`**

| Vai trò | Email đăng nhập | Mật khẩu | Quyền hạn & Chức năng |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@atino.vn` | `123456` | Toàn quyền quản trị hệ thống, duyệt đơn, chỉnh kho, cấu hình danh mục & khuyến mãi |
| **Nhân viên (Staff)** | `staff@atino.vn` | `123456` | Quản lý xử lý đơn hàng, cập nhật tình trạng giao nhận |
| **Khách hàng (User)** | `user@atino.vn` | `123456` | Tài khoản VIP, có sẵn sổ địa chỉ, lịch sử đơn hàng và giỏ hàng mẫu |

---

## 📋 Tài Liệu API & Endpoints

Tài liệu tương tác chuẩn **OpenAPI 3.0 (Swagger)** được tự động phát sinh và có thể trải nghiệm trực tiếp tại:  
👉 **`http://localhost:3000/api/docs`**

### Bảng Tổng Hợp Một Số Endpoints Chính:

| Nhóm chức năng | Phương thức | Đường dẫn API | Phân quyền | Mô tả chức năng |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | `POST` | `/v1/auth/register` | Public | Đăng ký tài khoản người dùng mới |
| | `POST` | `/v1/auth/login` | Public | Đăng nhập (bảo vệ bằng Redis rate-limit) |
| | `POST` | `/v1/auth/refresh` | Public | Cấp mới Access Token thông qua Refresh Token cookie |
| | `POST` | `/v1/auth/logout` | Authenticated | Đăng xuất và hủy phiên làm việc |
| **AI Assistant** | `POST` | `/v1/ai-assistant/chat` | Public | Gửi câu hỏi tư vấn mua sắm & chính sách cho AI RAG |
| **Products** | `GET` | `/v1/products` | Public | Danh sách sản phẩm kèm bộ lọc, tìm kiếm và phân trang |
| | `GET` | `/v1/products/:id` | Public | Chi tiết sản phẩm kèm danh sách biến thể (Cache Redis) |
| | `POST` | `/v1/products` | Admin / Staff | Tạo sản phẩm mới kèm cấu hình ma trận biến thể |
| | `PATCH` | `/v1/products/:id` | Admin / Staff | Cập nhật thông tin sản phẩm và tự động xóa cache |
| | `DELETE` | `/v1/products/:id` | Admin | Xóa sản phẩm khỏi hệ thống |
| **Categories** | `GET` | `/v1/categories` | Public | Lấy cây danh mục phân tầng (Cache Redis 24h) |
| | `POST` | `/v1/categories` | Admin | Thêm danh mục mới |
| **Cart** | `GET` | `/v1/cart` | Authenticated | Lấy giỏ hàng đồng bộ của người dùng |
| | `POST` | `/v1/cart/items` | Authenticated | Thêm sản phẩm theo biến thể SKU vào giỏ |
| | `DELETE` | `/v1/cart/items/:id` | Authenticated | Xóa sản phẩm khỏi giỏ hàng |
| **Orders** | `POST` | `/v1/orders` | Authenticated | Tạo đơn hàng (chạy transaction trừ kho an toàn) |
| | `GET` | `/v1/orders/my-orders`| Authenticated | Lịch sử mua hàng của người dùng hiện tại |
| | `GET` | `/v1/orders/:id` | Authenticated | Thông tin chi tiết đơn hàng |
| | `PATCH` | `/v1/orders/:id/status`| Admin / Staff | Chuyển đổi trạng thái đơn hàng trong quy trình |
| **Payment** | `POST` | `/v1/payment/checkout/:orderId`| Authenticated| Tạo thông tin chuyển khoản VietQR SePay |
| | `POST` | `/v1/payment/webhook` | Public | Tiếp nhận IPN Webhook tự động từ SePay với xác thực chữ ký |
| **Coupons** | `GET` | `/v1/coupons` | Public | Danh sách mã giảm giá đang kích hoạt |
| | `POST` | `/v1/coupons` | Admin | Tạo mã giảm giá mới |
| **Dashboard** | `GET` | `/v1/dashboard/metrics` | Admin | Thống kê doanh thu, đơn hàng và các chỉ số kinh doanh |

---

## 📜 Các Scripts Thường Dùng (Scripts Reference)

| Lệnh | Ý nghĩa |
| :--- | :--- |
| `pnpm dev` | Khởi chạy đồng thời cả Frontend và Backend ở môi trường development |
| `pnpm dev:server` | Chỉ chạy Backend NestJS ở chế độ watch mode |
| `pnpm dev:client` | Chỉ chạy Frontend Next.js |
| `pnpm build` | Biên dịch toàn bộ các package trong monorepo |
| `pnpm lint` | Kiểm tra định dạng và lỗi cú pháp ESLint trên toàn bộ dự án |
| `pnpm test` | Khởi chạy các bộ kiểm thử đơn vị (Unit Tests) |

---

## 📄 Bản Quyền (License)

Dự án được phân phối dưới giấy phép **[MIT License](LICENSE)**. Tự do sử dụng, chỉnh sửa và phát triển tiếp cho mục đích học tập hoặc thương mại.
