# Demo Setup - Lesson Queue System

## 🚀 Quick Start với PostgreSQL

### Option 1: Sử dụng Docker Compose (Khuyến nghị)

```bash
# 1. Khởi động PostgreSQL và Redis
docker-compose up -d

# 2. Chờ services khởi động (khoảng 10-15 giây)
docker-compose ps

# 3. Kiểm tra logs
docker-compose logs postgres
docker-compose logs redis

# 4. Setup database schema
npx prisma db push

# 5. Test database connection
node test-database.js

# 6. Khởi động ứng dụng
yarn start:dev
```

### Option 2: Sử dụng Setup Script

```bash
# 1. Chạy setup script
chmod +x setup-database.sh
./setup-database.sh

# 2. Khởi động ứng dụng
yarn start:dev
```

### Option 3: Manual Setup

#### 1. Khởi động PostgreSQL

```bash
# Sử dụng Docker
docker run -d \
  --name postgres-lesson-queue \
  -e POSTGRES_DB=lesson_queue \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15

# Kiểm tra container
docker ps | grep postgres
docker logs postgres-lesson-queue
```

#### 2. Khởi động Redis

```bash
# Sử dụng Docker
docker run -d \
  --name redis-lesson-queue \
  -p 6379:6379 \
  redis:alpine

# Kiểm tra container
docker ps | grep redis
docker exec redis-lesson-queue redis-cli ping
```

#### 3. Cấu hình Environment

Tạo file `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/lesson_queue?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# App
PORT=3000
NODE_ENV=development
```

#### 4. Khởi tạo Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema
npx prisma db push

# Test connection
node test-database.js
```

## 🗄️ Database Management

### Prisma Studio (Database GUI)

```bash
# Mở Prisma Studio
npx prisma studio
```

Truy cập: http://localhost:5555

### PostgreSQL CLI

```bash
# Kết nối database
psql -U postgres -h localhost -d lesson_queue

# Xem tables
\dt

# Xem data
SELECT * FROM users;
SELECT * FROM shops;
SELECT * FROM products;

# Thoát
\q
```

### pgAdmin (Web-based GUI)

Nếu sử dụng docker-compose, truy cập: http://localhost:5050

- Email: admin@lesson-queue.com
- Password: admin

## 🔧 Troubleshooting

### PostgreSQL Issues

```bash
# Kiểm tra container status
docker ps -a | grep postgres

# Xem logs
docker logs postgres-lesson-queue

# Restart container
docker restart postgres-lesson-queue

# Kiểm tra connection
npx prisma db pull
```

### Redis Issues

```bash
# Kiểm tra container status
docker ps -a | grep redis

# Xem logs
docker logs redis-lesson-queue

# Test connection
docker exec redis-lesson-queue redis-cli ping

# Restart container
docker restart redis-lesson-queue
```

### Common Issues

1. **Port 5432 already in use**:

   ```bash
   # Tìm process sử dụng port
   lsof -i :5432

   # Kill process
   kill -9 <PID>
   ```

2. **Database connection failed**:

   ```bash
   # Kiểm tra container
   docker ps | grep postgres

   # Kiểm tra logs
   docker logs postgres-lesson-queue

   # Test connection
   psql -U postgres -h localhost -p 5432 -c "SELECT 1"
   ```

3. **Prisma schema sync failed**:

   ```bash
   # Reset database
   npx prisma migrate reset

   # Hoặc push schema
   npx prisma db push
   ```

## 📊 Database Monitoring

### Performance Queries

```sql
-- Xem active connections
SELECT * FROM pg_stat_activity;

-- Xem table sizes
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Xem slow queries (nếu có pg_stat_statements extension)
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC;
```

### Queue Monitoring

```bash
# Xem Redis keys
docker exec redis-lesson-queue redis-cli keys "*"

# Xem queue stats
docker exec redis-lesson-queue redis-cli llen bull:notification:wait
docker exec redis-lesson-queue redis-cli llen bull:notification:active
docker exec redis-lesson-queue redis-cli llen bull:notification:completed
docker exec redis-lesson-queue redis-cli llen bull:notification:failed
```

## 🧪 Test Database

### Test Connection

```bash
# Chạy test script
node test-database.js
```

### Expected Output

```
🔍 Testing database connection...
✅ Database connection successful!

📊 Testing basic queries...
👥 Users count: 0
🏪 Shops count: 0
📦 Products count: 0
🔔 Subscriptions count: 0
📧 Notifications count: 0

🏗️  Testing schema...
📋 Available tables:
   - notifications
   - products
   - shops
   - subscriptions
   - users

🎭 Testing enums...
👤 Available user roles:
   - ADMIN
   - CUSTOMER
   - SHOP_OWNER

