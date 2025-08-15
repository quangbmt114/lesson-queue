import { Field, InputType, ObjectType, Int, Float } from '@nestjs/graphql';
import { User } from '../../user/dto/user.dto';
import { Product } from '../../product/dto/product.dto';
import { Subscription } from '../../subscription/dto/subscription.dto';
import { Notification } from '../../notification/dto/notification.dto';

@InputType()
export class CreateShopInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  ownerId: string;
}

@InputType()
export class UpdateShopInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
export class Shop {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  ownerId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => User)
  owner: User;

  @Field(() => [Product])
  products: Product[];

  @Field(() => [Subscription])
  subscriptions: Subscription[];

  @Field(() => [Notification])
  notifications: Notification[];

  // Computed fields
  @Field(() => Int)
  totalProducts: number;

  @Field(() => Int)
  totalSubscribers: number;

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Float, { nullable: true })
  averageRating?: number;
}
