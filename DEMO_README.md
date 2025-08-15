# 🎯 Demo Message Queue System

## 📋 Mô tả

Demo hệ thống message queue đơn giản với:

- **Bull Queue** + **Redis** backend
- **Prisma** database integration
- **Job Processing** với retry logic
- **Real-time monitoring** và statistics

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Tạo file .env từ template
yarn demo:setup

# Hoặc copy manual
cp demo.env.example .env
```

### 2. Cập nhật .env

```env
# Redis Configuration
REDIS_HOST=54.255.159.112
REDIS_PORT=6379
REDIS_PASSWORD=secret_redis

# Database Configuration
DATABASE_URL=your_database_url_here
```

### 3. Kiểm tra hệ thống

```bash
yarn demo:check
```

### 4. Chạy Demo

#### Terminal 1: Queue Processor

```bash
yarn demo:processor
```

#### Terminal 2: Demo Queue

```bash
yarn demo:queue
```

#### Terminal 3: Monitor Redis (tùy chọn)

```bash
redis-cli -h 54.255.159.112 -p 6379 -a secret_redis monitor
```

## 📁 Files Demo

| File                      | Mô tả                                |
| ------------------------- | ------------------------------------ |
| `demo-queue.js`           | Tạo demo data và thêm jobs vào queue |
| `demo-queue-processor.js` | Xử lý jobs từ queue                  |
| `run-demo.sh`             | Script kiểm tra và hướng dẫn         |
| `demo.env.example`        | Template environment variables       |

## 🔧 Scripts Available

```bash
yarn demo:check      # Kiểm tra Redis + Database
yarn demo:processor  # Chạy queue processor
yarn demo:queue      # Chạy demo queue
yarn demo:setup      # Tạo file .env từ template
```

## 📊 Kịch Bản Demo

1. **Tạo Demo Data**
   - Shop owner + Shop
   - 3 customers + subscriptions
   - 1 product + notifications

2. **Queue Processing**
   - Thêm 3 notification jobs
   - Processor xử lý jobs
   - Simulate email sending
   - Progress tracking

3. **Monitoring**
   - Queue statistics real-time
   - Job status updates
   - Success/failure handling

## 🎯 Expected Output

```
🎯 Demo Message Queue System
============================

🔧 Redis Configuration:
- Host: 54.255.159.112
- Port: 6379
- Password: ***

🚀 Tạo demo data...
✅ Tạo shop owner: shopowner@demo.com
✅ Tạo shop: Demo Shop
✅ Tạo customer: customer1@demo.com
✅ Tạo customer: customer2@demo.com
✅ Tạo customer: customer3@demo.com
✅ Tạo subscription cho: customer1@demo.com
✅ Tạo subscription cho: customer2@demo.com
✅ Tạo subscription cho: customer3@demo.com
✅ Tạo product: Sản phẩm demo
✅ Tạo notification cho: customer1@demo.com
✅ Tạo notification cho: customer2@demo.com
✅ Tạo notification cho: customer3@demo.com

🎉 Demo data đã được tạo thành công!

📨 Test Message Queue...
📊 Tìm thấy 3 notifications pending
📤 Thêm job 1 vào queue cho customer1@demo.com
📤 Thêm job 2 vào queue cho customer2@demo.com
📤 Thêm job 3 vào queue cho customer3@demo.com

📊 Queue Stats: { waiting: 3, active: 0, completed: 0, failed: 0, delayed: 0, paused: 0 }

📋 Jobs Status:
- Waiting: 3
- Active: 0
- Completed: 0
- Failed: 0

👀 Monitoring Queue...
```

## 🛠️ Troubleshooting

### Redis Connection Failed

- Kiểm tra `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- Đảm bảo Redis server đang chạy
- Test connection: `redis-cli -h host -p port -a password ping`

### Database Connection Failed

- Kiểm tra `DATABASE_URL` trong `.env`
- Đảm bảo database đang chạy
- Test với Prisma Studio: `yarn db:studio`

### Jobs Not Processing

- Kiểm tra processor có đang chạy không
- Xem Redis logs: `redis-cli -h host -p port -a password monitor`
- Kiểm tra queue stats trong processor

## 🎉 Success Indicators

- ✅ Redis connected successfully
- ✅ Database connected
- ✅ Demo data created
- ✅ Jobs added to queue
- ✅ Processor processing jobs
- ✅ Jobs completed successfully
- ✅ Real-time queue monitoring

## 🔄 Cleanup

```bash
# Dừng processors
Ctrl+C

# Xóa demo data (nếu cần)
yarn prisma:reset
```
