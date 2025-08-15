# 🚀 Message Queue & Job Queue Guide

## 📋 Tổng Quan

Hệ thống Lesson Queue sử dụng **Redis + Bull** để implement message queue và job queue:

- **Message Queue**: Xử lý events (ví dụ: product created)
- **Job Queue**: Xử lý tác vụ nặng (ví dụ: gửi email)

## 🏗️ Kiến Trúc Queue

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │───▶│   Message       │───▶│   Job Queue     │
│   (NestJS)     │    │   Queue         │    │   (Bull)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Event         │    │   Job           │
                       │   Handler       │    │   Processor     │
                       └─────────────────┘    └─────────────────┘
```

## 🔧 Setup Queue System

### 1. Khởi động Redis

```bash
# Sử dụng Docker (Khuyến nghị)
docker run -d \
  --name redis-lesson-queue \
  -p 6379:6379 \
  redis:alpine

# Hoặc sử dụng docker-compose
docker-compose up -d redis

# Kiểm tra Redis
docker exec redis-lesson-queue redis-cli ping
# Expected: PONG
```

### 2. Cài đặt Dependencies

```bash
# Cài đặt Bull queue
yarn add @nestjs/bull bull redis

# Cài đặt types
yarn add -D @types/bull
```

### 3. Cấu hình Environment

```env
# .env file
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## 📡 Message Queue Implementation

### 1. Queue Module Configuration

```typescript
// src/queue/queue.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD', ''),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
```

### 2. Event Producer (Message Queue)

```typescript
// src/notification/notification.service.ts
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class NotificationService {
  constructor(@InjectQueue('notification') private notificationQueue: Queue) {}

  async sendProductNotification(
    shopId: string,
    productId: string,
    productName: string,
  ) {
    // Lấy danh sách subscribers
    const subscriptions = await this.getSubscribers(shopId);

    // Tạo notification jobs cho mỗi subscriber
    for (const subscription of subscriptions) {
      const message = `New product available: ${productName}`;

      // Tạo notification record
      const notification = await this.createNotification({
        customerId: subscription.customer.id,
        shopId,
        productId,
        message,
      });

      // Thêm job vào queue (Message Queue → Job Queue)
      await this.notificationQueue.add('send-email', {
        notificationId: notification.id,
        customerEmail: subscription.customer.email,
        message,
        retryAttempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });
    }

    return {
      message: `Notification jobs created for ${subscriptions.length} subscribers`,
      count: subscriptions.length,
    };
  }
}
```

### 3. Job Processor (Job Queue)

```typescript
// src/notification/notification.processor.ts
import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  @Process('send-email')
  async handleSendEmail(job: Job) {
    this.logger.debug(`Processing job ${job.id}`);
    this.logger.debug('Job data:', job.data);

    const { notificationId, customerEmail, message } = job.data;

    try {
      // Simulate sending email
      this.logger.log(`Sending email to ${customerEmail}: ${message}`);

      // Simulate email processing time
      await this.delay(1000);

      // Update notification status
      await this.updateNotificationStatus(notificationId, 'sent');

      this.logger.debug('Email sent successfully');

      // Return result
      return { success: true, email: customerEmail, message };
    } catch (error) {
      this.logger.error('Failed to send email', error.stack);

      // Update notification status
      await this.updateNotificationStatus(notificationId, 'failed');

      // Re-throw error for retry mechanism
      throw error;
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async updateNotificationStatus(id: string, status: string) {
    // Update notification status in database
    // Implementation depends on your Prisma service
  }
}
```

## 🧪 Test Queue System

### 1. Khởi động Hệ Thống

```bash
# 1. Khởi động Redis
docker run -d --name redis-lesson-queue -p 6379:6379 redis:alpine

# 2. Khởi động PostgreSQL
docker run -d \
  --name postgres-lesson-queue \
  -e POSTGRES_DB=lesson_queue \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15

# 3. Setup database
npx prisma db push

# 4. Khởi động ứng dụng
yarn start:dev
```

### 2. Test GraphQL API

Truy cập: http://localhost:3000/graphql

#### Bước 1: Tạo Users

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
```

```graphql
# Tạo Customer 1
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

```graphql
# Tạo Customer 2
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
  }
}
```

