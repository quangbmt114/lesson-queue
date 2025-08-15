import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateProductInput, UpdateProductInput } from './dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(createProductInput: CreateProductInput) {
    this.logger.log('🚀 Bắt đầu tạo sản phẩm mới...');
    this.logger.log(
      `📦 Product data: ${JSON.stringify(createProductInput, null, 2)}`,
    );

    try {
      // Tạo sản phẩm mới
      this.logger.log('📝 Đang tạo sản phẩm trong database...');

      const product = await this.prisma.product.create({
        data: createProductInput,
        include: {
          shop: {
            include: {
              subscriptions: {
                include: {
                  customer: true,
                },
              },
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
      this.logger.log(
        `   - Số subscribers: ${product.shop.subscriptions.length}`,
      );

      // Tự động gửi thông báo cho tất cả subscribers của shop
      this.logger.log('📧 Bắt đầu gửi thông báo tự động...');

      try {
        const notificationResult =
          await this.notificationService.sendProductNotification(
            product.shopId,
            product.id,
            product.name,
          );

        this.logger.log(`📧 Kết quả gửi thông báo:`);
        this.logger.log(`   - Tổng subscribers: ${notificationResult.total}`);
        this.logger.log(`   - Gửi thành công: ${notificationResult.count}`);
        this.logger.log(`   - Số lỗi: ${notificationResult.errors || 0}`);
        this.logger.log(`   - Message: ${notificationResult.message}`);

        if (notificationResult.errors && notificationResult.errors > 0) {
          this.logger.warn(
            `⚠️ Có ${notificationResult.errors} lỗi khi gửi thông báo`,
          );
        }

        this.logger.log(
          '🎉 Flow tự động hoàn thành: Sản phẩm mới → Thông báo subscribers',
        );
      } catch (notificationError) {
        this.logger.error('❌ Lỗi khi gửi thông báo:', notificationError);
        this.logger.error(
          '💡 Sản phẩm vẫn được tạo thành công, chỉ có thông báo bị lỗi',
        );
        // Không throw error để không ảnh hưởng đến việc tạo sản phẩm
      }

      return product;
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

    // Nếu tên sản phẩm thay đổi, gửi thông báo cập nhật
    if (updateProductInput.name && updateProductInput.name !== product.name) {
      this.logger.log('📧 Tên sản phẩm đã thay đổi, gửi thông báo cập nhật...');

      try {
        await this.notificationService.sendProductNotification(
          product.shopId,
          product.id,
          product.name,
        );

        this.logger.log(
          `📧 Đã gửi thông báo cập nhật cho sản phẩm: ${product.name}`,
        );
      } catch (error) {
        this.logger.error('❌ Lỗi khi gửi thông báo cập nhật:', error);
      }
    } else {
      this.logger.log(
        'ℹ️ Tên sản phẩm không thay đổi, không cần gửi thông báo',
      );
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

    // Gửi thông báo xóa sản phẩm
    this.logger.log('📧 Gửi thông báo xóa sản phẩm...');

    try {
      await this.notificationService.sendProductNotification(
        product.shopId,
        product.id,
        product.name,
      );

      this.logger.log(`📧 Đã gửi thông báo xóa sản phẩm: ${product.name}`);
    } catch (error) {
      this.logger.error('❌ Lỗi khi gửi thông báo xóa:', error);
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
      '🎉 Flow xóa sản phẩm hoàn thành: Thông báo → Xóa database',
    );

    return product;
  }
}
