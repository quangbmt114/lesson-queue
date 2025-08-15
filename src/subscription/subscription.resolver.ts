import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SubscriptionService } from './subscription.service';
import { Subscription, CreateSubscriptionInput } from './dto';

@Resolver(() => Subscription)
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Query(() => [Subscription])
  async subscriptions() {
    return this.subscriptionService.findAll();
  }

  @Query(() => Subscription)
  async subscription(@Args('id') id: string) {
    return this.subscriptionService.findOne(id);
  }

  @Query(() => [Subscription])
  async subscriptionsByCustomer(@Args('customerId') customerId: string) {
    return this.subscriptionService.findByCustomer(customerId);
  }

  @Query(() => [Subscription])
  async subscriptionsByShop(@Args('shopId') shopId: string) {
    return this.subscriptionService.findByShop(shopId);
  }

  @Mutation(() => Subscription)
  async createSubscription(
    @Args('createSubscriptionInput')
    createSubscriptionInput: CreateSubscriptionInput,
  ) {
    return this.subscriptionService.create(createSubscriptionInput);
  }

  @Mutation(() => Boolean)
  async removeSubscription(@Args('id') id: string) {
    return this.subscriptionService.remove(id);
  }
}
