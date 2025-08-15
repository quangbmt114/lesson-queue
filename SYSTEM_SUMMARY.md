# Hệ Thống Lesson Queue - Tóm Tắt

## 🎯 Mục Tiêu

Xây dựng một hệ thống message và job queue đơn giản với NestJS, sử dụng GraphQL API và Prisma ORM, áp dụng cho hệ thống e-commerce với tính năng thông báo tự động.

## 🏗️ Kiến Trúc Hệ Thống

### Core Components

1. **User Management** - Quản lý user với role-based access
2. **Shop Management** - Quản lý shop (chỉ SHOP_OWNER mới tạo được)
3. **Subscription System** - Hệ thống đăng ký theo dõi shop
4. **Product Management** - Quản lý sản phẩm với auto-notification
5. **Notification System** - Gửi thông báo bất đồng bộ
6. **Queue System** - Message queue và Job queue

### Technology Stack

- **Backend**: NestJS + TypeScript
- **API**: GraphQL với Apollo Server
- **Database**: PostgreSQL + Prisma ORM
- **Queue**: Redis + Bull Queue
- **Architecture**: Modular, Event-driven

## 🔄 Flow Hoạt Động

```
1. User đăng ký với role SHOP_OWNER → Tạo shop
2. User đăng ký với role CUSTOMER → Đăng ký theo dõi shop
3. Shop Owner thêm sản phẩm mới
4. Hệ thống tự động tạo notification jobs
5. Job Queue xử lý gửi email đến subscribers
6. Cập nhật trạng thái notification
```

## 📊 Database Schema

### User Model (Unified)

```sql
- id: String (CUID)
- name: String
- email: String (unique)
- role: UserRole (SHOP_OWNER, CUSTOMER, ADMIN)
- createdAt: DateTime
- updatedAt: DateTime
```

### Shop Model

```sql
- id: String (CUID)
- name: String
- description: String?
- ownerId: String (FK to User)
- createdAt: DateTime
- updatedAt: DateTime
```

### Product Model

```sql
- id: String (CUID)
- shopId: String (FK to Shop)
- name: String
- description: String?
- price: Decimal
- createdAt: DateTime
- updatedAt: DateTime
```

### Subscription Model

```sql
- id: String (CUID)
- customerId: String (FK to User)
- shopId: String (FK to Shop)
- createdAt: DateTime
- Unique constraint: [customerId, shopId]
```

### Notification Model

```sql
- id: String (CUID)
- customerId: String (FK to User)
- shopId: String (FK to Shop)
- productId: String? (FK to Product)
- message: String
- sentAt: DateTime
- status: String (pending, sent, failed)
```

## 🚀 Tính Năng Chính

### 1. Role-Based Access Control

- **SHOP_OWNER**: Tạo và quản lý shop
- **CUSTOMER**: Đăng ký theo dõi shop
- **ADMIN**: Quyền quản trị hệ thống

### 2. Auto-Notification System

- Tự động gửi thông báo khi có sản phẩm mới
- Sử dụng job queue để xử lý bất đồng bộ
- Retry mechanism cho failed notifications

### 3. GraphQL API

- Type-safe API với GraphQL schema
- Real-time subscriptions (có thể mở rộng)
- Efficient data fetching với nested queries

### 4. Queue Management

- **Message Queue**: Xử lý events (product created)
- **Job Queue**: Xử lý tác vụ (send email)
- Redis backend cho reliability

## 📁 Cấu Trúc Thư Mục

```
src/
├── user/               # User management (thay thế customer)
├── shop/               # Shop management
├── subscription/       # Subscription system
├── product/            # Product management
├── notification/       # Notification system
├── queue/              # Queue management
├── shared/             # Shared utilities
│   ├── dto/           # GraphQL DTOs
│   └── prisma/        # Database service
└── app.module.ts       # Main module
```

## 🔧 Cài Đặt & Chạy

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- Docker (optional)

### Setup

```bash
# 1. Install dependencies
yarn install

# 2. Setup environment
cp .env.example .env
# Update DATABASE_URL và Redis config

# 3. Initialize database
npx prisma db push

# 4. Start Redis
docker run -d -p 6379:6379 redis:alpine

# 5. Start application
yarn start:dev
```

### Test

- GraphQL Playground: http://localhost:3000/graphql
- Demo script: `demo-setup.md`

## 💡 Ưu Điểm Của Thiết Kế

### 1. **Unified User Model**

- Dễ quản lý authentication/authorization
- 1 user có thể có nhiều role
- Linh hoạt cho future features

### 2. **Event-Driven Architecture**

- Loose coupling giữa các components
- Dễ scale và maintain
- Real-time capabilities

### 3. **Type Safety**

- TypeScript + GraphQL schema
- Prisma type generation
- Compile-time error checking

### 4. **Modular Design**

- Mỗi feature là 1 module độc lập
- Dễ test và debug
- Dễ mở rộng

## 🚧 Có Thể Mở Rộng

### 1. **Authentication & Authorization**

- JWT tokens
- Role-based middleware
- Permission system

### 2. **Real-time Features**

- WebSocket subscriptions
- Live notifications
- Real-time chat

### 3. **Advanced Queue Features**

- Bull dashboard
- Queue monitoring
- Dead letter queue

### 4. **Email Service Integration**

- SendGrid, Mailgun
- Email templates
- Email tracking

### 5. **Analytics & Monitoring**

- User behavior tracking
- Shop performance metrics
- System health monitoring

## 🎉 Kết Luận

Hệ thống đã được thiết kế với kiến trúc hiện đại, dễ mở rộng và maintain. Sử dụng unified user model giúp đơn giản hóa quản lý user và role, trong khi vẫn giữ được tính linh hoạt cao.

Message queue và job queue được tích hợp một cách tự nhiên, cho phép hệ thống xử lý các tác vụ nặng một cách bất đồng bộ và reliable.

GraphQL API cung cấp interface type-safe và efficient cho frontend, trong khi Prisma ORM đảm bảo type safety ở database layer.

Hệ thống sẵn sàng để deploy production và có thể dễ dàng mở rộng thêm các tính năng mới.
