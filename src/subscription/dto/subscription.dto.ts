import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { User } from 'src/@generated-dto';
import { Shop } from 'src/@generated-dto';

@InputType()
export class CreateSubscriptionInput {
  @Field()
  customerId: string;

  @Field()
  shopId: string;
}
