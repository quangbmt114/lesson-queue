# 🚀 Queue System - Quick Start

## ⚡ Chạy Nhanh (5 phút)

### 1. Khởi động Services

```bash
# Khởi động Redis và PostgreSQL
docker-compose up -d

# Hoặc khởi động riêng lẻ
docker run -d --name redis-lesson-queue -p 6379:6379 redis:alpine
docker run -d --name postgres-lesson-queue \
  -e POSTGRES_DB=lesson_queue \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 postgres:15
```

### 2. Setup Database

```bash
# Khởi tạo database schema
npx prisma db push

# Test connection
node test-database.js
```

### 3. Khởi động Ứng dụng

```bash
# Terminal 1: Khởi động app
yarn start:dev

# Terminal 2: Test queue
node test-queue.js
```

### 4. Mở GraphQL Playground

Truy cập: http://localhost:3000/graphql

## 🔍 Test Queue System

### Test Database Connection

```bash
node test-database.js
```

**Expected Output:**

```
🔍 Testing database connection...
✅ Database connection successful!
📊 Testing basic queries...
👥 Users count: 0
🏪 Shops count: 0
📦 Products count: 0
🔔 Subscriptions count: 0
📧 Notifications count: 0
🎉 All database tests passed successfully!
```

### Test Queue System

```bash
node test-queue.js
```

**Expected Output:**

```
🚀 Testing Queue System...
🔍 Testing Redis connection...
✅ Redis connection successful!
🔍 Testing Bull queue...
✅ Bull queue ready!
📝 Adding test jobs...
✅ Job 1 added: 1
✅ Job 2 added: 2
✅ Job 3 added: 3
📊 Checking queue status...
📋 Queue Status:
   Waiting: 0
   Active: 0
   Completed: 3
   Failed: 0
🎉 Queue test completed successfully!
```

## 📱 Demo Flow

### 1. Tạo Users

```graphql
# Tạo Shop Owner
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
  }
}

# Tạo Customer
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
  }
}
```

### 2. Tạo Shop

```graphql
mutation {
  createShop(
    createShopInput: {
      name: "Tech Store"
      description: "Cửa hàng công nghệ"
      ownerId: "SHOP_OWNER_USER_ID_HERE"
    }
  ) {
    id
    name
    description
    ownerId
  }
}
```

### 3. Đăng ký theo dõi

```graphql
mutation {
  createSubscription(
    createSubscriptionInput: {
      customerId: "CUSTOMER_USER_ID_HERE"
      shopId: "SHOP_ID_HERE"
    }
  ) {
    id
    customerId
    shopId
  }
}
```

### 4. Test Queue (Thêm sản phẩm)

```graphql
mutation {
  createProduct(
    createProductInput: {
      shopId: "SHOP_ID_HERE"
      name: "iPhone 15 Pro"
      description: "Smartphone mới nhất"
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

## 👀 Monitor Queue

### Xem Application Logs

Trong terminal chạy `yarn start:dev`, bạn sẽ thấy:

```
[NotificationProcessor] Processing job 1
[NotificationProcessor] Sending email to mary@customer.com: New product available: iPhone 15 Pro
[NotificationProcessor] Email sent successfully
```

### Xem Redis Queue

```bash
# Kết nối Redis
docker exec -it redis-lesson-queue redis-cli

# Xem queue stats
LLEN bull:notification:wait      # Jobs đang chờ
LLEN bull:notification:active    # Jobs đang xử lý
LLEN bull:notification:completed # Jobs hoàn thành
LLEN bull:notification:failed    # Jobs thất bại

# Xem job details
LRANGE bull:notification:completed 0 -1

# Thoát
exit
```

### Xem Database

```bash
# Mở Prisma Studio
npx prisma studio

# Hoặc query trực tiếp
psql -U postgres -h localhost -d lesson_queue

# Xem notifications
SELECT * FROM notifications ORDER BY sent_at DESC;
```

## 🚨 Troubleshooting

### Redis Connection Failed

```bash
# Kiểm tra Redis container
docker ps | grep redis

# Restart Redis
docker restart redis-lesson-queue

# Test connection
docker exec redis-lesson-queue redis-cli ping
```

### Database Connection Failed

```bash
# Kiểm tra PostgreSQL container
docker ps | grep postgres

# Restart PostgreSQL
docker restart postgres-lesson-queue

# Test connection
npx prisma db pull
```

### Jobs Not Processing

```bash
# Kiểm tra application logs
# Kiểm tra Redis queue stats
# Verify job data format
```

## 📊 Queue Commands

### Redis Commands

```bash
# Xem tất cả keys
docker exec redis-lesson-queue redis-cli keys "*"

# Xem queue lengths
docker exec redis-lesson-queue redis-cli llen bull:notification:*

# Monitor real-time
docker exec redis-lesson-queue redis-cli monitor

# Cleanup old jobs
docker exec redis-lesson-queue redis-cli del bull:notification:completed
docker exec redis-lesson-queue redis-cli del bull:notification:failed
```

### Prisma Commands

```bash
# Generate client
npx prisma generate

# Push schema
npx prisma db push

# Open Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

## 🎯 Expected Results

1. **Database**: 5 tables được tạo (users, shops, products, subscriptions, notifications)
2. **Queue**: Jobs được tạo và xử lý thành công
3. **Notifications**: Email notifications được gửi đến subscribers
4. **Logs**: Application logs hiển thị job processing

## 📚 Next Steps

1. **Read QUEUE_GUIDE.md** - Hướng dẫn chi tiết
2. **Read demo-setup.md** - Demo đầy đủ
3. **Experiment** - Thử nghiệm với các scenarios khác nhau
4. **Monitor** - Theo dõi performance và logs

## 🆘 Help

- **Documentation**: QUEUE_GUIDE.md
- **Demo Script**: demo-queue-flow.sh
- **Test Scripts**: test-database.js, test-queue.js
- **Docker**: docker-compose.yml

---

**Happy Queue-ing! 🚀**
