import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';

@Processor('message')
export class MessageQueueProcessor {
  private readonly logger = new Logger(MessageQueueProcessor.name);

  constructor() {
    this.logger.log('🚀 MessageQueueProcessor initialized!');
    this.logger.log('📡 Listening to message queue...');
    this.logger.log('🔍 Waiting for jobs to process...');
  }

  @Process('message')
  async handleMessage(job: Job) {
    this.logger.log(`🎯 MESSAGE PROCESSOR ACTIVATED: Job ${job.id} received!`);
    this.logger.log(`📋 Job data:`, job.data);

    try {
      const message = job.data;
      this.logger.log(`📨 Processing message type: ${message.type}`);

      // Simple processing for now - just log and return success
      if (message.type === 'PRODUCT_CREATED') {
        this.logger.log(
          `🆕 Product created: ${message.productName} in shop: ${message.shopName}`,
        );
        this.logger.log(`📊 Product details:`, {
          id: message.productId,
          shopId: message.shopId,
          price: message.metadata?.price,
          description: message.metadata?.description,
        });
      }

      this.logger.log(`✅ Message processed successfully: ${message.type}`);

      return {
        success: true,
        messageType: message.type,
        processedBy: 'MessageQueueProcessor',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`❌ Failed to process message: ${error.message}`);
      throw error;
    }
  }
}
