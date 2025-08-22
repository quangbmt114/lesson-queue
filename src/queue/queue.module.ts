import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessageQueueService } from './message-queue.service';
import { MessageQueueProcessor } from './message-queue.processor';
import { QueueMonitorService } from './queue-monitor.service';
import { QueueMonitorController } from './queue-monitor.controller';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6380),
          password: configService.get('REDIS_PASSWORD', ''),
          maxRetriesPerRequest: 3,
          retryDelayOnFailover: 100,
          lazyConnect: true,
          keepAlive: 30000,
          connectTimeout: 10000,
          commandTimeout: 5000,
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
        settings: {
          stalledInterval: 30000,
          maxStalledCount: 1,
        },
      }),
      inject: [ConfigService],
    }),
    // Message Queue (Chính) - Xử lý business logic
    BullModule.registerQueue({
      name: 'message',
      defaultJobOptions: {
        priority: 1,
        delay: 0,
        attempts: 3,
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
    // Notification Queue - Xử lý gửi email
    BullModule.registerQueue({
      name: 'notification',
      defaultJobOptions: {
        priority: 2,
        delay: 0,
        attempts: 3,
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
    // Email Marketing Queue - Xử lý email marketing
    BullModule.registerQueue({
      name: 'email-marketing',
      defaultJobOptions: {
        priority: 1,
        delay: 0,
        attempts: 3,
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
  ],
  providers: [MessageQueueService, MessageQueueProcessor, QueueMonitorService],
  controllers: [QueueMonitorController],
  exports: [BullModule, MessageQueueService, BullModule],
})
export class QueueModule {}
