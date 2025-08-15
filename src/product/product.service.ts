import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateProductInput, UpdateProductInput } from './dto';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(createProductInput: CreateProductInput) {
    const product = await this.prisma.product.create({
      data: createProductInput,
      include: {
        shop: true,
      },
    });

    // Send notification to shop subscribers
    await this.notificationService.sendProductNotification(
      product.shopId,
      product.id,
      product.name,
    );

    return product;
  }

  async findAll() {
    return this.prisma.product.findMany();
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
    });
  }

  async findByShop(shopId: string) {
    return this.prisma.product.findMany({
      where: { shopId },
    });
  }

  async update(id: string, updateProductInput: UpdateProductInput) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductInput,
    });
  }

  async remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
