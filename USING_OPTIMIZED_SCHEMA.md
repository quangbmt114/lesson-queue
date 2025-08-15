# 🚀 Sử Dụng GraphQL Schema Tối Ưu

## 📋 Tổng Quan

Hướng dẫn sử dụng GraphQL schema đã được tối ưu hóa cho hệ thống Lesson Queue.

## 🎯 **Cách Sử Dụng Schema**

### **1. Khởi động với Schema Mới**

```bash
# Build project
yarn build

# Start application
yarn start:dev
```

### **2. Truy cập GraphQL Playground**

```
http://localhost:3000/graphql
```

## 🧪 **Test Queries Cơ Bản**

### **1. Xem Tất Cả Users với Pagination**

```graphql
query {
  users(pagination: { page: 1, limit: 10 }) {
    data {
      id
      name
      email
      role
      totalShops
      totalSubscriptions
    }
    pagination {
      total
      totalPages
      hasNextPage
      hasPreviousPage
    }
  }
}
```

### **2. Filter Users theo Role**

```graphql
query {
  users(filter: { role: SHOP_OWNER }, pagination: { page: 1, limit: 20 }) {
    data {
      id
      name
      email
      ownedShops {
        name
        description
      }
    }
    pagination {
      total
      totalPages
    }
  }
}
```

### **3. Xem Shops với Analytics**

```graphql
query {
  shops(pagination: { page: 1, limit: 5 }) {
    data {
      id
      name
      description
      owner {
        name
        email
      }
      stats {
        totalProducts
        totalSubscribers
        totalRevenue
        averageRating
      }
      products {
        name
        price
        status
      }
    }
    pagination {
      total
      totalPages
    }
  }
}
```

### **4. Advanced Product Search**

```graphql
query {
  products(
    filter: { priceMin: 100, priceMax: 2000, status: ACTIVE, inStock: true }
    sort: { field: PRICE, direction: ASC }
    pagination: { page: 1, limit: 20 }
  ) {
    data {
      id
      name
      price
      description
      shop {
        name
        owner {
          name
        }
      }
      analytics {
        views
        likes
        conversionRate
      }
    }
    pagination {
      total
      totalPages
    }
  }
}
```

### **5. Xem Notifications với Filtering**

```graphql
query {
  notifications(
    filter: { status: SENT, isRead: false }
    sort: { field: CREATED_AT, direction: DESC }
    pagination: { page: 1, limit: 50 }
  ) {
    data {
      id
      message
      type
      priority
      status
      customer {
        name
        email
      }
      shop {
        name
      }
      product {
        name
        price
      }
      createdAt
      sentAt
    }
    pagination {
      total
      totalPages
    }
  }
}
```

## 🚀 **Test Mutations**

### **1. Tạo User Mới**

```graphql
mutation {
  createUser(
    input: {
      name: "New Shop Owner"
      email: "newowner@shop.com"
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

### **2. Tạo Shop Mới**

```graphql
mutation {
  createShop(
    input: {
      name: "New Tech Store"
      description: "Latest technology products"
      ownerId: "USER_ID_HERE"
    }
  ) {
    id
    name
    description
    owner {
      name
      email
    }
    createdAt
  }
}
```

### **3. Tạo Product Mới (Trigger Queue)**

```graphql
mutation {
  createProduct(
    input: {
      shopId: "SHOP_ID_HERE"
      name: "iPhone 16 Pro"
      description: "Latest iPhone with advanced features"
      price: 1199.99
      currency: "USD"
      status: ACTIVE
      stockQuantity: 50
      category: "Smartphones"
      tags: ["Apple", "iPhone", "5G"]
    }
  ) {
    id
    name
    price
    status
    shop {
      name
      owner {
        name
      }
    }
    createdAt
  }
}
```

### **4. Tạo Subscription**

```graphql
mutation {
  createSubscription(
    input: {
      customerId: "CUSTOMER_ID_HERE"
      shopId: "SHOP_ID_HERE"
      preferences: {
        emailNotifications: true
        smsNotifications: false
        categories: ["Electronics", "Gadgets"]
      }
    }
  ) {
    id
    status
    customer {
      name
      email
    }
    shop {
      name
    }
    createdAt
  }
}
```

## 📊 **Analytics Queries**

### **1. System Overview**

```graphql
query {
  systemStats {
    totalUsers
    totalShops
    totalProducts
    totalSubscriptions
    totalNotifications
    systemHealth {
      database
      redis
      queue
      overall
    }
  }
}
```

### **2. User Analytics**

```graphql
query {
  userStats(userId: "USER_ID_HERE") {
    totalShops
    totalProducts
    totalSubscriptions
    totalNotifications
    averageRating
    monthlyGrowth
    engagementScore
  }
}
```

### **3. Shop Analytics**

```graphql
query {
  shopStats(shopId: "SHOP_ID_HERE") {
    totalProducts
    totalSubscribers
    totalRevenue
    averageRating
    monthlyGrowth
    topProducts {
      name
      price
      analytics {
        views
        conversionRate
      }
    }
  }
}
```

## 🔍 **Queue Management**

### **1. Queue Statistics**

```graphql
query {
  queueStats(queueName: "notification") {
    waiting
    active
    completed
    failed
    delayed
    total
    throughput
    averageProcessingTime
  }
}
```

### **2. Queue Jobs**

```graphql
query {
  queueJobs(
    queueName: "notification"
    status: COMPLETED
    pagination: { page: 1, limit: 20 }
  ) {
    data {
      id
      name
      status
      progress
      attempts
      createdAt
      processedAt
      error
    }
    pagination {
      total
      totalPages
    }
  }
}
```

### **3. Queue Control**

```graphql
mutation {
  pauseQueue(queueName: "notification")
}

