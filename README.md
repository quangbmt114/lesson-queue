<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Lesson Queue - Shop Notification System

Hệ thống message và job queue đơn giản với NestJS, GraphQL, Prisma và Bull Queue.

## Tính năng

- **User Management**: Quản lý user với role (SHOP_OWNER, CUSTOMER, ADMIN)
- **Shop Management**: Quản lý shop (chỉ user có role SHOP_OWNER mới tạo được shop)
- **Subscription System**: Hệ thống đăng ký theo dõi shop (chỉ user có role CUSTOMER mới đăng ký được)
- **Product Management**: Quản lý sản phẩm
- **Notification System**: Gửi thông báo tự động khi có sản phẩm mới
- **Message Queue**: Xử lý events bất đồng bộ
- **Job Queue**: Xử lý tác vụ gửi email

## Công nghệ sử dụng

- **NestJS**: Framework backend
- **GraphQL**: API layer
- **Prisma**: ORM và database
- **PostgreSQL**: Database chính
- **Redis + Bull**: Job queue
- **TypeScript**: Ngôn ngữ lập trình

## Database Schema

### User Model (Unified)

- **SHOP_OWNER**: Có thể tạo và quản lý shop
- **CUSTOMER**: Có thể đăng ký theo dõi shop
- **ADMIN**: Quyền quản trị hệ thống

### Shop Model

- Mỗi shop phải có owner (user với role SHOP_OWNER)
- Shop có thể có nhiều sản phẩm và subscribers

### Subscription Model

- Liên kết giữa customer (user với role CUSTOMER) và shop
- Mỗi customer chỉ đăng ký 1 lần với mỗi shop

## 🚀 Quick Start

### Option 1: Auto Setup (Khuyến nghị)

```bash
# 1. Clone project
git clone <your-repo>
cd lesson-queue

# 2. Chạy setup script
chmod +x setup-database.sh
./setup-database.sh

# 3. Khởi động ứng dụng
yarn start:dev
```

### Option 2: Manual Setup

#### 1. Cài đặt dependencies

```bash
yarn install
```

#### 2. Khởi động PostgreSQL

```bash
# Sử dụng Docker (Khuyến nghị)
docker run -d \
  --name postgres-lesson-queue \
  -e POSTGRES_DB=lesson_queue \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15

# Hoặc cài đặt PostgreSQL locally
# macOS: brew install postgresql && brew services start postgresql
# Ubuntu: sudo apt install postgresql postgresql-contrib
```

#### 3. Khởi động Redis

```bash
# Sử dụng Docker
docker run -d \
  --name redis-lesson-queue \
  -p 6379:6379 \
  redis:alpine

# Hoặc cài đặt Redis locally
# macOS: brew install redis && brew services start redis
# Ubuntu: sudo apt install redis-server
```

#### 4. Cấu hình database

Tạo file `.env` với nội dung:

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

#### 5. Khởi tạo database

```bash
# Tạo database schema
npx prisma db push

# Hoặc sử dụng migration
npx prisma migrate dev --name init
```

#### 6. Khởi động ứng dụng

```bash
# Development
yarn start:dev

# Production
yarn build
yarn start:prod
```

## 🗄️ Database Management

### Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Create migration
npx prisma migrate dev --name <migration_name>

# Reset database
npx prisma migrate reset

# Open Prisma Studio (Database GUI)
npx prisma studio

# Pull schema from database
npx prisma db pull
```

### PostgreSQL Commands

```bash
# Kết nối database
psql -U postgres -h localhost -d lesson_queue

# Xem tables
\dt

# Xem schema
\dn

# Xem data
SELECT * FROM users;
SELECT * FROM shops;
SELECT * FROM products;
SELECT * FROM subscriptions;
SELECT * FROM notifications;

# Thoát
\q
```

### Database Backup & Restore

```bash
# Backup database
pg_dump -U postgres -h localhost lesson_queue > backup.sql

# Restore database
psql -U postgres -h localhost lesson_queue < backup.sql
```

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

# Restart container
docker restart redis-lesson-queue

# Test connection
redis-cli ping
```

### Common Issues

1. **Port already in use**: Thay đổi port trong `.env` hoặc stop service đang sử dụng port
2. **Database connection failed**: Kiểm tra PostgreSQL container và credentials
3. **Prisma client not generated**: Chạy `npx prisma generate`
4. **Schema sync failed**: Kiểm tra database connection và chạy `npx prisma db push`

## 📊 Monitoring & Debugging

### Database Performance

```bash
# Xem active connections
SELECT * FROM pg_stat_activity;

# Xem slow queries
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC;

# Xem table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Queue Monitoring

```bash
# Xem Redis keys
redis-cli keys "*"

# Xem queue stats
redis-cli llen bull:notification:wait
redis-cli llen bull:notification:active
redis-cli llen bull:notification:completed
redis-cli llen bull:notification:failed
```

## 🚀 Production Deployment

### Environment Variables

```env
# Production
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public&sslmode=require"
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
NODE_ENV=production
PORT=3000
```

### Database Optimization

```sql
-- Tạo indexes cho performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_shops_owner_id ON shops(owner_id);
CREATE INDEX idx_products_shop_id ON products(shop_id);
CREATE INDEX idx_subscriptions_customer_shop ON subscriptions(customer_id, shop_id);
CREATE INDEX idx_notifications_customer_id ON notifications(customer_id);
CREATE INDEX idx_notifications_status ON notifications(status);
```

### Security

```sql
-- Tạo read-only user cho monitoring
CREATE USER monitor_user WITH PASSWORD 'monitor_password';
GRANT CONNECT ON DATABASE lesson_queue TO monitor_user;
GRANT USAGE ON SCHEMA public TO monitor_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO monitor_user;
```

## �� Tài liệu tham khảo

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [GraphQL Documentation](https://graphql.org/learn/)
- [Bull Queue Documentation](https://docs.bullmq.io/)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
