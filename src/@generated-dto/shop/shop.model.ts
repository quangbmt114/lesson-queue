import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { User } from '../user/user.model';
import { Product } from '../product/product.model';
import { Subscription } from '../subscription/subscription.model';
import { Notification } from '../notification/notification.model';
import { ShopCount } from './shop-count.output';

@ObjectType()
export class Shop {

    @Field(() => ID, {nullable:false})
    id!: string;

    @Field(() => String, {nullable:false})
    name!: string;

    @Field(() => String, {nullable:true})
    description!: string | null;

    @Field(() => String, {nullable:false})
    ownerId!: string;

    @Field(() => Date, {nullable:false})
    createdAt!: Date;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date;

    @Field(() => User, {nullable:false})
    owner?: User;

    @Field(() => [Product], {nullable:true})
    products?: Array<Product>;

    @Field(() => [Subscription], {nullable:true})
    subscriptions?: Array<Subscription>;

    @Field(() => [Notification], {nullable:true})
    notifications?: Array<Notification>;

    @Field(() => ShopCount, {nullable:false})
    _count?: ShopCount;
}