#### Bước 2: Tạo Shop

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
  }
}
```

#### Bước 3: Đăng ký theo dõi Shop

```graphql
# Customer 1 đăng ký
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
  }
}
```

```graphql
# Customer 2 đăng ký
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
  }
}
```

#### Bước 4: Test Message Queue & Job Queue

```graphql
# Thêm sản phẩm mới - Đây là trigger cho Message Queue
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

## 🔍 Monitor Queue Activity

### 1. Application Logs

Trong terminal chạy `yarn start:dev`, bạn sẽ thấy:

```
[NotificationProcessor] Processing job 1
[NotificationProcessor] Sending email to mary@customer.com: New product available: iPhone 15 Pro
[NotificationProcessor] Email sent successfully
[NotificationProcessor] Processing job 2
[NotificationProcessor] Sending email to bob@customer.com: New product available: iPhone 15 Pro
[NotificationProcessor] Email sent successfully
```

### 2. Redis Queue Monitoring

```bash
# Kết nối Redis
docker exec -it redis-lesson-queue redis-cli

# Xem tất cả keys
KEYS *

# Xem queue stats
LLEN bull:notification:wait      # Jobs đang chờ
LLEN bull:notification:active    # Jobs đang xử lý
LLEN bull:notification:completed # Jobs hoàn thành
LLEN bull:notification:failed    # Jobs thất bại

# Xem job details
LRANGE bull:notification:wait 0 -1
LRANGE bull:notification:completed 0 -1

# Xem failed jobs
LRANGE bull:notification:failed 0 -1

# Thoát Redis
exit
```

### 3. Database Monitoring

```bash
# Mở Prisma Studio
npx prisma studio

# Hoặc query trực tiếp
psql -U postgres -h localhost -d lesson_queue

# Xem notifications
SELECT
    n.id,
    n.message,
    n.status,
    n.sent_at,
    u.name as customer_name,
    u.email as customer_email,
    s.name as shop_name
FROM notifications n
JOIN users u ON n.customer_id = u.id
JOIN shops s ON n.shop_id = s.id
ORDER BY n.sent_at DESC;
```

## 📊 Queue Performance Metrics

### 1. Job Statistics

```typescript
// Trong service, bạn có thể lấy queue stats
async getQueueStats() {
  const notificationQueue = this.notificationQueue;

  const stats = {
    waiting: await notificationQueue.getWaiting(),
    active: await notificationQueue.getActive(),
    completed: await notificationQueue.getCompleted(),
    failed: await notificationQueue.getFailed(),
    delayed: await notificationQueue.getDelayed(),
  };

  return stats;
}
```

### 2. Redis Commands cho Monitoring

```bash
# Xem memory usage
docker exec redis-lesson-queue redis-cli info memory

# Xem connected clients
docker exec redis-lesson-queue redis-cli info clients

# Xem command stats
docker exec redis-lesson-queue redis-cli info stats

# Monitor real-time commands
docker exec redis-lesson-queue redis-cli monitor
```

## 🚨 Error Handling & Retry

### 1. Job Retry Configuration

```typescript
// Trong notification service
await this.notificationQueue.add(
  'send-email',
  {
    notificationId: notification.id,
    customerEmail: subscription.customer.email,
    message,
  },
  {
    attempts: 3, // Số lần retry
    backoff: {
      type: 'exponential', // Loại backoff
      delay: 2000, // Delay ban đầu (ms)
    },
    removeOnComplete: 100, // Giữ 100 jobs hoàn thành
    removeOnFail: 50, // Giữ 50 jobs thất bại
  },
);
```

### 2. Failed Job Handling

```typescript
// Trong processor
@Process('send-email')
async handleSendEmail(job: Job) {
  try {
    // Process job logic
  } catch (error) {
    // Log error
    this.logger.error(`Job ${job.id} failed:`, error.message);

    // Update notification status
    await this.updateNotificationStatus(job.data.notificationId, 'failed');

    // Re-throw for retry mechanism
    throw error;
  }
}

// Global failed job handler
@OnGlobal('failed')
async onFailed(job: Job, err: Error) {
  this.logger.error(`Job ${job.id} failed permanently:`, err.message);

  // Có thể gửi alert, log to external service, etc.
}
```

## 🔧 Advanced Queue Features

### 1. Delayed Jobs

```typescript
// Gửi email nhắc nhở sau 24h
await this.notificationQueue.add(
  'reminder-email',
  {
    customerId: customer.id,
    shopId: shop.id,
  },
  {
    delay: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  },
);
```

