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

    try {
      this.logger.log(
        `Processing email job ${job.id} for notification ${notificationId}`,
      );

      // Simulate email sending with delay
      await this.simulateEmailSending(customerEmail, message);

      this.logger.log(`Email sent successfully to ${customerEmail}`);

      // Mark job as completed
      await job.moveToCompleted('Email sent successfully');

      return { success: true, email: customerEmail };
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${customerEmail}: ${error.message}`,
      );

      // Mark job as failed
      await job.moveToFailed(error);

      throw error;
    }
  }

  private async simulateEmailSending(
    email: string,
    message: string,
  ): Promise<void> {
    // Simulate network delay
    const delay = Math.random() * 1000 + 500; // 500-1500ms
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Simulate occasional failures (10% failure rate)
    if (Math.random() < 0.1) {
      throw new Error('Simulated email service failure');
    }

    this.logger.debug(`Email content for ${email}: ${message}`);
  }

  // Handle job completion
  async onCompleted(job: Job, result: any) {
    this.logger.log(
      `Job ${job.id} completed successfully: ${JSON.stringify(result)}`,
    );
  }

  // Handle job failure
  async onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);

    // Log job data for debugging
    this.logger.debug(`Failed job data: ${JSON.stringify(job.data)}`);
  }

  // Handle job progress
  async onProgress(job: Job, progress: number) {
    this.logger.debug(`Job ${job.id} progress: ${progress}%`);
  }
}
