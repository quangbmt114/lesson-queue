import {
  Field,
  InputType,
  Int,
  ArgsType,
  ID,
  ObjectType,
} from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Product } from 'src/@generated-dto';

@InputType()
@ArgsType()
export class CreateProductInput {
  @Field()
  shopId: string;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int)
  @IsNumber()
  price: number;
}

@InputType()
@ArgsType()
export class UpdateProductInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Number, { nullable: true })
  price?: number;
}

@ObjectType()
export class CreateProductOutput {
  @Field(() => Product)
  data: Product;
}

@ObjectType()
export class UpdateProductOutput {
  @Field(() => Product)
  data: Product;
}
