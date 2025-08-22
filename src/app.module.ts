import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

// Core modules
import { PrismaModule } from './shared/prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { EmailMarketingModule } from './queue/email-marketing.module';

// Feature modules
import { UserModule } from './user/user.module';
import { ShopModule } from './shop/shop.module';
import { ProductModule } from './product/product.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { NotificationModule } from './notification/notification.module';
import { HealthModule } from './health/health.module';

// Controllers & Services
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      context: ({ req }) => ({ req }),
      formatError: (error) => {
        // Remove stack trace in production
        if (process.env.NODE_ENV === 'production') {
          delete error.extensions?.stacktrace;
        }
        return error;
      },
    }),

    // Core modules
    PrismaModule,
    QueueModule,
    EmailMarketingModule,

    // Feature modules
    UserModule,
    ShopModule,
    ProductModule,
    SubscriptionModule,
    NotificationModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