mutation {
  resumeQueue(queueName: "notification")
}

mutation {
  clearQueue(queueName: "notification", status: FAILED)
}
```

## 📱 **Real-Time Subscriptions**

### **1. Notification Updates**

```graphql
subscription {
  notificationCreated {
    id
    message
    type
    priority
    customer {
      name
      email
    }
    shop {
      name
    }
    product {
      name
      price
    }
    createdAt
  }
}
```

### **2. Product Updates**

```graphql
subscription {
  productCreated {
    id
    name
    price
    shop {
      name
      owner {
        name
      }
    }
    createdAt
  }
}

subscription {
  productUpdated {
    id
    name
    price
    status
    updatedAt
  }
}
```

### **3. Queue Updates**

```graphql
subscription {
  queueJobUpdated(queueName: "notification") {
    id
    name
    status
    progress
    attempts
    error
  }
}

subscription {
  queueStatsUpdated(queueName: "notification") {
    waiting
    active
    completed
    failed
    total
    throughput
  }
}
```

## 🔐 **Security & Authorization**

### **1. Role-Based Access**

```graphql
# Chỉ SHOP_OWNER và ADMIN mới có thể xem shop details
query {
  shop(id: "SHOP_ID_HERE") {
    id
    name
    description
    # Các fields nhạy cảm sẽ được bảo vệ bởi @auth directive
  }
}
```

### **2. Rate Limiting**

```graphql
# Queries có rate limiting
query {
  users(pagination: { page: 1, limit: 100 }) {
    data {
      id
      name
      email
    }
  }
}
```

## 🚀 **Performance Tips**

### **1. Field Selection**

```graphql
# ✅ Tốt: Chỉ select fields cần thiết
query {
  users(pagination: { page: 1, limit: 10 }) {
    data {
      id
      name
      email
      role
    }
  }
}

# ❌ Không tốt: Select tất cả fields
query {
  users(pagination: { page: 1, limit: 10 }) {
    data {
      id
      name
      email
      role
      createdAt
      updatedAt
      ownedShops {
        id
        name
        description
        products {
          id
          name
          price
        }
      }
      subscriptions {
        id
        shop {
          id
          name
          description
        }
      }
      notifications {
        id
        message
        type
        priority
        status
      }
    }
  }
}
```

### **2. Pagination**

```graphql
# ✅ Tốt: Sử dụng pagination
query {
  products(pagination: { page: 1, limit: 20 }) {
    data {
      id
      name
      price
    }
    pagination {
      total
      hasNextPage
    }
  }
}

# ❌ Không tốt: Load tất cả data
query {
  products {
    id
    name
    price
  }
}
```

### **3. Filtering**

```graphql
# ✅ Tốt: Sử dụng filters để giảm data
query {
  products(
    filter: { shopId: "SHOP_ID_HERE", status: ACTIVE, inStock: true }
    pagination: { page: 1, limit: 20 }
  ) {
    data {
      id
      name
      price
    }
  }
}
```

## 🧪 **Testing Workflow**

### **1. Basic Testing**

```bash
# 1. Start application
yarn start:dev

# 2. Open GraphQL Playground
# http://localhost:3000/graphql

# 3. Test basic queries
# - users
# - shops
# - products

# 4. Test mutations
# - createUser
# - createShop
# - createProduct
```

### **2. Queue Testing**

```bash
# 1. Create product to trigger notifications
# 2. Watch application logs
# 3. Monitor Redis queue
# 4. Check database for notifications
```

### **3. Performance Testing**

```bash
# 1. Test with large datasets
# 2. Monitor query execution time
# 3. Check memory usage
# 4. Test concurrent requests
```

## 🚨 **Troubleshooting**

### **1. Schema Issues**

```bash
# Rebuild project
yarn build

# Check GraphQL schema
curl http://localhost:3000/graphql -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}'
```

### **2. Performance Issues**

```bash
# Check Redis
docker exec redis-lesson-queue redis-cli info

# Check database
yarn db:studio

# Monitor logs
docker logs redis-lesson-queue
```

## 🎉 **Benefits của Schema Tối Ưu**

✅ **Fast Queries**: Pagination và filtering
✅ **Type Safety**: Full TypeScript support
✅ **Real-time**: WebSocket subscriptions
✅ **Scalable**: Hỗ trợ horizontal scaling
✅ **Secure**: Role-based access control
✅ **Cached**: Built-in caching strategies
✅ **Monitored**: Comprehensive metrics
✅ **Flexible**: Advanced filtering và sorting

---

**Schema đã sẵn sàng để sử dụng! 🚀**
