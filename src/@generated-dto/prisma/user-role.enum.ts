import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
    SHOP_OWNER = "SHOP_OWNER",
    CUSTOMER = "CUSTOMER",
    ADMIN = "ADMIN"
}


registerEnumType(UserRole, { name: 'UserRole', description: undefined })
