# 🚀 GraphQL DTO Generation Libraries

## 📋 Tổng Quan

Có nhiều thư viện hỗ trợ generate DTOs và TypeScript types từ GraphQL schema. Dưới đây là các options tốt nhất:

## 🏆 **GraphQL Code Generator (Khuyến Nghị)**

### **Ưu Điểm**

✅ **Type Safety**: Generate TypeScript types hoàn hảo
✅ **Resolver Types**: Auto-generate resolver types
✅ **Custom Mappers**: Map types với DTOs hiện có
✅ **Watch Mode**: Auto-regenerate khi schema thay đổi
✅ **Community**: Hỗ trợ tốt và documentation đầy đủ
✅ **Flexible**: Nhiều plugins và options

### **Cài Đặt**

```bash
yarn add -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-resolvers @graphql-codegen/typescript-operations
```

### **Cấu Hình (codegen.yml)**

```yaml
overwrite: true
schema: 'src/graphql/schema.graphql'
generates:
  src/generated/graphql.ts:
    plugins:
      - 'typescript'
      - 'typescript-resolvers'
    config:
      mappers:
        User: '../user/dto#User'
        Shop: '../shop/dto#Shop'
        Product: '../product/dto#Product'
      scalars:
        DateTime: 'Date'
        JSON: 'Record<string, any>'
```

### **Scripts**

```json
{
  "scripts": {
    "codegen": "graphql-codegen",
    "codegen:watch": "graphql-codegen --watch",
    "codegen:generate": "yarn codegen && yarn build"
  }
}
```

### **Output**

```typescript
// Generated types
export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  name: Scalars['String'];
  email: Scalars['String'];
  role: UserRole;
  // ... other fields
};

// Generated resolvers
export type UserResolvers<
  ContextType = any,
  ParentType extends
    ResolversParentTypes['User'] = ResolversParentTypes['User'],
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  // ... other resolvers
};
```

## 🔧 **Prisma GraphQL Generator**

### **Ưu Điểm**

✅ **Prisma Integration**: Tích hợp tốt với Prisma
✅ **Auto Schema**: Generate schema từ Prisma models
✅ **Type Safety**: Full type safety với Prisma
✅ **Simple Setup**: Dễ dàng setup

### **Cài Đặt**

```bash
yarn add -D prisma-graphql-generator
```

### **Cấu Hình (schema.prisma)**

```prisma
generator graphql {
  provider = "prisma-graphql-generator"
  output   = "../src/generated/graphql"
  // Options
  excludeFields = ["password", "secret"]
  excludeModels = ["InternalModel"]
}
```

### **Output**

```typescript
// Generated GraphQL schema
export const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: UserRole!
  }

  input CreateUserInput {
    name: String!
    email: String!
    role: UserRole
  }
`;
```

## 📚 **NestJS GraphQL Auto-Generation**

### **Ưu Điểm**

✅ **Built-in**: Tích hợp sẵn với NestJS
✅ **Decorator-based**: Sử dụng decorators
✅ **Auto Schema**: Tự động generate schema
✅ **Simple**: Không cần cấu hình phức tạp

### **Cấu Hình**

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true, // Auto-generate từ decorators
  playground: true,
});
```

### **Sử Dụng Decorators**

```typescript
@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => UserRole)
  role: UserRole;
}
```

## 🎯 **So Sánh Các Options**

| Feature                | GraphQL Codegen | Prisma Generator | NestJS Auto-gen |
| ---------------------- | --------------- | ---------------- | --------------- |
| **Type Safety**        | ⭐⭐⭐⭐⭐      | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐        |
| **Flexibility**        | ⭐⭐⭐⭐⭐      | ⭐⭐⭐           | ⭐⭐⭐          |
| **Prisma Integration** | ⭐⭐⭐⭐        | ⭐⭐⭐⭐⭐       | ⭐⭐⭐          |
| **NestJS Integration** | ⭐⭐⭐⭐        | ⭐⭐⭐           | ⭐⭐⭐⭐⭐      |
| **Customization**      | ⭐⭐⭐⭐⭐      | ⭐⭐⭐           | ⭐⭐            |
| **Learning Curve**     | ⭐⭐⭐          | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐      |
| **Community Support**  | ⭐⭐⭐⭐⭐      | ⭐⭐⭐           | ⭐⭐⭐⭐        |

