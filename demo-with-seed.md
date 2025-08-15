# 🚀 Demo với Seed Data

## 📋 Tổng Quan

File này hướng dẫn demo hệ thống Lesson Queue với seed data đầy đủ, bao gồm:

- 2 Shop Owners
- 3 Customers
- 2 Shops (Tech Store + Fashion Store)
- 5 Products
- 5 Subscriptions
- Sample notifications

## 🚀 Quick Start với Seed Data

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

### 2. Setup Database & Seed Data

```bash
# Khởi tạo database schema
npx prisma db push

# Tạo seed data
yarn seed

# Hoặc reset và seed lại
yarn seed:reset
```

### 3. Khởi động Ứng dụng

```bash
yarn start:dev
```

### 4. Mở GraphQL Playground

Truy cập: http://localhost:3000/graphql

## 📊 Seed Data Overview

### 👥 Users

| Name                      | Email                  | Role       | Description       |
| ------------------------- | ---------------------- | ---------- | ----------------- |
| John Tech Store Owner     | john@techstore.com     | SHOP_OWNER | Chủ Tech Store    |
| Sarah Fashion Store Owner | sarah@fashionstore.com | SHOP_OWNER | Chủ Fashion Store |
| Mary Johnson              | mary@customer.com      | CUSTOMER   | Khách hàng 1      |
| Bob Smith                 | bob@customer.com       | CUSTOMER   | Khách hàng 2      |
| Alice Brown               | alice@customer.com     | CUSTOMER   | Khách hàng 3      |
| Admin User                | admin@lessonqueue.com  | ADMIN      | Quản trị viên     |

### 🏪 Shops

| Name          | Description                       | Owner                     | Products                                     |
| ------------- | --------------------------------- | ------------------------- | -------------------------------------------- |
| Tech Store    | Cửa hàng công nghệ hàng đầu       | John Tech Store Owner     | iPhone 15 Pro, MacBook Pro M3, AirPods Pro 2 |
| Fashion Store | Thời trang hiện đại và phong cách | Sarah Fashion Store Owner | Summer Dress Collection, Premium Sneakers    |

### 🔔 Subscriptions

| Customer     | Shop          | Status        |
| ------------ | ------------- | ------------- |
| Mary Johnson | Tech Store    | ✅ Subscribed |
| Bob Smith    | Tech Store    | ✅ Subscribed |
| Alice Brown  | Tech Store    | ✅ Subscribed |
| Mary Johnson | Fashion Store | ✅ Subscribed |
| Bob Smith    | Fashion Store | ✅ Subscribed |

### 📦 Products

| Name                    | Shop          | Price    | Description                  |
| ----------------------- | ------------- | -------- | ---------------------------- |
| iPhone 15 Pro           | Tech Store    | $999.99  | Smartphone mới nhất từ Apple |
| MacBook Pro M3          | Tech Store    | $1999.99 | Laptop mạnh mẽ với chip M3   |
| AirPods Pro 2           | Tech Store    | $249.99  | Tai nghe không dây           |
| Summer Dress Collection | Fashion Store | $89.99   | Bộ sưu tập váy mùa hè        |
| Premium Sneakers        | Fashion Store | $129.99  | Giày thể thao cao cấp        |

## 🧪 Test Queries

### 1. Xem Tất Cả Users

```graphql
query {
  users {
    id
    name
    email
    role
    ownedShops {
      name
      description
    }
    subscriptions {
      shop {
        name
      }
    }
  }
}
```

### 2. Xem Shop Owners

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
        description
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

### 3. Xem Customers

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
        products {
          name
          price
        }
      }
    }
  }
}
```

### 4. Xem Shops và Products

```graphql
query {
  shops {
    id
    name
    description
    owner {
      name
      email
    }
    products {
      name
      price
      description
    }
    subscriptions {
      customer {
        name
        email
      }
    }
  }
}
```

### 5. Xem Notifications

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

## 🎯 Demo Scenarios

### Scenario 1: Thêm Sản Phẩm Mới vào Tech Store

```graphql
mutation {
  createProduct(
    createProductInput: {
      shopId: "TECH_STORE_ID_HERE"
      name: "iPad Pro 2024"
      description: "Tablet mới nhất với chip M4"
      price: 1299.99
    }
  ) {
    id
    name
    price
    createdAt
  }
}
```

**Expected Result:**

- Product được tạo
- 3 notification jobs được tạo (cho 3 subscribers)
- Emails được gửi đến: mary@customer.com, bob@customer.com, alice@customer.com
- Logs hiển thị job processing

### Scenario 2: Thêm Sản Phẩm Mới vào Fashion Store

```graphql
mutation {
  createProduct(
    createProductInput: {
      shopId: "FASHION_STORE_ID_HERE"
      name: "Winter Coat Collection"
      description: "Áo khoác mùa đông ấm áp"
      price: 199.99
    }
  ) {
    id
    name
    price
    createdAt
  }
}
```

**Expected Result:**

- Product được tạo
- 2 notification jobs được tạo (cho 2 subscribers)
- Emails được gửi đến: mary@customer.com, bob@customer.com
- Logs hiển thị job processing

### Scenario 3: Tạo Shop Mới

```graphql
mutation {
  createUser(
    createUserInput: {
      name: "Mike Book Store Owner"
      email: "mike@bookstore.com"
      role: SHOP_OWNER
    }
  ) {
    id
    name
    email
    role
  }
}