### 2. Recurring Jobs

```typescript
// Gửi email marketing hàng tuần
await this.notificationQueue.add(
  'weekly-marketing',
  {
    shopId: shop.id,
  },
  {
    repeat: {
      cron: '0 9 * * 1', // Every Monday at 9 AM
    },
  },
);
```

### 3. Job Priority

```typescript
// Jobs với priority cao
await this.notificationQueue.add('urgent-notification', data, {
  priority: 1, // Higher priority (1 is highest)
});

// Jobs với priority thấp
await this.notificationQueue.add('newsletter', data, {
  priority: 10, // Lower priority
});
```

### 4. Job Concurrency

```typescript
// Xử lý nhiều jobs cùng lúc
@Process({
  name: 'send-email',
  concurrency: 5, // Xử lý 5 jobs cùng lúc
})
async handleSendEmail(job: Job) {
  // Job processing logic
}
```

## 🧹 Cleanup & Maintenance

### 1. Cleanup Old Jobs

```typescript
// Trong service
async cleanupOldJobs() {
  const notificationQueue = this.notificationQueue;

  // Xóa jobs hoàn thành cũ hơn 7 ngày
  await notificationQueue.clean(7 * 24 * 60 * 60 * 1000, 'completed');

  // Xóa jobs thất bại cũ hơn 30 ngày
  await notificationQueue.clean(30 * 24 * 60 * 60 * 1000, 'failed');
}
```

### 2. Queue Health Check

```typescript
async checkQueueHealth() {
  const notificationQueue = this.notificationQueue;

  try {
    // Test Redis connection
    await notificationQueue.isReady();

    // Get basic stats
    const stats = await notificationQueue.getJobCounts();

    return {
      status: 'healthy',
      stats,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date(),
    };
  }
}
```

## 📝 Test Scenarios

### 1. Basic Flow Test

```bash
# 1. Tạo users và shop
# 2. Đăng ký subscriptions
# 3. Thêm sản phẩm mới
# 4. Kiểm tra logs và database
```

### 2. Error Handling Test

```bash
# 1. Simulate network error
# 2. Check retry mechanism
# 3. Verify failed job handling
```

### 3. Performance Test

```bash
# 1. Tạo nhiều products cùng lúc
# 2. Monitor queue performance
# 3. Check memory usage
```

### 4. Recovery Test

```bash
# 1. Stop Redis container
# 2. Try to add products
# 3. Restart Redis
# 4. Check if jobs are processed
```

## 🆘 Troubleshooting

### Common Issues

1. **Redis Connection Failed**

   ```bash
   # Kiểm tra Redis container
   docker ps | grep redis

   # Test connection
   docker exec redis-lesson-queue redis-cli ping
   ```

2. **Jobs Not Processing**

   ```bash
   # Kiểm tra processor logs
   # Kiểm tra Redis queue stats
   # Verify job data format
   ```

3. **Memory Issues**

   ```bash
   # Check Redis memory usage
   docker exec redis-lesson-queue redis-cli info memory

   # Cleanup old jobs
   # Restart Redis if needed
   ```

### Debug Commands

```bash
# Xem tất cả Redis keys
docker exec redis-lesson-queue redis-cli keys "*"

# Xem job details
docker exec redis-lesson-queue redis-cli lrange bull:notification:wait 0 -1

# Monitor real-time
docker exec redis-lesson-queue redis-cli monitor

# Check queue lengths
docker exec redis-lesson-queue redis-cli llen bull:notification:*
```

## 🎯 Best Practices

1. **Job Data**: Luôn validate job data trước khi xử lý
2. **Error Handling**: Implement proper error handling và logging
3. **Retry Logic**: Sử dụng exponential backoff cho retry
4. **Monitoring**: Monitor queue performance và health
5. **Cleanup**: Regular cleanup old jobs để tránh memory issues
6. **Testing**: Test error scenarios và recovery mechanisms

## 📚 Resources

- [Bull Queue Documentation](https://docs.bullmq.io/)
- [Redis Documentation](https://redis.io/documentation)
- [NestJS Bull Module](https://docs.nestjs.com/techniques/queues)
- [Queue Patterns](https://microservices.io/patterns/data/event-driven-architecture.html)
