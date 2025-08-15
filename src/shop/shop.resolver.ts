import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ShopService } from './shop.service';
import { Shop, CreateShopInput, UpdateShopInput } from './dto';

@Resolver(() => Shop)
export class ShopResolver {
  constructor(private readonly shopService: ShopService) {}

  @Query(() => [Shop])
  async shops() {
    return this.shopService.findAll();
  }

  @Query(() => Shop)
  async shop(@Args('id') id: string) {
    return this.shopService.findOne(id);
  }

  @Query(() => [Shop])
  async shopsByOwner(@Args('ownerId') ownerId: string) {
    return this.shopService.findByOwner(ownerId);
  }

  @Mutation(() => Shop)
  async createShop(@Args('createShopInput') createShopInput: CreateShopInput) {
    return this.shopService.create(createShopInput);
  }

  @Mutation(() => Shop)
  async updateShop(
    @Args('id') id: string,
    @Args('updateShopInput') updateShopInput: UpdateShopInput,
  ) {
    return this.shopService.update(id, updateShopInput);
  }

  @Mutation(() => Boolean)
  async removeShop(@Args('id') id: string) {
    return this.shopService.remove(id);
  }
}
