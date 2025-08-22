import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { MessageQueueService } from '../queue/message-queue.service';
import { CreateProductInput, UpdateProductInput } from './dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private prisma: PrismaService,
    private messageQueueService: MessageQueueService,
  ) {}

  async create(input: CreateProductInput) {
    this.logger.log('🚀 Bắt đầu tạo sản phẩm mới...');
    this.logger.log(`📦 Product data: ${JSON.stringify(input, null, 2)}`);

    try {
      // Tạo sản phẩm mới
      this.logger.log('📝 Đang tạo sản phẩm trong database...');

      const product = await this.prisma.product.create({
        data: {
          ...input,
          price: input.price || 0,
        },
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      this.logger.log(`✅ Sản phẩm mới được tạo thành công!`);
      this.logger.log(`   - ID: ${product.id}`);
      this.logger.log(`   - Tên: ${product.name}`);
      this.logger.log(`   - Giá: ${product.price}`);
      this.logger.log(
        `   - Shop: ${product.shop.name} (ID: ${product.shop.id})`,
      );

      // Gửi message vào message queue (chính) thay vì gọi trực tiếp
      this.logger.log('📤 Gửi PRODUCT_CREATED message vào message queue...');

      try {
        await this.messageQueueService.publishProductMessage(
          'PRODUCT_CREATED',
          product.shopId,
          product.id,
          product.name,
          product.shop.name,
          {
            price: product.price,
            description: product.description,
            createdAt: product.createdAt,
          },
        );

        this.logger.log(
          '✅ PRODUCT_CREATED message đã được gửi vào message queue',
        );
        this.logger.log(
          '🎉 Flow tự động: Sản phẩm mới → Message Queue → Xử lý → Thông báo subscribers',
        );
      } catch (messageError) {
        this.logger.error('❌ Lỗi khi gửi message vào queue:', messageError);
        this.logger.error(
          '💡 Sản phẩm vẫn được tạo thành côprocess-messageng, chỉ có message queue bị lỗi',
        );
        // Không throw error để không ảnh hưởng đến việc tạo sản phẩm
      }

      return {
        data: product,
      };
    } catch (error) {
      this.logger.error('❌ Lỗi khi tạo sản phẩm:', error);
      this.logger.error('💡 Flow bị gián đoạn tại bước tạo sản phẩm');
      throw error;
    }
  }

  async findAll() {
    this.logger.log('🔍 Lấy danh sách tất cả sản phẩm...');

    const products = await this.prisma.product.findMany({
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    this.logger.log(`✅ Đã lấy ${products.length} sản phẩm`);
    return products;
  }

  async findOne(id: string) {
    this.logger.log(`🔍 Tìm sản phẩm với ID: ${id}`);

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (product) {
      this.logger.log(`✅ Tìm thấy sản phẩm: ${product.name}`);
    } else {
      this.logger.warn(`⚠️ Không tìm thấy sản phẩm với ID: ${id}`);
    }

    return product;
  }

  async findByShop(shopId: string) {
    this.logger.log(`🔍 Tìm sản phẩm của shop ID: ${shopId}`);

    const products = await this.prisma.product.findMany({
      where: { shopId },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    this.logger.log(`✅ Tìm thấy ${products.length} sản phẩm của shop`);
    return products;
  }

  async update(id: string, updateProductInput: UpdateProductInput) {
    this.logger.log(`🔄 Bắt đầu cập nhật sản phẩm ID: ${id}`);
    this.logger.log(
      `📝 Update data: ${JSON.stringify(updateProductInput, null, 2)}`,
    );

    const product = await this.prisma.product.update({
      where: { id },
      data: updateProductInput,
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    this.logger.log(`✅ Sản phẩm đã được cập nhật thành công!`);
    this.logger.log(`   - ID: ${product.id}`);
    this.logger.log(`   - Tên mới: ${product.name}`);
    this.logger.log(`   - Shop: ${product.shop.name}`);

    // Nếu tên sản phẩm thay đổi, gửi message cập nhật
    if (updateProductInput.name && updateProductInput.name !== product.name) {
      this.logger.log(
        '📤 Tên sản phẩm đã thay đổi, gửi PRODUCT_UPDATED message...',
      );

      try {
        await this.messageQueueService.publishProductMessage(
          'PRODUCT_UPDATED',
          product.shopId,
          product.id,
          product.name,
          product.shop.name,
          {
            oldName: updateProductInput.name,
            updatedAt: product.updatedAt,
          },
        );

        this.logger.log(
          `✅ PRODUCT_UPDATED message đã được gửi vào message queue`,
        );
      } catch (error) {
        this.logger.error('❌ Lỗi khi gửi message cập nhật:', error);
      }
    } else {
      this.logger.log('ℹ️ Tên sản phẩm không thay đổi, không cần gửi message');
    }

    return product;
  }

  async remove(id: string) {
    this.logger.log(`🗑️ Bắt đầu xóa sản phẩm ID: ${id}`);

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product) {
      this.logger.error(`❌ Không tìm thấy sản phẩm để xóa với ID: ${id}`);
      throw new Error('Sản phẩm không tồn tại');
    }

    this.logger.log(`📦 Thông tin sản phẩm sẽ xóa:`);
    this.logger.log(`   - ID: ${product.id}`);
    this.logger.log(`   - Tên: ${product.name}`);
    this.logger.log(`   - Shop: ${product.shop.name}`);

    // Gửi message xóa sản phẩm trước khi xóa
    this.logger.log('📤 Gửi PRODUCT_DELETED message vào message queue...');

    try {
      await this.messageQueueService.publishProductMessage(
        'PRODUCT_DELETED',
        product.shopId,
        product.id,
        product.name,
        product.shop.name,
        {
          deletedAt: new Date(),
        },
      );

      this.logger.log(
        `✅ PRODUCT_DELETED message đã được gửi vào message queue`,
      );
    } catch (error) {
      this.logger.error('❌ Lỗi khi gửi message xóa:', error);
    }

    // Xóa sản phẩm
    this.logger.log('🗑️ Đang xóa sản phẩm khỏi database...');

    await this.prisma.product.delete({
      where: { id },
    });

    this.logger.log(
      `✅ Sản phẩm đã được xóa thành công: ${product.name} (ID: ${product.id})`,
    );
    this.logger.log(
      '🎉 Flow xóa sản phẩm hoàn thành: Message Queue → Thông báo → Xóa database',
    );

    return product;
  }
}
