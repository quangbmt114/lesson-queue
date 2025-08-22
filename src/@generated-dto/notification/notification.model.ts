import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { User } from '../user/user.model';
import { Shop } from '../shop/shop.model';
import { Product } from '../product/product.model';

@ObjectType()
export class Notification {

    @Field(() => ID, {nullable:false})
    id!: string;

    @Field(() => String, {nullable:false})
    customerId!: string;

    @Field(() => String, {nullable:false})
    shopId!: string;

    @Field(() => String, {nullable:true})
    productId!: string | null;

    @Field(() => String, {nullable:false})
    message!: string;

    @Field(() => Date, {nullable:false})
    sentAt!: Date;

    @Field(() => String, {defaultValue:'pending',nullable:false})
    status!: string;

    @Field(() => User, {nullable:false})
    customer?: User;

    @Field(() => Shop, {nullable:false})
    shop?: Shop;

    @Field(() => Product, {nullable:true})
    product?: Product | null;
}
