import {
  PrismaSelect as OriPrismaSelect,
  PrismaSelectOptions,
} from '@paljs/plugins';
import { Prisma } from '@prisma/client';
import { GraphQLResolveInfo } from 'graphql';
import get from 'lodash/get';
import find from 'lodash/find';

export class PrismaSelect<
  ModelName extends string = '',
  ModelsObject extends Record<ModelName, Record<string, any>> = Record<
    ModelName,
    Record<string, any>
  >,
> {
  $prismaSelect: OriPrismaSelect;

  constructor(
    info: GraphQLResolveInfo,
    options?: PrismaSelectOptions<string, any>,
  ) {
    this.$prismaSelect = new OriPrismaSelect(info, {
      dmmf: [Prisma.dmmf as any],
    });
  }

  valueOf(
    field: string,
    filterBy?: Prisma.ModelName,
    mergeObject?: any,
  ): {
    select: Record<string, any>;
  } {
    const $rawSelect = this.$prismaSelect.valueOf(field, filterBy, mergeObject);
    return $rawSelect;
  }
}
