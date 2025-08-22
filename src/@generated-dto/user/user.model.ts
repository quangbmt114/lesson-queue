import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { UserRole } from '../prisma/user-role.enum';
import { Shop } from '../shop/shop.model';
import { Subscription } from '../subscription/subscription.model';
import { Notification } from '../notification/notification.model';
import { UserCount } from './user-count.output';

@ObjectType()
export class User {

    @Field(() => ID, {nullable:false})
    id!: string;

    @Field(() => String, {nullable:false})
    name!: string;

    @Field(() => String, {nullable:false})
    email!: string;

    @Field(() => UserRole, {defaultValue:'CUSTOMER',nullable:false})
    role!: `${UserRole}`;

    @Field(() => Date, {nullable:false})
    createdAt!: Date;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date;

    @Field(() => [Shop], {nullable:true})
    ownedShops?: Array<Shop>;

    @Field(() => [Subscription], {nullable:true})
    subscriptions?: Array<Subscription>;

    @Field(() => [Notification], {nullable:true})
    notifications?: Array<Notification>;

    @Field(() => UserCount, {nullable:false})
    _count?: UserCount;
}