## 🚀 **Implementation với GraphQL Code Generator**

### **1. Setup Project**

```bash
# Cài đặt dependencies
yarn add -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-resolvers

# Tạo folder generated
mkdir -p src/generated

# Chạy codegen
yarn codegen
```

### **2. Cấu Hình Mappers**

```yaml
# codegen.yml
config:
  mappers:
    User: '../user/dto#User'
    Shop: '../shop/dto#Shop'
    Product: '../product/dto#Product'
    # Map GraphQL types với DTOs hiện có
```

### **3. Generated Types Usage**

```typescript
// Import generated types
import { User, CreateUserInput, UserResolvers } from '../generated/graphql';

// Sử dụng trong resolvers
@Resolver(() => User)
export class UserResolver implements Partial<UserResolvers> {
  @Query(() => User)
  async user(@Args('id') id: string): Promise<User> {
    // Implementation
  }
}
```

## 🔄 **Workflow với Codegen**

### **1. Development Workflow**

```bash
# 1. Edit GraphQL schema
# src/graphql/schema.graphql

# 2. Generate types
yarn codegen

# 3. Build project
yarn build

# 4. Start development
yarn start:dev
```

### **2. Watch Mode**

```bash
# Auto-regenerate khi schema thay đổi
yarn codegen:watch
```

### **3. CI/CD Integration**

```bash
# Pre-build step
yarn codegen:generate
```

## 📊 **Generated Files Structure**

```
src/
├── generated/
│   └── graphql.ts          # Generated types & resolvers
├── user/
│   ├── dto/
│   │   ├── user.dto.ts     # Custom DTOs
│   │   └── index.ts
│   └── user.resolver.ts    # Use generated types
├── shop/
│   ├── dto/
│   │   ├── shop.dto.ts
│   │   └── index.ts
│   └── shop.resolver.ts
└── graphql/
    └── schema.graphql      # Source schema
```

## 🎯 **Best Practices**

### **1. Schema Organization**

```graphql
# Tổ chức schema rõ ràng
type User {
  id: ID!
  name: String!
  email: String!
  # ... other fields
}

input CreateUserInput {
  name: String!
  email: String!
  role: UserRole
}
```

### **2. Type Mapping**

```yaml
# Map types với DTOs hiện có
mappers:
  User: '../user/dto#User'
  Shop: '../shop/dto#Shop'
```

### **3. Scalar Definitions**

```yaml
# Định nghĩa custom scalars
scalars:
  DateTime: 'Date'
  JSON: 'Record<string, any>'
```

### **4. Resolver Implementation**

```typescript
// Implement resolvers với generated types
@Resolver(() => User)
export class UserResolver implements Partial<UserResolvers> {
  @Query(() => User)
  async user(@Args('id') id: string): Promise<User> {
    // Return User type
  }
}
```

## 🚨 **Troubleshooting**

### **1. Common Issues**

```bash
# Schema not found
Error: Cannot find GraphQL schema file

# Solution: Check schema path in codegen.yml
schema: "src/graphql/schema.graphql"

# Types not generated
Error: No types generated

# Solution: Check GraphQL schema syntax
# Run: yarn codegen --verbose
```

### **2. Type Conflicts**

```typescript
// Conflict between generated và custom types
// Solution: Use mappers in codegen.yml
mappers: User: '../user/dto#User';
```

### **3. Build Errors**

```bash
# TypeScript compilation errors
# Solution: Run codegen before build
yarn codegen:generate
```

## 🎉 **Benefits Summary**

✅ **Type Safety**: Full TypeScript support
✅ **Auto-generation**: Tự động generate types
✅ **Consistency**: Nhất quán giữa schema và types
✅ **Maintainability**: Dễ maintain khi schema thay đổi
✅ **Developer Experience**: IntelliSense và error checking
✅ **Performance**: Optimized generated code

## 🚀 **Next Steps**

1. **Setup Codegen**: Cấu hình và chạy lần đầu
2. **Update Resolvers**: Sử dụng generated types
3. **Test Integration**: Verify type safety
4. **CI/CD**: Integrate vào build pipeline
5. **Documentation**: Update developer docs

---

**GraphQL Code Generator đã sẵn sàng! 🚀**
