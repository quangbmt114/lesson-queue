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
      this.logger.log(
        `Sending product notification for shop ${shopId}, product ${productId}`,
      );

      // Get shop subscribers with pagination for large datasets
      const subscriptions = await this.prisma.subscription.findMany({
        where: { shopId },
        include: {
          customer: true,
        },
        take: 1000, // Process in batches
      });

      if (subscriptions.length === 0) {
        this.logger.warn(`No subscribers found for shop ${shopId}`);
        return {
          message: 'No subscribers found for this shop',
          count: 0,
        };
      }

      // Process notifications in batches
      const batchSize = 100;
      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < subscriptions.length; i += batchSize) {
        const batch = subscriptions.slice(i, i + batchSize);

        for (const subscription of batch) {
          try {
            const message = `New product available: ${productName}`;

            // Create notification record
            const notification = await this.createNotification({
              customerId: subscription.customer.id,
              shopId,
              productId,
              message,
              sentAt: new Date(),
              status: 'pending',
            });

            // Add job to queue with priority
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

            successCount++;
          } catch (error) {
            this.logger.error(
              `Failed to process notification for customer ${subscription.customer.id}: ${error.message}`,
            );
            errorCount++;
          }

          processedCount++;
        }

        // Log progress for large batches
        if (subscriptions.length > batchSize) {
          this.logger.log(
            `Processed ${processedCount}/${subscriptions.length} notifications`,
          );
        }
      }

      this.logger.log(
        `Product notification completed: ${successCount} success, ${errorCount} errors`,
      );

      return {
        message: `Notification sent to ${successCount} subscribers`,
        count: successCount,
        total: subscriptions.length,
        errors: errorCount,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send product notification: ${error.message}`,
      );
      throw error;
    }
  }
}
