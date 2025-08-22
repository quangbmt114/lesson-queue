import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';

// 🎯 Đây là INTERFACE - định nghĩa cấu trúc dữ liệu của job
export interface EmailMarketingJob {
  // Loại email marketing
  type: 'WELCOME_EMAIL' | 'PROMOTION_EMAIL' | 'NEWSLETTER_EMAIL';

  // Thông tin khách hàng
  customerId: string;
  customerEmail: string;
  customerName: string;

  // Nội dung email
  subject: string;
  message: string;

  // Thông tin bổ sung
  shopId?: string;
  productId?: string;
  campaignId?: string;

  // Thời gian
  scheduledAt?: Date;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
}

// 🚀 Đây là PROCESSOR - xử lý jobs từ queue
@Processor('email-marketing') // ← Lắng nghe queue có tên 'email-marketing'
export class EmailMarketingProcessor {
  private readonly logger = new Logger(EmailMarketingProcessor.name);

  constructor() {
    // 🔧 Khởi tạo processor
    this.logger.log('🚀 EmailMarketingProcessor đã khởi động!');
    this.logger.log('📡 Đang lắng nghe queue "email-marketing"...');
    this.logger.log('🔍 Chờ jobs để xử lý...');
  }

  // 📧 Xử lý job type 'send-email'
  @Process('send-email') // ← Xử lý job có tên 'send-email'
  async handleSendEmail(job: Job<EmailMarketingJob>) {
    // 🎯 Bắt đầu xử lý job
    this.logger.log(`🎯 BẮT ĐẦU XỬ LÝ JOB: ${job.id}`);
    this.logger.log(`📋 Dữ liệu job:`, job.data);

    try {
      // 📊 Cập nhật tiến độ: 10% - Bắt đầu xử lý
      await job.progress(10);
      this.logger.log('📊 Tiến độ: 10% - Bắt đầu xử lý');

      // 🔍 Lấy thông tin từ job
      const { type, customerEmail, customerName, subject, message, priority } =
        job.data;

      this.logger.log(`📧 Loại email: ${type}`);
      this.logger.log(`👤 Khách hàng: ${customerName} (${customerEmail})`);
      this.logger.log(`📝 Tiêu đề: ${subject}`);
      this.logger.log(`⚡ Độ ưu tiên: ${priority}`);

      // 📊 Cập nhật tiến độ: 25% - Đã lấy thông tin
      await job.progress(25);
      this.logger.log('📊 Tiến độ: 25% - Đã lấy thông tin');

      // 🕐 Giả lập delay xử lý (trong thực tế sẽ là logic thực)
      this.logger.log('⏳ Đang xử lý...');
      await this.simulateProcessing();

      // 📊 Cập nhật tiến độ: 50% - Đã xử lý xong
      await job.progress(50);
      this.logger.log('📊 Tiến độ: 50% - Đã xử lý xong');

      // 📤 Giả lập gửi email
      this.logger.log('📤 Đang gửi email...');
      const emailResult = await this.simulateSendEmail(
        customerEmail,
        subject,
        message,
      );

      // 📊 Cập nhật tiến độ: 75% - Đã gửi email
      await job.progress(75);
      this.logger.log('📊 Tiến độ: 75% - Đã gửi email');

      // 💾 Giả lập lưu log vào database
      this.logger.log('💾 Đang lưu log...');
      await this.simulateSaveLog(job.data, emailResult);

      // 📊 Cập nhật tiến độ: 100% - Hoàn thành
      await job.progress(100);
      this.logger.log('📊 Tiến độ: 100% - Hoàn thành!');

      // ✅ Trả về kết quả thành công
      this.logger.log(`🎉 Job ${job.id} hoàn thành thành công!`);

      return {
        success: true,
        jobId: job.id,
        emailType: type,
        customerEmail,
        sentAt: new Date().toISOString(),
        result: emailResult,
        message: 'Email đã được gửi thành công!',
      };
    } catch (error) {
      // ❌ Xử lý lỗi
      this.logger.error(`💥 Job ${job.id} thất bại: ${error.message}`);

      // Cập nhật tiến độ lỗi
      await job.progress(0);

      // Ném lỗi để Bull biết job thất bại
      throw error;
    }
  }

  // 📧 Xử lý job type 'bulk-email' (gửi hàng loạt)
  @Process('bulk-email')
  async handleBulkEmail(job: Job<{ emails: EmailMarketingJob[] }>) {
    this.logger.log(`🎯 XỬ LÝ BULK EMAIL: ${job.id}`);
    this.logger.log(`📊 Số lượng email: ${job.data.emails.length}`);

    try {
      const results: Array<any> = [];
      let successCount = 0;
      let failCount = 0;

      // Xử lý từng email một
      for (let i = 0; i < job.data.emails.length; i++) {
        const emailData = job.data.emails[i];

        // Cập nhật tiến độ
        const progress = Math.round(((i + 1) / job.data.emails.length) * 100);
        await job.progress(progress);

        try {
          // Giả lập gửi email
          const result = await this.simulateSendEmail(
            emailData.customerEmail,
            emailData.subject,
            emailData.message,
          );

          results.push({ ...emailData, success: true, result });
          successCount++;
        } catch (error) {
          results.push({ ...emailData, success: false, error: error.message });
          failCount++;
        }
      }

      this.logger.log(
        `✅ Bulk email hoàn thành: ${successCount} thành công, ${failCount} thất bại`,
      );

      return {
        success: true,
        totalEmails: job.data.emails.length,
        successCount,
        failCount,
        results,
      };
    } catch (error) {
      this.logger.error(`💥 Bulk email thất bại: ${error.message}`);
      throw error;
    }
  }

  // 🔧 Các hàm hỗ trợ (trong thực tế sẽ là logic thực)

  // Giả lập xử lý
  private async simulateProcessing(): Promise<void> {
    // Trong thực tế: validate data, check rules, etc.
    const delay = Math.random() * 1000 + 500; // 0.5-1.5 giây
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Giả lập gửi email
  private async simulateSendEmail(
    email: string,
    subject: string,
    message: string,
  ): Promise<any> {
    // Trong thực tế: gọi email service (SendGrid, Mailgun, etc.)
    const delay = Math.random() * 2000 + 1000; // 1-3 giây
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Giả lập 95% thành công
    if (Math.random() < 0.95) {
      return {
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'sent',
        timestamp: new Date().toISOString(),
      };
    } else {
      throw new Error('Email service temporarily unavailable');
    }
  }

  // Giả lập lưu log
  private async simulateSaveLog(
    emailData: EmailMarketingJob,
    result: any,
  ): Promise<void> {
    // Trong thực tế: lưu vào database
    const delay = Math.random() * 500 + 200; // 0.2-0.7 giây
    await new Promise((resolve) => setTimeout(resolve, delay));

    this.logger.log(
      `💾 Đã lưu log: ${emailData.customerEmail} - ${result.status}`,
    );
  }
}
