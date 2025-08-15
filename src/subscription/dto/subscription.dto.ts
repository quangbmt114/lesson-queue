import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/dto/user.dto';
import { Shop } from '../../shop/dto/shop.dto';

@InputType()
export class CreateSubscriptionInput {
  @Field()
  customerId: string;

  @Field()
  shopId: string;
}

@ObjectType()
export class Subscription {
  @Field()
  id: string;

  @Field()
  customerId: string;

  @Field()
  shopId: string;

  @Field()
  createdAt: Date;

  // Relations
  @Field(() => User)
  customer: User;

  @Field(() => Shop)
  shop: Shop;
}
