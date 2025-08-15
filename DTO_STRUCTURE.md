# 🏗️ Cấu Trúc DTO Mới

## 📋 Tổng Quan

Mỗi model folder giờ đây có folder `dto` riêng với file `index.ts` để export các DTOs. Tất cả API responses đều có format chuẩn `{ data: ... }`.

## 🗂️ **Cấu Trúc Thư Mục**

```
src/
├── user/
│   ├── dto/
│   │   ├── user.dto.ts
│   │   └── index.ts          # export * from './user.dto'
│   ├── user.service.ts
│   ├── user.resolver.ts
│   └── user.module.ts
├── shop/
│   ├── dto/
│   │   ├── shop.dto.ts
│   │   └── index.ts          # export * from './shop.dto'
│   ├── shop.service.ts
│   ├── shop.resolver.ts
│   └── shop.module.ts
├── product/
│   ├── dto/
│   │   ├── product.dto.ts
│   │   └── index.ts          # export * from './product.dto'
│   ├── product.service.ts
│   ├── product.resolver.ts
│   └── product.module.ts
├── subscription/
│   ├── dto/
│   │   ├── subscription.dto.ts
│   │   └── index.ts          # export * from './subscription.dto'
│   ├── subscription.service.ts
│   ├── subscription.resolver.ts
│   └── subscription.module.ts
├── notification/
│   ├── dto/
│   │   ├── notification.dto.ts
│   │   └── index.ts          # export * from './notification.dto'
│   ├── notification.service.ts
│   ├── notification.resolver.ts
│   └── notification.module.ts
├── queue/
│   ├── dto/
│   │   ├── queue.dto.ts
│   │   └── index.ts          # export * from './queue.dto'
│   ├── queue.module.ts
│   └── queue.processor.ts
└── shared/
    └── dto/
        ├── analytics.dto.ts
        ├── responses.dto.ts
        └── index.ts          # export shared DTOs
```

## 🎯 **Format Response Chuẩn**

### **Base Response Structure**

```typescript
{
  success: boolean;
  message?: string;
  code?: number;
  data: T; // T là type của data
}
```

### **Success Response Example**

```json
{
  "success": true,
  "message": "User created successfully",
  "code": 200,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER"
  }
}
```

### **Error Response Example**

```json
{
  "success": false,
  "message": "User not found",
  "code": 404,
  "data": null
}
```

## 📁 **DTO Files Chi Tiết**

### **1. User DTOs**

```typescript
// src/user/dto/user.dto.ts
export class User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // ... other fields
}

export class CreateUserInput {
  name: string;
  email: string;
  role?: UserRole;
}

export class UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
}
```

### **2. Shop DTOs**

```typescript
// src/shop/dto/shop.dto.ts
export class Shop {
  id: string;
  name: string;
  description?: string;
  slug: string;
  // ... other fields
}

export class CreateShopInput {
  name: string;
  description?: string;
  ownerId: string;
}
```

### **3. Product DTOs**

```typescript
// src/product/dto/product.dto.ts
export class Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  // ... other fields
}

export class CreateProductInput {
  shopId: string;
  name: string;
  price: number;
  description?: string;
}
```

### **4. Response DTOs**

```typescript
// src/shared/dto/responses.dto.ts
export class UserResponse extends BaseResponse {
  data?: string; // Will be User type
}

export class PaginatedUsersResponse extends BaseResponse {
  data: string[]; // Will be User[] type
  pagination: PaginationInfo;
}
```

## 🔄 **Import/Export Pattern**

### **Model DTO Index**

```typescript
// src/user/dto/index.ts
export * from './user.dto';

// src/shop/dto/index.ts
export * from './shop.dto';

// src/product/dto/index.ts
export * from './product.dto';
```

### **Shared DTO Index**

```typescript
// src/shared/dto/index.ts
export * from './analytics.dto';
export * from './responses.dto';
```

### **Usage in Services/Resolvers**

```typescript
// Import từ model dto
import { CreateUserInput, User } from '../dto';

// Import từ shared dto
import { UserResponse, PaginatedUsersResponse } from '../../shared/dto';
```

## 🚀 **API Response Examples**

### **1. Single User Query**

```graphql
query {
  user(id: "user_123") {
    success
    message
    code
    data {
      id
      name
      email
      role
    }
  }
}
```

**Response:**

```json
{
  "data": {
    "user": {
      "success": true,
      "message": "User retrieved successfully",
      "code": 200,
      "data": {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "CUSTOMER"
      }
    }
  }
}
```

### **2. Paginated Users Query**

```graphql
query {
  users(pagination: { page: 1, limit: 10 }) {
    success
    message
    code
    data {
      id
      name
      email
      role
    }
    pagination {
      page
      limit
      total
      totalPages
      hasNextPage
    }
  }
}
```

**Response:**

```json
{
  "data": {
    "users": {
      "success": true,
      "message": "Users retrieved successfully",
      "code": 200,
      "data": [
        {
          "id": "user_1",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "CUSTOMER"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 25,
        "totalPages": 3,
        "hasNextPage": true
      }
    }
  }
}
```

### **3. Create User Mutation**

```graphql
mutation {
  createUser(
    input: { name: "Jane Doe", email: "jane@example.com", role: SHOP_OWNER }
  ) {
    success
    message
    code
    data {
      id
      name
      email
      role
      createdAt
    }
  }
}
```

**Response:**

```json
{
  "data": {
    "createUser": {
      "success": true,
      "message": "User created successfully",
      "code": 201,
      "data": {
        "id": "user_456",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "SHOP_OWNER",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    }
  }
}
```

## 🎯 **Benefits của Cấu Trúc Mới**

### **1. Organization**

✅ **Modular**: Mỗi model có DTOs riêng
✅ **Clear Separation**: Tách biệt model và shared DTOs
✅ **Easy Maintenance**: Dễ dàng maintain và update

### **2. Consistency**

✅ **Standard Format**: Tất cả responses đều có format `{ data: ... }`
✅ **Uniform Structure**: Nhất quán trong toàn bộ API
✅ **Predictable**: Developers biết trước response format

### **3. Type Safety**

✅ **TypeScript Support**: Full type safety
✅ **GraphQL Integration**: Tích hợp tốt với GraphQL
✅ **IntelliSense**: IDE support tốt

### **4. Scalability**

✅ **Easy Extension**: Dễ dàng thêm DTOs mới
✅ **Reusable**: Có thể reuse shared DTOs
✅ **Maintainable**: Dễ maintain khi project lớn

## 🔧 **Implementation Steps**

### **1. Update Import Statements**

```typescript
// Thay vì
import { User } from '../../shared/dto';

// Sử dụng
import { User } from '../dto';
```

### **2. Update Response Types**

```typescript
// Trong resolvers
@Query(() => UserResponse)
async user(@Args('id') id: string): Promise<UserResponse> {
  const user = await this.userService.findById(id);
  return {
    success: true,
    message: 'User retrieved successfully',
    code: 200,
    data: user
  };
}
```

### **3. Update GraphQL Schema**

```graphql
type UserResponse {
  success: Boolean!
  message: String
  code: Int
  data: User
}
```

## 📚 **Next Steps**

1. **Update Resolvers**: Sử dụng response DTOs mới
2. **Update Services**: Return data với format chuẩn
3. **Update GraphQL Schema**: Sử dụng response types
4. **Test APIs**: Verify response format
5. **Update Documentation**: Cập nhật API docs

---

**Cấu trúc DTO mới đã sẵn sàng! 🚀**
