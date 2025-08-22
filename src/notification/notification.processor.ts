import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../shared/prisma/prisma.service';

interface NotificationJobData {
  notificationId: string;
  customerEmail: string;
  message: string;
}

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    this.logger.log('🚀 NotificationProcessor initialized!');
    this.logger.log('📡 Listening to notification queue...');
    this.logger.log('🔍 Waiting for notification jobs...');
  }

  @Process('process-notification')
  async handleProcessNotification(job: Job<NotificationJobData>) {
    const { notificationId, customerEmail, message } = job.data;

    this.logger.log(`🎯 PROCESSING NOTIFICATION: Job ${job.id}`);
    this.logger.log(`📧 Customer: ${customerEmail}`);
    this.logger.log(`📝 Message: ${message}`);
    this.logger.log(`🆔 Notification ID: ${notificationId}`);

    try {
      // Simulate processing delay
      const delay = Math.random() * 2000 + 1000; // 1-3 seconds
      this.logger.log(`⏳ Simulating processing delay: ${Math.round(delay)}ms`);

      await new Promise((resolve) => setTimeout(resolve, delay));

      // Simulate success/failure (95% success rate)
      if (Math.random() < 0.95) {
        // Success - update notification status
        await this.prisma.notification.update({
          where: { id: notificationId },
          data: { status: 'sent' },
        });

        this.logger.log(
          `✅ Notification processed successfully for: ${customerEmail}`,
        );
        this.logger.log(
          `📊 Updated notification ${notificationId} status to 'sent'`,
        );

        return {
          success: true,
          customerEmail,
          notificationId,
          status: 'sent',
          processedAt: new Date().toISOString(),
        };
      } else {
        // Simulated failure
        throw new Error('Simulated notification processing failure');
      }
    } catch (error) {
      this.logger.error(
        `❌ Failed to process notification for ${customerEmail}: ${error.message}`,
      );

      // Update notification status to failed
      try {
        await this.prisma.notification.update({
          where: { id: notificationId },
          data: { status: 'failed' },
        });

        this.logger.log(
          `📊 Updated notification ${notificationId} status to 'failed'`,
        );
      } catch (updateError) {
        this.logger.error(
          `❌ Failed to update notification status: ${updateError.message}`,
        );
      }

      throw error;
    }
  }
}
