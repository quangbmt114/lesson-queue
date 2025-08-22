import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { Int } from '@nestjs/graphql';
import { Shop } from '../shop/shop.model';
import { Notification } from '../notification/notification.model';
import { ProductCount } from './product-count.output';

@ObjectType()
export class Product {

    @Field(() => ID, {nullable:false})
    id!: string;

    @Field(() => String, {nullable:false})
    shopId!: string;

    @Field(() => String, {nullable:false})
    name!: string;

    @Field(() => String, {nullable:true})
    description!: string | null;

    @Field(() => Int, {defaultValue:0,nullable:true})
    price!: number | null;

    @Field(() => Date, {nullable:false})
    createdAt!: Date;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date;

    @Field(() => Shop, {nullable:false})
    shop?: Shop;

    @Field(() => [Notification], {nullable:true})
    notifications?: Array<Notification>;

    @Field(() => ProductCount, {nullable:false})
    _count?: ProductCount;
}
