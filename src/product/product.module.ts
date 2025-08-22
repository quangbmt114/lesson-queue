import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { QueueModule } from '../queue/queue.module';
import { PrismaModule } from '../shared/prisma/prisma.module';

@Module({
  imports: [QueueModule],
  providers: [ProductService, ProductResolver],
  exports: [ProductService],
})
export class ProductModule {}
