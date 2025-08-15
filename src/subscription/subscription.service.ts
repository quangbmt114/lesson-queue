import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateSubscriptionInput } from './dto';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async create(createSubscriptionInput: CreateSubscriptionInput) {
    return this.prisma.subscription.create({
      data: createSubscriptionInput,
    });
  }

  async findAll() {
    return this.prisma.subscription.findMany();
  }

  async findOne(id: string) {
    return this.prisma.subscription.findUnique({
      where: { id },
    });
  }

  async findByCustomer(customerId: string) {
    return this.prisma.subscription.findMany({
      where: { customerId },
    });
  }

  async findByShop(shopId: string) {
    return this.prisma.subscription.findMany({
      where: { shopId },
    });
  }

  async remove(id: string) {
    return this.prisma.subscription.delete({
      where: { id },
    });
  }
}
