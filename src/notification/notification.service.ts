import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../shared/prisma/prisma.service';
import { CreateNotificationInput } from './dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('notification') private notificationQueue: Queue,
  ) {}

  async create(createNotificationInput: CreateNotificationInput) {
    try {
      const notification = await this.prisma.notification.create({
        data: createNotificationInput,
      });

      this.logger.log(`Notification created: ${notification.id}`);
      return notification;
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.prisma.notification.findMany({
        orderBy: { sentAt: 'desc' },
        take: 100, // Limit results for performance
      });
    } catch (error) {
      this.logger.error(`Failed to fetch notifications: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const notification = await this.prisma.notification.findUnique({
        where: { id },
      });

      if (!notification) {
        this.logger.warn(`Notification not found: ${id}`);
      }

      return notification;
    } catch (error) {
      this.logger.error(`Failed to fetch notification ${id}: ${error.message}`);
      throw error;
    }
  }

  async findByCustomer(customerId: string) {
    try {
      return await this.prisma.notification.findMany({
        where: { customerId },
        orderBy: { sentAt: 'desc' },
        take: 50, // Limit results for performance
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch notifications for customer ${customerId}: ${error.message}`,
      );
      throw error;
    }
  }

  async findByShop(shopId: string) {
    try {
      return await this.prisma.notification.findMany({
        where: { shopId },
        orderBy: { sentAt: 'desc' },
        take: 50, // Limit results for performance
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch notifications for shop ${shopId}: ${error.message}`,
      );
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const notification = await this.prisma.notification.delete({
        where: { id },
      });

      this.logger.log(`Notification deleted: ${id}`);
      return notification;
    } catch (error) {
      this.logger.error(
        `Failed to delete notification ${id}: ${error.message}`,
      );
      throw error;
    }
  }

  async createNotification(createNotificationInput: CreateNotificationInput) {
    return this.create(createNotificationInput);
  }

  async sendProductNotification(
    shopId: string,
    productId: string,
    productName: string,
  ) {
    try {
      this.logger.log('🚀 Bắt đầu gửi thông báo sản phẩm mới...');
      this.logger.log(`📋 Thông tin:`);
      this.logger.log(`   - Shop ID: ${shopId}`);
      this.logger.log(`   - Product ID: ${productId}`);
      this.logger.log(`   - Product Name: ${productName}`);

      // Get shop subscribers with pagination for large datasets
      this.logger.log('🔍 Tìm kiếm subscribers của shop...');

      const subscriptions = await this.prisma.subscription.findMany({
        where: { shopId },
        include: {
          customer: true,
        },
        take: 1000, // Process in batches
      });

      if (subscriptions.length === 0) {
        this.logger.warn(`⚠️ Không tìm thấy subscribers cho shop ${shopId}`);
        return {
          message: 'No subscribers found for this shop',
          count: 0,
          total: 0,
          errors: 0,
        };
      }

      this.logger.log(`✅ Tìm thấy ${subscriptions.length} subscribers`);
      subscriptions.forEach((sub, index) => {
        this.logger.log(
          `   ${index + 1}. ${sub.customer.name} (${sub.customer.email})`,
        );
      });

      // Process notifications in batches
      this.logger.log('📧 Bắt đầu xử lý thông báo theo batch...');

      const batchSize = 100;
      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < subscriptions.length; i += batchSize) {
        const batch = subscriptions.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(subscriptions.length / batchSize);

        this.logger.log(
          `🔄 Xử lý batch ${batchNumber}/${totalBatches} (${batch.length} subscribers)`,
        );

        for (const subscription of batch) {
          try {
            const message = `New product available: ${productName}`;
            this.logger.log(
              `📤 Gửi thông báo cho: ${subscription.customer.name} (${subscription.customer.email})`,
            );

            // Create notification record
            this.logger.log(`📝 Tạo notification record...`);
            const notification = await this.createNotification({
              customerId: subscription.customer.id,
              shopId,
              productId,
              message,
              sentAt: new Date(),
              status: 'pending',
            });
            this.logger.log(
              `✅ Notification record đã tạo: ${notification.id}`,
            );

            // Add job to queue with priority
            this.logger.log(`📨 Thêm job vào queue...`);
            await this.notificationQueue.add(
              'send-email',
              {
                notificationId: notification.id,
                customerEmail: subscription.customer.email,
                message,
              },
              {
                priority: 1,
                attempts: 3,
                backoff: {
                  type: 'exponential',
                  delay: 2000,
                },
              },
            );
            this.logger.log(
              `✅ Job đã thêm vào queue cho ${subscription.customer.email}`,
            );

            successCount++;
          } catch (error) {
            this.logger.error(
              `❌ Lỗi khi xử lý thông báo cho customer ${subscription.customer.id}: ${error.message}`,
            );
            errorCount++;
          }

          processedCount++;
        }

        // Log progress for large batches
        if (subscriptions.length > batchSize) {
          this.logger.log(
            `📊 Tiến độ: ${processedCount}/${subscriptions.length} notifications đã xử lý`,
          );
        }
      }

      this.logger.log('🎉 Hoàn thành gửi thông báo sản phẩm!');
      this.logger.log(`📊 Kết quả cuối cùng:`);
      this.logger.log(`   - Tổng subscribers: ${subscriptions.length}`);
      this.logger.log(`   - Xử lý thành công: ${successCount}`);
      this.logger.log(`   - Số lỗi: ${errorCount}`);
      this.logger.log(
        `   - Tỷ lệ thành công: ${((successCount / subscriptions.length) * 100).toFixed(1)}%`,
      );

      return {
        message: `Notification sent to ${successCount} subscribers`,
        count: successCount,
        total: subscriptions.length,
        errors: errorCount,
      };
    } catch (error) {
      this.logger.error(
        `❌ Lỗi nghiêm trọng khi gửi thông báo sản phẩm: ${error.message}`,
      );
      throw error;
    }
  }
}
