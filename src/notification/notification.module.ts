import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { NotificationProcessor } from './notification.processor';
import { PrismaModule } from '../shared/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    // Notification Queue riêng biệt để xử lý notifications
    BullModule.registerQueue({
      name: 'notification',
      defaultJobOptions: {
        priority: 2,
        delay: 0,
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
  ],
  providers: [NotificationService, NotificationResolver, NotificationProcessor],
  exports: [NotificationService],
})
export class NotificationModule {}
