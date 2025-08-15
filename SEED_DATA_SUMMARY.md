# 🌱 Seed Data Summary

## 📋 Tổng Quan

Hệ thống Lesson Queue đã được setup với seed data đầy đủ để demo message queue và job queue.

## 🚀 Cách Chạy Nhanh

### Option 1: Automated Script (Khuyến nghị)

```bash
# Chạy script tự động
chmod +x demo-seed-automated.sh
./demo-seed-automated.sh
```

### Option 2: Manual Steps

```bash
# 1. Khởi động services
docker-compose up -d

# 2. Setup database
npx prisma db push

# 3. Tạo seed data
yarn seed

# 4. Khởi động app
yarn start:dev
```

## 📊 Seed Data Details

### 👥 Users (6)

| ID  | Name                      | Email                  | Role       | Description       |
| --- | ------------------------- | ---------------------- | ---------- | ----------------- |
| 1   | John Tech Store Owner     | john@techstore.com     | SHOP_OWNER | Chủ Tech Store    |
| 2   | Sarah Fashion Store Owner | sarah@fashionstore.com | SHOP_OWNER | Chủ Fashion Store |
| 3   | Mary Johnson              | mary@customer.com      | CUSTOMER   | Khách hàng 1      |
| 4   | Bob Smith                 | bob@customer.com       | CUSTOMER   | Khách hàng 2      |
| 5   | Alice Brown               | alice@customer.com     | CUSTOMER   | Khách hàng 3      |
| 6   | Admin User                | admin@lessonqueue.com  | ADMIN      | Quản trị viên     |

### 🏪 Shops (2)

| ID  | Name          | Description                       | Owner                     | Products Count |
| --- | ------------- | --------------------------------- | ------------------------- | -------------- |
| 1   | Tech Store    | Cửa hàng công nghệ hàng đầu       | John Tech Store Owner     | 3              |
| 2   | Fashion Store | Thời trang hiện đại và phong cách | Sarah Fashion Store Owner | 2              |

### 📦 Products (5)

| ID  | Name                    | Shop          | Price    | Description                  |
| --- | ----------------------- | ------------- | -------- | ---------------------------- |
| 1   | iPhone 15 Pro           | Tech Store    | $999.99  | Smartphone mới nhất từ Apple |
| 2   | MacBook Pro M3          | Tech Store    | $1999.99 | Laptop mạnh mẽ với chip M3   |
| 3   | AirPods Pro 2           | Tech Store    | $249.99  | Tai nghe không dây           |
| 4   | Summer Dress Collection | Fashion Store | $89.99   | Bộ sưu tập váy mùa hè        |
| 5   | Premium Sneakers        | Fashion Store | $129.99  | Giày thể thao cao cấp        |

### 🔔 Subscriptions (5)

| Customer     | Shop          | Status        |
| ------------ | ------------- | ------------- |
| Mary Johnson | Tech Store    | ✅ Subscribed |
| Bob Smith    | Tech Store    | ✅ Subscribed |
| Alice Brown  | Tech Store    | ✅ Subscribed |
| Mary Johnson | Fashion Store | ✅ Subscribed |
| Bob Smith    | Fashion Store | ✅ Subscribed |

### 📧 Sample Notifications (5)

| Customer     | Shop          | Product       | Status | Sent At      |
| ------------ | ------------- | ------------- | ------ | ------------ |
| Mary Johnson | Tech Store    | iPhone 15 Pro | sent   | 1 day ago    |
| Bob Smith    | Tech Store    | iPhone 15 Pro | sent   | 1 day ago    |
| Alice Brown  | Tech Store    | iPhone 15 Pro | sent   | 1 day ago    |
| Mary Johnson | Fashion Store | Summer Dress  | sent   | 12 hours ago |
| Bob Smith    | Fashion Store | Summer Dress  | sent   | 12 hours ago |

## 🎯 Demo Scenarios

### Scenario 1: Tech Store Product

- **Action**: Thêm sản phẩm mới vào Tech Store
- **Result**: 3 notification jobs được tạo
- **Recipients**: mary@customer.com, bob@customer.com, alice@customer.com

### Scenario 2: Fashion Store Product

- **Action**: Thêm sản phẩm mới vào Fashion Store
- **Result**: 2 notification jobs được tạo
- **Recipients**: mary@customer.com, bob@customer.com

### Scenario 3: New Shop

- **Action**: Tạo shop mới với owner mới
- **Result**: Shop được tạo, có thể thêm products

### Scenario 4: New Subscription

- **Action**: Customer đăng ký theo dõi shop mới
- **Result**: Subscription được tạo, notifications sẽ được gửi

## 🔍 Test Queries

### 1. Xem Tất Cả Data

```graphql
query {
  users {
    id
    name
    email
    role
  }

  shops {
    id
    name
    description
    owner {
      name
    }
    products {
      name
      price
    }
    subscriptions {
      customer {
        name
      }
    }
  }

  notifications {
    message
    status
    customer {
      name
    }
    shop {
      name
    }
    product {
      name
    }
  }
}
```

### 2. Test Queue (Thêm Product)

```graphql
mutation {
  createProduct(
    createProductInput: {
      shopId: "1" # Tech Store ID
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

## 👀 Monitor Queue

### Application Logs

```bash
# Terminal chạy yarn start:dev
[NotificationProcessor] Processing job 1
[NotificationProcessor] Sending email to mary@customer.com: New product available: iPad Pro 2024
[NotificationProcessor] Email sent successfully
```

### Redis Queue

```bash
# Kết nối Redis
docker exec -it redis-lesson-queue redis-cli

# Xem queue stats
LLEN bull:notification:wait      # Jobs đang chờ
LLEN bull:notification:active    # Jobs đang xử lý
LLEN bull:notification:completed # Jobs hoàn thành
LLEN bull:notification:failed    # Jobs thất bại
```

### Database

```bash
# Mở Prisma Studio
yarn db:studio

# Hoặc query trực tiếp
psql -U postgres -h localhost -d lesson_queue
```

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

## 📚 Scripts Available

| Script         | Command                    | Description                   |
| -------------- | -------------------------- | ----------------------------- |
| Seed Data      | `yarn seed`                | Tạo dữ liệu mẫu               |
| Reset & Seed   | `yarn seed:reset`          | Reset DB và tạo lại seed data |
| Test Database  | `node test-database.js`    | Test kết nối database         |
| Test Queue     | `node test-queue.js`       | Test queue system             |
| Automated Demo | `./demo-seed-automated.sh` | Script demo tự động           |

## 🎉 Expected Results

✅ **6 Users** được tạo với roles khác nhau
✅ **2 Shops** với owners tương ứng
✅ **5 Products** trong 2 shops
✅ **5 Subscriptions** giữa customers và shops
✅ **5 Sample notifications** để demo
✅ **Queue system** hoạt động với Bull + Redis
✅ **Database** được setup với Prisma
✅ **GraphQL API** sẵn sàng để test

## 🚀 Next Steps

1. **Start Application**: `yarn start:dev`
2. **Open GraphQL**: http://localhost:3000/graphql
3. **Test Queries**: Sử dụng queries trong demo-with-seed.md
4. **Monitor Queue**: Watch logs và Redis queue
5. **Experiment**: Thử nghiệm với các scenarios khác nhau

---

**Seed Data Ready! 🚀**
