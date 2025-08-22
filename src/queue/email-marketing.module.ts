import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailMarketingProcessor } from './email-marketing.processor';
import { EmailMarketingService } from './email-marketing.service';
import { EmailMarketingController } from './email-marketing.controller';

// 🧩 Đây là MODULE - kết nối tất cả thành phần lại với nhau
@Module({
  imports: [
    // 🔌 Kết nối với Redis queue
    BullModule.registerQueue({
      name: 'email-marketing', // ← Tên queue trong Redis
    }),
  ],
  controllers: [
    // 🎮 Controller để test API
    EmailMarketingController,
  ],
  providers: [
    // 🚀 Service để đẩy jobs vào queue
    EmailMarketingService,
    // 🔧 Processor để xử lý jobs từ queue
    EmailMarketingProcessor,
  ],
  exports: [
    // 📤 Export service để các module khác có thể sử dụng
    EmailMarketingService,
  ],
})
export class EmailMarketingModule {
  constructor() {
    console.log('🚀 EmailMarketingModule đã được khởi tạo!');
    console.log('📡 Kết nối với queue "email-marketing"');
    console.log('🔧 Sẵn sàng xử lý email marketing jobs!');
  }
}
