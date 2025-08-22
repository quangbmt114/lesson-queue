import { Field, InputType } from '@nestjs/graphql';

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
