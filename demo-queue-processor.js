#!/usr/bin/env node

/**
 * Demo Queue Processor - Xử lý jobs từ queue
 * Chạy: node demo-queue-processor.js
 */

require('dotenv').config();
const Queue = require('bull');

// Khởi tạo queue với env config
const notificationQueue = new Queue('notification', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
});

console.log('🚀 Demo Queue Processor đang khởi động...');
console.log('📡 Đang lắng nghe jobs từ queue "notification"...');

// Hiển thị Redis config
console.log('\n🔧 Redis Configuration:');
console.log(`- Host: ${process.env.REDIS_HOST || 'localhost'}`);
console.log(`- Port: ${process.env.REDIS_PORT || '6379'}`);
console.log(`- Password: ${process.env.REDIS_PASSWORD ? '***' : 'none'}`);
console.log('');

// Xử lý job 'send-email'
notificationQueue.process('send-email', async (job) => {
  const {
    notificationId,
    customerEmail,
    message,
    customerName,
    productName,
    shopName,
  } = job.data;

  console.log(`\n📧 Processing job ${job.id}:`);
  console.log(`- Notification ID: ${notificationId}`);
  console.log(`- Customer: ${customerName} (${customerEmail})`);
  console.log(`- Product: ${productName}`);
  console.log(`- Shop: ${shopName}`);
  console.log(`- Message: ${message}`);

  try {
    // Simulate email sending
    console.log('📤 Đang gửi email...');

    // Random delay 1-3 seconds
    const delay = Math.random() * 2000 + 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Random success/failure (90% success rate)
    if (Math.random() < 0.9) {
      console.log('✅ Email sent successfully!');

      // Update progress
      await job.progress(100);

      return {
        success: true,
        email: customerEmail,
        sentAt: new Date().toISOString(),
        message: 'Email sent successfully',
      };
    } else {
      throw new Error('Simulated email service failure');
    }
  } catch (error) {
    console.log('❌ Failed to send email:', error.message);

    // Update progress
    await job.progress(50);

    throw error;
  }
});

// Event listeners
notificationQueue.on('completed', (job, result) => {
  console.log(`\n🎉 Job ${job.id} completed successfully!`);
  console.log('Result:', result);
});

notificationQueue.on('failed', (job, err) => {
  console.log(`\n💥 Job ${job.id} failed!`);
  console.log('Error:', err.message);
});

notificationQueue.on('progress', (job, progress) => {
  console.log(`📈 Job ${job.id} progress: ${progress}%`);
});

notificationQueue.on('stalled', (job) => {
  console.log(`⚠️ Job ${job.id} stalled`);
});

notificationQueue.on('error', (error) => {
  console.error('❌ Queue error:', error);
});

// Monitor queue status
setInterval(async () => {
  try {
    const stats = await notificationQueue.getJobCounts();
    console.log(
      `\n📊 Queue Status [${new Date().toLocaleTimeString()}]:`,
      stats,
    );
  } catch (error) {
    console.error('❌ Error getting queue stats:', error);
  }
}, 10000);

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down processor...');
  await notificationQueue.close();
  process.exit(0);
});

console.log('✅ Processor ready! Waiting for jobs...');
console.log('💡 Mở terminal khác và chạy: node demo-queue.js');
console.log('🛑 Nhấn Ctrl+C để dừng processor\n');
