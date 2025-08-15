import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { Notification, CreateNotificationInput } from './dto';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}

  @Query(() => [Notification])
  async notifications() {
    return this.notificationService.findAll();
  }

  @Query(() => Notification)
  async notification(@Args('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Query(() => [Notification])
  async notificationsByCustomer(@Args('customerId') customerId: string) {
    return this.notificationService.findByCustomer(customerId);
  }

  @Query(() => [Notification])
  async notificationsByShop(@Args('shopId') shopId: string) {
    return this.notificationService.findByShop(shopId);
  }

  @Mutation(() => Notification)
  async createNotification(
    @Args('createNotificationInput')
    createNotificationInput: CreateNotificationInput,
  ) {
    return this.notificationService.create(createNotificationInput);
  }

  @Mutation(() => Boolean)
  async removeNotification(@Args('id') id: string) {
    return this.notificationService.remove(id);
  }

  @Mutation(() => String)
  async sendProductNotification(
    @Args('shopId') shopId: string,
    @Args('productId') productId: string,
    @Args('message') message: string,
  ) {
    return this.notificationService.sendProductNotification(
      shopId,
      productId,
      message,
    );
  }
}
