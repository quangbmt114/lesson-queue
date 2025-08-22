import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { User } from '../user/user.model';
import { Shop } from '../shop/shop.model';

@ObjectType()
export class Subscription {

    @Field(() => ID, {nullable:false})
    id!: string;

    @Field(() => String, {nullable:false})
    customerId!: string;

    @Field(() => String, {nullable:false})
    shopId!: string;

    @Field(() => Date, {nullable:false})
    createdAt!: Date;

    @Field(() => User, {nullable:false})
    customer?: User;

    @Field(() => Shop, {nullable:false})
    shop?: Shop;
}
