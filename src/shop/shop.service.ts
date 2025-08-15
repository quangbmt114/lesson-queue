import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateShopInput, UpdateShopInput } from './dto';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  async create(createShopInput: CreateShopInput) {
    return this.prisma.shop.create({
      data: createShopInput,
    });
  }

  async findAll() {
    return this.prisma.shop.findMany();
  }

  async findOne(id: string) {
    return this.prisma.shop.findUnique({
      where: { id },
    });
  }

  async findByOwner(ownerId: string) {
    return this.prisma.shop.findMany({
      where: { ownerId },
    });
  }

  async update(id: string, updateShopInput: UpdateShopInput) {
    return this.prisma.shop.update({
      where: { id },
      data: updateShopInput,
    });
  }

  async remove(id: string) {
    return this.prisma.shop.delete({
      where: { id },
    });
  }
}
