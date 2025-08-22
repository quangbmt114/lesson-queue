import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ProductService } from './product.service';
import {
  CreateProductInput,
  CreateProductOutput,
  UpdateProductInput,
  UpdateProductOutput,
} from './dto/product.dto';
import { Product } from '../@generated-dto';

@Resolver('Product')
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

  @Mutation(() => CreateProductOutput)
  async createProduct(@Args('input') input: CreateProductInput) {
    return await this.productService.create(input);
  }

  @Mutation(() => UpdateProductOutput)
  async updateProduct(
    @Args('id') id: string,
    @Args('input') input: UpdateProductInput,
  ) {
    return this.productService.update(id, input);
  }

  @Mutation(() => Boolean)
  async removeProduct(@Args('id') id: string) {
    return this.productService.remove(id);
  }
}