mutation {
  createShop(
    createShopInput: {
      name: "Book Store"
      description: "Sách và tài liệu học tập"
      ownerId: "NEW_OWNER_ID_HERE"
    }
  ) {
    id
    name
    description
    ownerId
  }
}
```

### Scenario 4: Customer Đăng Ký Shop Mới

```graphql
mutation {
  createSubscription(
    createSubscriptionInput: {
      customerId: "ALICE_CUSTOMER_ID_HERE"
      shopId: "NEW_SHOP_ID_HERE"
    }
  ) {
    id
    customerId
    shopId
    createdAt
  }
}
```

## 👀 Monitor Queue Activity

### 1. Application Logs

Trong terminal chạy `yarn start:dev`, bạn sẽ thấy:

```
[NotificationProcessor] Processing job 1
[NotificationProcessor] Sending email to mary@customer.com: New product available: iPad Pro 2024
[NotificationProcessor] Email sent successfully
[NotificationProcessor] Processing job 2
[NotificationProcessor] Sending email to bob@customer.com: New product available: iPad Pro 2024
[NotificationProcessor] Email sent successfully
[NotificationProcessor] Processing job 3
[NotificationProcessor] Sending email to alice@customer.com: New product available: iPad Pro 2024
[NotificationProcessor] Email sent successfully
```

### 2. Redis Queue Monitoring

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

# Monitor real-time
MONITOR
```

### 3. Database Monitoring

```bash
# Mở Prisma Studio
yarn db:studio

# Hoặc query trực tiếp
psql -U postgres -h localhost -d lesson_queue

# Xem notifications mới
SELECT
    n.id,
    n.message,
    n.status,
    n.sent_at,
    u.name as customer_name,
    u.email as customer_email,
    s.name as shop_name,
    p.name as product_name
FROM notifications n
JOIN users u ON n.customer_id = u.id
JOIN shops s ON n.shop_id = s.id
LEFT JOIN products p ON n.product_id = p.id
ORDER BY n.sent_at DESC;
```

## 🔍 Test Cases

### Test Case 1: Basic Queue Functionality

1. Thêm sản phẩm mới vào Tech Store
2. Verify 3 notification jobs được tạo
3. Check logs hiển thị job processing
4. Verify notifications trong database

### Test Case 2: Multiple Shops

1. Thêm sản phẩm vào Fashion Store
2. Verify 2 notification jobs được tạo
3. Check logs hiển thị job processing
4. Verify notifications trong database

### Test Case 3: Error Handling

1. Stop Redis container
2. Try to add product
3. Verify error handling
4. Restart Redis
5. Check if jobs are processed

### Test Case 4: Performance

1. Add multiple products quickly
2. Monitor queue performance
3. Check memory usage
4. Verify all jobs are processed

## 📊 Expected Results

### Database Counts

- **Users**: 6 (2 SHOP_OWNER, 3 CUSTOMER, 1 ADMIN)
- **Shops**: 2 (Tech Store, Fashion Store)
- **Products**: 5 (3 Tech + 2 Fashion)
- **Subscriptions**: 5 (3 Tech Store + 2 Fashion Store)
- **Notifications**: 5 (sample data) + new ones from demo

### Queue Results

- Jobs được tạo và xử lý thành công
- Email notifications được gửi đến subscribers
- Application logs hiển thị job processing
- Redis queue stats hiển thị job status

## 🚨 Troubleshooting

### Seed Data Issues

```bash
# Reset và seed lại
yarn seed:reset

# Hoặc seed lại
yarn seed
```

### Queue Issues

```bash
# Test queue
node test-queue.js

# Check Redis
docker exec redis-lesson-queue redis-cli ping
```

### Database Issues

```bash
# Test database
node test-database.js

# Reset database
npx prisma migrate reset
```

## 🎉 Success Criteria

✅ **Seed data được tạo thành công**
✅ **Queue system hoạt động**
✅ **Notifications được gửi**
✅ **Logs hiển thị job processing**
✅ **Database được cập nhật**

---

**Happy Demo với Seed Data! 🚀**
