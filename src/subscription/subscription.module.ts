import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionResolver } from './subscription.resolver';

@Module({
  providers: [SubscriptionResolver, SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
