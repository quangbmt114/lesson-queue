import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/dto/user.dto';
import { Shop } from '../../shop/dto/shop.dto';
import { Product } from '../../product/dto/product.dto';

@InputType()
export class CreateNotificationInput {
  @Field()
  customerId: string;

  @Field()
  shopId: string;

  @Field({ nullable: true })
  productId?: string;

  @Field()
  message: string;

  @Field()
  sentAt: Date;

  @Field()
  status: string;
}

@ObjectType()
export class Notification {
  @Field()
  id: string;

  @Field()
  customerId: string;

  @Field()
  shopId: string;

  @Field({ nullable: true })
  productId?: string;

  @Field()
  message: string;

  @Field()
  sentAt: Date;

  @Field()
  status: string;

  // Relations
  @Field(() => User)
  customer: User;

  @Field(() => Shop)
  shop: Shop;

  @Field(() => Product, { nullable: true })
  product?: Product;
}
