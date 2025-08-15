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
          port: configService.get('REDIS_PORT', 6380),
          password: configService.get('REDIS_PASSWORD', ''),
          // Redis optimization - compatible with Bull
          maxRetriesPerRequest: 3,
          retryDelayOnFailover: 100,
          // Connection pooling
          lazyConnect: true,
          keepAlive: 30000,
          // Performance
          connectTimeout: 10000,
          commandTimeout: 5000,
        },
        // Bull optimization
        defaultJobOptions: {
          removeOnComplete: 100, // Keep last 100 completed jobs
          removeOnFail: 50, // Keep last 50 failed jobs
          attempts: 3, // Retry failed jobs 3 times
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
        // Queue monitoring
        settings: {
          stalledInterval: 30000, // Check for stalled jobs every 30s
          maxStalledCount: 1, // Max stalled jobs before marking as failed
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'notification',
      // Queue-specific settings
      defaultJobOptions: {
        priority: 1,
        delay: 0,
        attempts: 3,
        removeOnComplete: 50,
        removeOnFail: 25,
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
