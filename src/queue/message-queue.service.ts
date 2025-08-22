import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../shared/prisma/prisma.service';

export interface ProductMessage {
  type: 'PRODUCT_CREATED' | 'PRODUCT_UPDATED' | 'PRODUCT_DELETED';
  shopId: string;
  productId: string;
  productName: string;
  shopName: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface NotificationMessage {
  type: 'SEND_NOTIFICATION';
  notificationId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  message: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  timestamp: Date;
}

export interface SubscriptionMessage {
  type: 'SUBSCRIPTION_CREATED' | 'SUBSCRIPTION_CANCELLED';
  customerId: string;
  shopId: string;
  customerEmail: string;
  shopName: string;
  timestamp: Date;
}

export type QueueMessage =
  | ProductMessage
  | NotificationMessage
  | SubscriptionMessage;

@Injectable()
export class MessageQueueService {
  private readonly logger = new Logger(MessageQueueService.name);

  constructor(
    @InjectQueue('message') private messageQueue: Queue,
    @InjectQueue('notification') private notificationQueue: Queue,
    private prisma: PrismaService,
  ) {}

  /**
   * Gửi message vào message queue (chính)
   */
  async publishMessage(message: QueueMessage): Promise<void> {
    try {
      this.logger.log(
        `📤 Publishing message to message queue: ${message.type}`,
      );

      // Thêm message vào message queue với priority
      const priority = await this.getMessagePriority(message);

      await this.messageQueue.add('message', message, {
        priority,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: true,
      });

      this.logger.log(
        `✅ Message published successfully with priority: ${priority}`,
      );
    } catch (error) {
      this.logger.error(`❌ Failed to publish message: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gửi product message khi có sản phẩm mới
   */
  async publishProductMessage(
    type: ProductMessage['type'],
    shopId: string,
    productId: string,
    productName: string,
    shopName: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const message: ProductMessage = {
      type,
      shopId,
      productId,
      productName,
      shopName,
      timestamp: new Date(),
      metadata,
    };

    await this.publishMessage(message);
  }

  /**
   * Gửi notification message để xử lý gửi email
   */
  async publishNotificationMessage(
    notificationId: string,
    customerId: string,
    customerEmail: string,
    customerName: string,
    message: string,
    priority: 'HIGH' | 'NORMAL' | 'LOW' = 'NORMAL',
  ): Promise<void> {
    try {
      this.logger.log(
        `📧 Publishing notification message to notification queue: ${notificationId}`,
      );
      this.logger.log(`📋 Notification details:`, {
        notificationId,
        customerEmail,
        message,
        priority,
      });

      // Gửi trực tiếp vào notification queue thay vì message queue
      await this.notificationQueue.add(
        'process-notification',
        {
          notificationId,
          customerEmail,
          message,
        },
        {
          priority: priority === 'HIGH' ? 1 : priority === 'NORMAL' ? 2 : 3,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: 50,
          removeOnFail: 25,
        },
      );

      this.logger.log(
        `✅ Notification message published to notification queue successfully`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to publish notification message: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Gửi subscription message
   */
  async publishSubscriptionMessage(
    type: SubscriptionMessage['type'],
    customerId: string,
    shopId: string,
    customerEmail: string,
    shopName: string,
  ): Promise<void> {
    const message: SubscriptionMessage = {
      type,
      customerId,
      shopId,
      customerEmail,
      shopName,
      timestamp: new Date(),
    };

    await this.publishMessage(message);
  }

  /**
   * Xác định priority của message
   */
  private async getMessagePriority(message: QueueMessage): Promise<number> {
    switch (message.type) {
      case 'PRODUCT_CREATED':
        return 1; // Highest priority
      case 'SEND_NOTIFICATION':
        const notificationMsg = message as NotificationMessage;

        switch (notificationMsg.priority) {
          case 'HIGH':
            return 2;
          case 'NORMAL':
            return 3;
          case 'LOW':
            return 4;
        }
        break;
      case 'PRODUCT_UPDATED':
        return 5;
      case 'SUBSCRIPTION_CREATED':
        return 6;
      case 'PRODUCT_DELETED':
        return 7;
      case 'SUBSCRIPTION_CANCELLED':
        return 8;
      default:
        return 9; // Lowest priority
    }
    return 5; // Default priority
  }

  /**
   * Lấy thống kê message queue
   */
  async getMessageQueueStats() {
    try {
      const stats = await this.messageQueue.getJobCounts();
      this.logger.log(`📊 Message Queue Stats:`, stats);
      return stats;
    } catch (error) {
      this.logger.error(
        `❌ Failed to get message queue stats: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Lấy thống kê notification queue
   */
  async getNotificationQueueStats() {
    try {
      const stats = await this.notificationQueue.getJobCounts();
      this.logger.log(`📊 Notification Queue Stats:`, stats);
      return stats;
    } catch (error) {
      this.logger.error(
        `❌ Failed to get notification queue stats: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Cleanup old messages
   */
  async cleanupOldMessages(olderThanHours: number = 24): Promise<void> {
    try {
      this.logger.log(
        `🧹 Cleaning up messages older than ${olderThanHours} hours...`,
      );

      const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;

      // Cleanup completed jobs
      const completedJobs = await this.messageQueue.getJobs(
        ['completed'],
        0,
        -1,
        true,
      );
      const oldCompletedJobs = completedJobs.filter(
        (job) => job.finishedOn && job.finishedOn < cutoffTime,
      );

      for (const job of oldCompletedJobs) {
        await job.remove();
      }

      this.logger.log(
        `✅ Cleaned up ${oldCompletedJobs.length} old completed messages`,
      );
    } catch (error) {
      this.logger.error(`❌ Failed to cleanup old messages: ${error.message}`);
    }
  }
}
