import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Logger,
} from '@nestjs/common';
import { EmailMarketingService } from './email-marketing.service';
import type { EmailMarketingJob } from './email-marketing.processor';

// 🎮 Đây là CONTROLLER - API endpoints để test queue
@Controller('email-marketing')
export class EmailMarketingController {
  constructor(private readonly emailMarketingService: EmailMarketingService) {}

  // 📧 API gửi email đơn lẻ
  @Post('send-single')
  async sendSingleEmail(
    @Body() emailData: EmailMarketingJob,
  ): Promise<{ success: boolean; jobId: string; message: string }> {
    try {
      this.logger.log(
        `📤 API: Gửi email đơn lẻ cho ${emailData.customerEmail}`,
      );

      const jobId = await this.emailMarketingService.sendSingleEmail(emailData);

      return {
        success: true,
        jobId,
        message: 'Email đã được đẩy vào queue thành công!',
      };
    } catch (error) {
      this.logger.error(`❌ API: Lỗi gửi email: ${error.message}`);
      throw error;
    }
  }

  // 📧 API gửi email chào mừng
  @Post('send-welcome')
  async sendWelcomeEmail(
    @Body()
    data: {
      customerId: string;
      customerEmail: string;
      customerName: string;
      shopId?: string;
    },
  ): Promise<{ success: boolean; jobId: string; message: string }> {
    try {
      this.logger.log(`📤 API: Gửi email chào mừng cho ${data.customerEmail}`);

      const jobId = await this.emailMarketingService.sendWelcomeEmail(
        data.customerId,
        data.customerEmail,
        data.customerName,
        data.shopId,
      );

      return {
        success: true,
        jobId,
        message: 'Email chào mừng đã được đẩy vào queue!',
      };
    } catch (error) {
      this.logger.error(`❌ API: Lỗi gửi email chào mừng: ${error.message}`);
      throw error;
    }
  }

  // 📧 API gửi email khuyến mãi
  @Post('send-promotion')
  async sendPromotionEmail(
    @Body()
    data: {
      customerId: string;
      customerEmail: string;
      customerName: string;
      productId: string;
      shopId: string;
      discount: number;
    },
  ): Promise<{ success: boolean; jobId: string; message: string }> {
    try {
      this.logger.log(`📤 API: Gửi email khuyến mãi cho ${data.customerEmail}`);

      const jobId = await this.emailMarketingService.sendPromotionEmail(
        data.customerId,
        data.customerEmail,
        data.customerName,
        data.productId,
        data.shopId,
        data.discount,
      );

      return {
        success: true,
        jobId,
        message: 'Email khuyến mãi đã được đẩy vào queue!',
      };
    } catch (error) {
      this.logger.error(`❌ API: Lỗi gửi email khuyến mãi: ${error.message}`);
      throw error;
    }
  }

  // 📧 API gửi newsletter
  @Post('send-newsletter')
  async sendNewsletter(
    @Body()
    data: {
      customerId: string;
      customerEmail: string;
      customerName: string;
      content: string;
      shopId?: string;
    },
  ): Promise<{ success: boolean; jobId: string; message: string }> {
    try {
      this.logger.log(`📤 API: Gửi newsletter cho ${data.customerEmail}`);

      const jobId = await this.emailMarketingService.sendNewsletter(
        data.customerId,
        data.customerEmail,
        data.customerName,
        data.content,
        data.shopId,
      );

      return {
        success: true,
        jobId,
        message: 'Newsletter đã được đẩy vào queue!',
      };
    } catch (error) {
      this.logger.error(`❌ API: Lỗi gửi newsletter: ${error.message}`);
      throw error;
    }
  }

  // 📧 API gửi email hàng loạt
  @Post('send-bulk')
  async sendBulkEmails(
    @Body() data: { emails: EmailMarketingJob[] },
  ): Promise<{ success: boolean; jobId: string; message: string }> {
    try {
      this.logger.log(`📤 API: Gửi ${data.emails.length} emails hàng loạt`);

      const jobId = await this.emailMarketingService.sendBulkEmails(
        data.emails,
      );

      return {
        success: true,
        jobId,
        message: `Đã đẩy ${data.emails.length} emails vào queue!`,
      };
    } catch (error) {
      this.logger.error(`❌ API: Lỗi gửi bulk emails: ${error.message}`);
      throw error;
    }
  }

  // 📊 API xem thông tin queue
  @Get('queue-info')
  async getQueueInfo(): Promise<{ success: boolean; data: any }> {
    try {
      this.logger.log(`📊 API: Lấy thông tin queue`);

      const queueInfo = await this.emailMarketingService.getQueueInfo();

      return {
        success: true,
        data: queueInfo,
      };
    } catch (error) {
      this.logger.error(`❌ API: Lỗi lấy thông tin queue: ${error.message}`);
      throw error;
    }
  }

  // 🧪 API test - gửi nhiều loại email để test
  @Post('test-all-types')
  async testAllEmailTypes(
    @Body()
    data: {
      customerId: string;
      customerEmail: string;
      customerName: string;
      shopId: string;
      productId: string;
    },
  ): Promise<{ success: boolean; results: any[] }> {
    try {
      this.logger.log(
        `🧪 API: Test tất cả loại email cho ${data.customerEmail}`,
      );

      const results: Array<{ type: string; jobId: string; status: string }> =
        [];

      // Test 1: Welcome email
      const welcomeJobId = await this.emailMarketingService.sendWelcomeEmail(
        data.customerId,
        data.customerEmail,
        data.customerName,
        data.shopId,
      );
      results.push({
        type: 'WELCOME_EMAIL',
        jobId: welcomeJobId,
        status: 'queued',
      });

      // Test 2: Promotion email
      const promotionJobId =
        await this.emailMarketingService.sendPromotionEmail(
          data.customerId,
          data.customerEmail,
          data.customerName,
          data.productId,
          data.shopId,
          20, // 20% discount
        );
      results.push({
        type: 'PROMOTION_EMAIL',
        jobId: promotionJobId,
        status: 'queued',
      });

      // Test 3: Newsletter
      const newsletterJobId = await this.emailMarketingService.sendNewsletter(
        data.customerId,
        data.customerEmail,
        data.customerName,
        'Đây là nội dung newsletter test!',
        data.shopId,
      );
      results.push({
        type: 'NEWSLETTER_EMAIL',
        jobId: newsletterJobId,
        status: 'queued',
      });

      return {
        success: true,
        results,
      };
    } catch (error) {
      this.logger.error(`❌ API: Lỗi test emails: ${error.message}`);
      throw error;
    }
  }

  // 🔧 Logger
  private readonly logger = new Logger(EmailMarketingController.name);
}
