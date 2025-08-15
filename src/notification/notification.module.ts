import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { NotificationProcessor } from './notification.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notification',
    }),
  ],
  providers: [NotificationResolver, NotificationService, NotificationProcessor],
  exports: [NotificationService],
})
export class NotificationModule {}
