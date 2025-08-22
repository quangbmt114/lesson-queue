import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';

@ObjectType()
export class ShopCount {

    @Field(() => Int, {nullable:false})
    products?: number;

    @Field(() => Int, {nullable:false})
    subscriptions?: number;

    @Field(() => Int, {nullable:false})
    notifications?: number;
}