🎉 All database tests passed successfully!
```

## 🚀 Next Steps

Sau khi database setup thành công:

1. **Khởi động ứng dụng**: `yarn start:dev`
2. **Mở GraphQL Playground**: http://localhost:3000/graphql
3. **Follow demo**: Sử dụng các GraphQL queries trong phần tiếp theo
4. **Monitor logs**: Xem logs để kiểm tra job queue hoạt động

## 📝 GraphQL Demo Queries

### 1. Tạo Shop Owner

```graphql
mutation {
  createUser(
    createUserInput: {
      name: "John Shop Owner"
      email: "john@techstore.com"
      role: SHOP_OWNER
    }
  ) {
    id
    name
    email
    role
    createdAt
  }
}
```

**Lưu lại user ID để sử dụng cho bước tiếp theo**

### 2. Tạo Customer 1

```graphql
mutation {
  createUser(
    createUserInput: {
      name: "Mary Customer"
      email: "mary@customer.com"
      role: CUSTOMER
    }
  ) {
    id
    name
    email
    role
    createdAt
  }
}
```

### 3. Tạo Customer 2

```graphql
mutation {
  createUser(
    createUserInput: {
      name: "Bob Customer"
      email: "bob@customer.com"
      role: CUSTOMER
    }
  ) {
    id
    name
    email
    role
    createdAt
  }
}
```

### 4. Tạo Shop

```graphql
mutation {
  createShop(
    createShopInput: {
      name: "Tech Store"
      description: "Cửa hàng công nghệ hàng đầu"
      ownerId: "SHOP_OWNER_USER_ID_HERE"
    }
  ) {
    id
    name
    description
    ownerId
    createdAt
  }
}
```

**Lưu lại shop ID để sử dụng cho bước tiếp theo**

### 5. Đăng ký theo dõi Shop

```graphql
mutation {
  createSubscription(
    createSubscriptionInput: {
      customerId: "CUSTOMER_1_USER_ID_HERE"
      shopId: "SHOP_ID_HERE"
    }
  ) {
    id
    customerId
    shopId
    createdAt
  }
}
```

```graphql
mutation {
  createSubscription(
    createSubscriptionInput: {
      customerId: "CUSTOMER_2_USER_ID_HERE"
      shopId: "SHOP_ID_HERE"
    }
  ) {
    id
    customerId
    shopId
    createdAt
  }
}
```

### 6. Thêm sản phẩm mới (Tự động gửi thông báo)

```graphql
mutation {
  createProduct(
    createProductInput: {
      shopId: "SHOP_ID_HERE"
      name: "iPhone 15 Pro"
      description: "Smartphone mới nhất từ Apple"
      price: 999.99
    }
  ) {
    id
    name
    price
    createdAt
  }
}
```

**Khi thực hiện mutation này, hệ thống sẽ:**

1. Tạo sản phẩm mới
2. Tự động tìm tất cả subscribers của shop
3. Tạo notification records
4. Thêm jobs vào queue để gửi email
5. Process jobs và cập nhật trạng thái

### 7. Kiểm tra kết quả

#### Xem tất cả users

```graphql
query {
  users {
    id
    name
    email
    role
    ownedShops {
      name
    }
    subscriptions {
      shop {
        name
      }
    }
  }
}
```

#### Xem shop owners

```graphql
query {
  shopOwners {
    id
    name
    email
    role
    ownedShops {
      id
      name
      description
      products {
        name
        price
      }
      subscriptions {
        customer {
          name
          email
        }
      }
    }
  }
}
```

#### Xem customers

```graphql
query {
  customers {
    id
    name
    email
    role
    subscriptions {
      shop {
        name
        description
      }
    }
  }
}
```

#### Xem notifications

```graphql
query {
  notifications {
    id
    message
    sentAt
    status
    customer {
      name
      email
      role
    }
    shop {
      name
      owner {
        name
        email
      }
    }
    product {
      name
      price
    }
  }
}
```

## 🔍 Kiểm tra Queue

### Xem logs để kiểm tra job processing

Trong terminal chạy ứng dụng, bạn sẽ thấy:

```
[NotificationProcessor] Start sending email...
[NotificationProcessor] Sending email to mary@customer.com: New product available: iPhone 15 Pro
[NotificationProcessor] Email sent successfully
[NotificationProcessor] Start sending email...
[NotificationProcessor] Sending email to bob@customer.com: New product available: iPhone 15 Pro
[NotificationProcessor] Email sent successfully
```

### Kiểm tra database

```bash
# Kết nối database
npx prisma studio

# Hoặc query trực tiếp
psql -U postgres -h localhost -d lesson_queue -c "SELECT * FROM notifications;"
```

## 🎯 Kết quả mong đợi

1. **2 customers đăng ký theo dõi shop**
2. **Khi thêm sản phẩm mới, 2 notification jobs được tạo**
3. **Queue xử lý và gửi email đến cả 2 customers**
4. **Trạng thái notification được cập nhật từ 'pending' → 'sent'**
5. **Hệ thống hoạt động bất đồng bộ với message queue và job queue**

## 🧹 Cleanup

### Dừng services

```bash
# Dừng docker-compose
docker-compose down

# Hoặc dừng từng container
docker stop postgres-lesson-queue redis-lesson-queue
docker rm postgres-lesson-queue redis-lesson-queue
```

### Xóa data (cẩn thận!)

```bash
# Xóa volumes (sẽ mất tất cả data)
docker-compose down -v

# Hoặc xóa từng volume
docker volume rm lesson-queue_postgres_data lesson-queue_redis_data
```

## 🆘 Help & Support

### Logs

```bash
# PostgreSQL logs
docker logs postgres-lesson-queue

# Redis logs
docker logs redis-lesson-queue

# Application logs
# Xem trong terminal chạy yarn start:dev
```

### Database Health Check

```bash
# Test database connection
node test-database.js

# Test Prisma
npx prisma db pull
```

### Reset Everything

```bash
# Stop all containers
docker-compose down -v

# Remove all containers and volumes
docker system prune -a --volumes

# Start fresh
docker-compose up -d
npx prisma db push
```
