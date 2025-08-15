import { Field, InputType, ObjectType, Int, Float } from '@nestjs/graphql';
import { Shop } from '../../shop/dto/shop.dto';
import { Notification } from '../../notification/dto/notification.dto';

@InputType()
export class CreateProductInput {
  @Field()
  shopId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  price: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@InputType()
export class UpdateProductInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  price?: number;
}

@ObjectType()
export class Product {
  @Field()
  id: string;

  @Field()
  shopId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  price: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  // Relations
  @Field(() => Shop)
  shop: Shop;

  @Field(() => [Notification])
  notifications: Notification[];
}
