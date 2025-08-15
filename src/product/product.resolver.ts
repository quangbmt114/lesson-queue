import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { Product, CreateProductInput, UpdateProductInput } from './dto';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @Query(() => [Product])
  async products() {
    return this.productService.findAll();
  }

  @Query(() => Product)
  async product(@Args('id') id: string) {
    return this.productService.findOne(id);
  }

  @Query(() => [Product])
  async productsByShop(@Args('shopId') shopId: string) {
    return this.productService.findByShop(shopId);
  }

  @Mutation(() => Product)
  async createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
  ) {
    return this.productService.create(createProductInput);
  }

  @Mutation(() => Product)
  async updateProduct(
    @Args('id') id: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ) {
    return this.productService.update(id, updateProductInput);
  }

  @Mutation(() => Boolean)
  async removeProduct(@Args('id') id: string) {
    return this.productService.remove(id);
  }
}
