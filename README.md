# 🚀 Lesson Queue - NestJS GraphQL Queue System

A modern, production-ready message and job queue system built with NestJS, GraphQL, Prisma, and Redis.

## ✨ Features

- **🔄 Message & Job Queues** - Bull queue with Redis backend
- **📊 GraphQL API** - Auto-generated schema from decorators
- **🗄️ Database** - PostgreSQL with Prisma ORM
- **⚡ Performance** - Optimized with connection pooling and caching
- **🛡️ Security** - Validation, CORS, and security headers
- **🏥 Health Checks** - Comprehensive system monitoring
- **📝 Logging** - Structured logging with NestJS Logger

## 🏗️ Architecture

```
src/
├── user/          # User management with roles
├── shop/          # Shop management
├── product/       # Product catalog
├── subscription/  # Shop subscriptions
├── notification/  # Notification system with queue
├── queue/         # Bull queue configuration
├── shared/        # Shared services (Prisma, DTOs)
└── health/        # Health check endpoints
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Yarn package manager

### 1. Clone & Install

```bash
git clone <repository-url>
cd lesson-queue
yarn install
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Update values in .env file
```

### 3. Start Services

```bash
# Start PostgreSQL & Redis
docker-compose up -d

# Generate Prisma client
yarn db:generate

# Push database schema
yarn db:push

# Seed database (optional)
yarn seed
```

### 4. Run Application

```bash
# Development mode
yarn start:dev

# Production build
yarn build
yarn start:prod
```

## 🌐 API Endpoints

- **GraphQL Playground**: `http://localhost:3000/graphql`
- **Health Check**: `http://localhost:3000/api/v1/health`
- **API Base**: `http://localhost:3000/api/v1`

## 📊 Queue System

### Notification Queue

```typescript
// Add job to queue
await notificationQueue.add('send-email', {
  notificationId: 'uuid',
  customerEmail: 'user@example.com',
  message: 'New product available!',
});
```

### Queue Monitoring

- **Health Check**: `/api/v1/health/queue`
- **Redis Status**: `/api/v1/health/redis`
- **Database Status**: `/api/v1/health/database`

## 🔧 Configuration

### Environment Variables

| Variable       | Default            | Description             |
| -------------- | ------------------ | ----------------------- |
| `NODE_ENV`     | `development`      | Application environment |
| `PORT`         | `3000`             | Server port             |
| `DATABASE_URL` | `postgresql://...` | Database connection     |
| `REDIS_HOST`   | `localhost`        | Redis host              |
| `REDIS_PORT`   | `6380`             | Redis port              |

### Queue Settings

- **Job Retry**: 3 attempts with exponential backoff
- **Job Cleanup**: Keep last 100 completed, 50 failed
- **Stalled Jobs**: Check every 30s, max 1 stalled

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## 📦 Available Scripts

```bash
yarn start:dev      # Development with hot reload
yarn build          # Build for production
yarn start:prod     # Start production server
yarn seed           # Seed database
yarn db:push        # Push database schema
yarn db:studio      # Open Prisma Studio
```

## 🏗️ Development

### Adding New Features

1. **Create DTOs** in `src/{module}/dto/`
2. **Add Service** methods in `src/{module}/{module}.service.ts`
3. **Create Resolver** in `src/{module}/{module}.resolver.ts`
4. **Update Module** in `src/{module}/{module}.module.ts`

### GraphQL Schema

Schema is auto-generated from DTO decorators. No manual schema files needed.

## 🚀 Production Deployment

### Docker

```bash
# Build image
docker build -t lesson-queue .

# Run container
docker run -p 3000:3000 lesson-queue
```

### Environment

- Set `NODE_ENV=production`
- Configure production database and Redis
- Set secure JWT secrets
- Enable CORS restrictions

## 📚 Tech Stack

- **Backend**: NestJS, TypeScript
- **API**: GraphQL with Apollo Server
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: Bull with Redis
- **Validation**: class-validator, class-transformer
- **Testing**: Jest, Supertest

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue
- Check documentation
- Review code examples

---

**Built with ❤️ using NestJS and modern web technologies**
