import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class CreateCustomerInput {
  @Field()
  name: string;

  @Field()
  email: string;
}

@InputType()
export class UpdateCustomerInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;
}

@ObjectType()
export class Customer {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
