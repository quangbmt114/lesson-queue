import { Field, InputType } from '@nestjs/graphql';
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
