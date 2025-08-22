import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { EmailMarketingJob } from './email-marketing.processor';

// 🚀 Đây là SERVICE - đẩy jobs vào queue
@Injectable()
export class EmailMarketingService {
  private readonly logger = new Logger(EmailMarketingService.name);

  constructor(
    // 🔌 Inject queue 'email-marketing' từ Redis
    @InjectQueue('email-marketing') private emailMarketingQueue: Queue,
  ) {
    this.logger.log('🚀 EmailMarketingService đã khởi động!');
    this.logger.log('📡 Kết nối với queue "email-marketing"');
  }

  // 📧 Gửi email đơn lẻ
  async sendSingleEmail(emailData: EmailMarketingJob): Promise<string> {
    try {
      this.logger.log(
        `📤 Đang đẩy email vào queue: ${emailData.customerEmail}`,
      );

      // 🎯 Thêm job vào queue Redis
      const job = await this.emailMarketingQueue.add(
        'send-email', // ← Tên job (processor sẽ lắng nghe)
        emailData, // ← Dữ liệu job
        {
          // ⚙️ Cấu hình job
          priority: this.getPriorityNumber(emailData.priority), // Độ ưu tiên
          attempts: 3, // Số lần thử lại nếu thất bại
          backoff: {
            // Chiến lược thử lại
            type: 'exponential', // Tăng dần: 2s, 4s, 8s
            delay: 2000, // Bắt đầu với 2 giây
          },
          removeOnComplete: true, // Xóa job khi hoàn thành
          removeOnFail: false, // Giữ job khi thất bại để debug
          delay: this.getDelayTime(emailData.scheduledAt), // Delay nếu có
        },
      );

      this.logger.log(`✅ Email đã được đẩy vào queue thành công!`);
      this.logger.log(`🆔 Job ID: ${job.id}`);
      this.logger.log(`📊 Priority: ${emailData.priority}`);
      this.logger.log(
        `⏰ Scheduled: ${emailData.scheduledAt || 'Ngay lập tức'}`,
      );

      return job.id.toString();
    } catch (error) {
      this.logger.error(`❌ Không thể đẩy email vào queue: ${error.message}`);
      throw error;
    }
  }

  // 📧 Gửi email hàng loạt
  async sendBulkEmails(emails: EmailMarketingJob[]): Promise<string> {
    try {
      this.logger.log(`📤 Đang đẩy ${emails.length} emails vào queue`);

      // 🎯 Thêm job bulk vào queue
      const job = await this.emailMarketingQueue.add(
        'bulk-email', // ← Tên job bulk
        { emails }, // ← Dữ liệu: array emails
        {
          priority: 1, // Bulk email có độ ưu tiên cao
          attempts: 2, // Ít lần thử lại hơn
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      this.logger.log(`✅ Bulk email đã được đẩy vào queue thành công!`);
      this.logger.log(`🆔 Job ID: ${job.id}`);
      this.logger.log(`📊 Số lượng: ${emails.length} emails`);

      return job.id.toString();
    } catch (error) {
      this.logger.error(
        `❌ Không thể đẩy bulk email vào queue: ${error.message}`,
      );
      throw error;
    }
  }

  // 📧 Gửi email chào mừng
  async sendWelcomeEmail(
    customerId: string,
    customerEmail: string,
    customerName: string,
    shopId?: string,
  ): Promise<string> {
    const emailData: EmailMarketingJob = {
      type: 'WELCOME_EMAIL',
      customerId,
      customerEmail,
      customerName,
      subject: '🎉 Chào mừng bạn đến với chúng tôi!',
      message: `Xin chào ${customerName}! Chúng tôi rất vui mừng khi bạn tham gia.`,
      shopId,
      priority: 'HIGH', // Email chào mừng có độ ưu tiên cao
    };

    return this.sendSingleEmail(emailData);
  }

  // 📧 Gửi email khuyến mãi
  async sendPromotionEmail(
    customerId: string,
    customerEmail: string,
    customerName: string,
    productId: string,
    shopId: string,
    discount: number,
  ): Promise<string> {
    const emailData: EmailMarketingJob = {
      type: 'PROMOTION_EMAIL',
      customerId,
      customerEmail,
      customerName,
      subject: `🔥 Khuyến mãi đặc biệt: Giảm ${discount}%!`,
      message: `Chào ${customerName}! Bạn có muốn mua sản phẩm với giá ưu đãi không?`,
      productId,
      shopId,
      priority: 'NORMAL',
    };

    return this.sendSingleEmail(emailData);
  }

  // 📧 Gửi newsletter
  async sendNewsletter(
    customerId: string,
    customerEmail: string,
    customerName: string,
    content: string,
    shopId?: string,
  ): Promise<string> {
    const emailData: EmailMarketingJob = {
      type: 'NEWSLETTER_EMAIL',
      customerId,
      customerEmail,
      customerName,
      subject: '📰 Newsletter tuần này',
      message: content,
      shopId,
      priority: 'LOW', // Newsletter có độ ưu tiên thấp
    };

    return this.sendSingleEmail(emailData);
  }

  // 📊 Lấy thông tin queue
  async getQueueInfo(): Promise<any> {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.emailMarketingQueue.getWaiting(),
        this.emailMarketingQueue.getActive(),
        this.emailMarketingQueue.getCompleted(),
        this.emailMarketingQueue.getFailed(),
        this.emailMarketingQueue.getDelayed(),
      ]);

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total:
          waiting.length +
          active.length +
          completed.length +
          failed.length +
          delayed.length,
      };
    } catch (error) {
      this.logger.error(`❌ Không thể lấy thông tin queue: ${error.message}`);
      throw error;
    }
  }

  // 🔧 Các hàm hỗ trợ

  // Chuyển đổi priority string thành number
  private getPriorityNumber(priority: 'HIGH' | 'NORMAL' | 'LOW'): number {
    switch (priority) {
      case 'HIGH':
        return 1; // Cao nhất
      case 'NORMAL':
        return 5; // Bình thường
      case 'LOW':
        return 10; // Thấp nhất
      default:
        return 5;
    }
  }

  // Tính toán delay time nếu có scheduled
  private getDelayTime(scheduledAt?: Date): number | undefined {
    if (!scheduledAt) return undefined;

    const now = new Date();
    const delay = scheduledAt.getTime() - now.getTime();

    // Chỉ delay nếu thời gian trong tương lai
    return delay > 0 ? delay : undefined;
  }
}
