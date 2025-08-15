#!/usr/bin/env node

/**
 * Demo Auto Flow: Shop thêm sản phẩm → Tự động gửi thông báo
 * Chạy: node demo-auto-flow.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const Queue = require('bull');

// Khởi tạo Prisma và Queue
const prisma = new PrismaClient();
const notificationQueue = new Queue('notification', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
});

console.log('🎯 Demo Auto Flow: Shop Thêm Sản Phẩm → Tự Động Gửi Thông Báo');
console.log(
  '================================================================\n',
);

// Demo data
const demoProducts = [
  {
    name: 'iPhone 16 Pro Max',
    description: 'Điện thoại thông minh mới nhất từ Apple',
    price: 25000000,
  },
  {
    name: 'MacBook Air M4',
    description: 'Laptop siêu mỏng với chip M4 mới',
    price: 35000000,
  },
  {
    name: 'AirPods Pro 3',
    description: 'Tai nghe không dây với chống ồn chủ động',
    price: 8000000,
  },
];

async function findOrCreateShop() {
  console.log('🔍 Tìm shop để test...');

  // Tìm shop đầu tiên
  const shop = await prisma.shop.findFirst({
    include: {
      owner: true,
      subscriptions: {
        include: {
          customer: true,
        },
      },
    },
  });

  if (!shop) {
    console.log('❌ Không tìm thấy shop nào. Hãy chạy yarn prisma:seed trước.');
    process.exit(1);
  }

  console.log(`✅ Tìm thấy shop: ${shop.name}`);
  console.log(`👤 Owner: ${shop.owner.name} (${shop.owner.email})`);
  console.log(`👥 Subscribers: ${shop.subscriptions.length}`);

  shop.subscriptions.forEach((sub, index) => {
    console.log(
      `   ${index + 1}. ${sub.customer.name} (${sub.customer.email})`,
    );
  });

  console.log('');
  return shop;
}

async function addProductToShop(shop, productData) {
  console.log(`📦 Đang thêm sản phẩm: ${productData.name}`);

  try {
    const product = await prisma.product.create({
      data: {
        shopId: shop.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
      },
      include: {
        shop: {
          include: {
            subscriptions: {
              include: {
                customer: true,
              },
            },
          },
        },
      },
    });

    console.log(`✅ Sản phẩm đã được tạo: ${product.name} (ID: ${product.id})`);
    console.log(`💰 Giá: ${product.price.toLocaleString('vi-VN')} VND`);

    return product;
  } catch (error) {
    console.error(`❌ Lỗi khi tạo sản phẩm: ${error.message}`);
    throw error;
  }
}

async function sendNotificationsManually(shop, product) {
  console.log(
    `\n📧 Gửi thông báo thủ công cho ${shop.subscriptions.length} subscribers...`,
  );

  let successCount = 0;
  let errorCount = 0;

  for (const subscription of shop.subscriptions) {
    try {
      const message = `🎉 Sản phẩm mới: ${product.name} đã có sẵn tại ${shop.name}!`;

      // Tạo notification record
      const notification = await prisma.notification.create({
        data: {
          customerId: subscription.customer.id,
          shopId: shop.id,
          productId: product.id,
          message,
          sentAt: new Date(),
          status: 'pending',
        },
      });

      // Thêm job vào queue
      await notificationQueue.add(
        'send-email',
        {
          notificationId: notification.id,
          customerEmail: subscription.customer.email,
          message,
          customerName: subscription.customer.name,
          productName: product.name,
          shopName: shop.name,
        },
        {
          priority: 1,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      );

      console.log(
        `✅ Thông báo đã gửi cho: ${subscription.customer.name} (${subscription.customer.email})`,
      );
      successCount++;
    } catch (error) {
      console.error(
        `❌ Lỗi khi gửi thông báo cho ${subscription.customer.email}: ${error.message}`,
      );
      errorCount++;
    }
  }

  console.log(`\n📊 Kết quả gửi thông báo:`);
  console.log(`✅ Thành công: ${successCount}`);
  console.log(`❌ Lỗi: ${errorCount}`);

  return { successCount, errorCount };
}

async function monitorQueue() {
  console.log('\n👀 Monitoring Queue...');

  // Xem queue stats
  const stats = await notificationQueue.getJobCounts();
  console.log('📊 Queue Stats:', stats);

  // Xem jobs trong queue
  const waitingJobs = await notificationQueue.getWaiting();
  const activeJobs = await notificationQueue.getActive();
  const completedJobs = await notificationQueue.getCompleted();
  const failedJobs = await notificationQueue.getFailed();

  console.log(`\n📋 Jobs Status:`);
  console.log(`- Waiting: ${waitingJobs.length}`);
  console.log(`- Active: ${activeJobs.length}`);
  console.log(`- Completed: ${completedJobs.length}`);
  console.log(`- Failed: ${failedJobs.length}`);

  // Listen to job events
  notificationQueue.on('completed', (job, result) => {
    console.log(`✅ Job ${job.id} completed:`, result);
  });

  notificationQueue.on('failed', (job, err) => {
    console.log(`❌ Job ${job.id} failed:`, err.message);
  });

  // Monitor every 10 seconds
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
}

async function main() {
  try {
    // 1. Tìm shop để test
    const shop = await findOrCreateShop();

    // 2. Thêm từng sản phẩm và xem flow tự động
    for (let i = 0; i < demoProducts.length; i++) {
      const productData = demoProducts[i];

      console.log(
        `\n🔄 Bước ${i + 1}/${demoProducts.length}: Thêm sản phẩm mới`,
      );
      console.log('='.repeat(60));

      // Thêm sản phẩm
      const product = await addProductToShop(shop, productData);

      // Gửi thông báo thủ công (thay vì dựa vào service)
      await sendNotificationsManually(shop, product);

      // Đợi 3 giây trước khi thêm sản phẩm tiếp theo
      if (i < demoProducts.length - 1) {
        console.log('\n⏳ Đợi 3 giây trước khi thêm sản phẩm tiếp theo...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    console.log(
      '\n🎉 Demo hoàn thành! Tất cả sản phẩm đã được thêm và thông báo đã được gửi.',
    );
    console.log('\n💡 Để xem flow tự động thực sự:');
    console.log('1. Chạy yarn start:dev để khởi động NestJS app');
    console.log('2. Sử dụng GraphQL Playground để tạo sản phẩm mới');
    console.log('3. Xem logs để thấy flow tự động hoạt động');

    // Monitor queue
    await monitorQueue();

    console.log('\n🎯 Demo đang chạy! Nhấn Ctrl+C để dừng.');
  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down demo...');
  await notificationQueue.close();
  await prisma.$disconnect();
  process.exit(0);
});

// Run demo
main().catch(console.error);
