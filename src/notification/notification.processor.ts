import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';

interface EmailJobData {
  notificationId: string;
  customerEmail: string;
  message: string;
}

@Processor('notification')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobData>) {
    const { notificationId, customerEmail, message } = job.data;

    this.logger.log(`📧 Bắt đầu xử lý job gửi email...`);
    this.logger.log(`📋 Job Details:`);
    this.logger.log(`   - Job ID: ${job.id}`);
    this.logger.log(`   - Notification ID: ${notificationId}`);
    this.logger.log(`   - Customer Email: ${customerEmail}`);
    this.logger.log(`   - Message: ${message}`);
    this.logger.log(
      `   - Attempt: ${job.attemptsMade + 1}/${job.opts.attempts || 1}`,
    );

    try {
      // Simulate email sending
      this.logger.log(`📤 Đang gửi email đến ${customerEmail}...`);

      // Random delay 1-3 seconds
      const delay = Math.random() * 2000 + 1000;
      this.logger.log(
        `⏳ Đợi ${Math.round(delay)}ms để simulate email sending...`,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));

      // Random success/failure (90% success rate)
      if (Math.random() < 0.9) {
        this.logger.log(`✅ Email đã gửi thành công đến ${customerEmail}!`);

        // Update progress
        await job.progress(100);
        this.logger.log(`📈 Job progress: 100%`);

        return {
          success: true,
          email: customerEmail,
          sentAt: new Date().toISOString(),
          message: 'Email sent successfully',
          notificationId,
        };
      } else {
        throw new Error('Simulated email service failure');
      }
    } catch (error) {
      this.logger.error(
        `❌ Lỗi khi gửi email đến ${customerEmail}: ${error.message}`,
      );

      // Update progress
      await job.progress(50);
      this.logger.log(`📈 Job progress: 50% (failed)`);

      throw error;
    }
  }

  async onCompleted(job: Job, result: any) {
    this.logger.log(`🎉 Job ${job.id} completed successfully!`);
    this.logger.log(`📊 Result:`, result);
    this.logger.log(`⏱️ Processing time: ${Date.now() - job.timestamp}ms`);
  }

  async onFailed(job: Job, error: Error) {
    this.logger.error(`💥 Job ${job.id} failed!`);
    this.logger.error(`❌ Error: ${error.message}`);
    this.logger.error(`📋 Job data:`, job.data);
    this.logger.error(
      `🔄 Attempt: ${job.attemptsMade + 1}/${job.opts.attempts || 1}`,
    );

    if (job.attemptsMade >= (job.opts.attempts || 1) - 1) {
      this.logger.error(
        `🚨 Job ${job.id} đã hết số lần thử lại, sẽ bị loại bỏ`,
      );
    }
  }

  async onProgress(job: Job, progress: number) {
    this.logger.log(`📈 Job ${job.id} progress: ${progress}%`);
  }
}
