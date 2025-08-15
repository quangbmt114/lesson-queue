#!/usr/bin/env node

/**
 * Demo Message Queue - Test chức năng queue
 * Chạy: node demo-queue.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const Queue = require('bull');

// Khởi tạo Prisma và Queue với env config
const prisma = new PrismaClient();
const notificationQueue = new Queue('notification', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
  },
});

// Demo data
const demoData = {
  shop: {
    name: 'Demo Shop',
    description: 'Shop để test message queue',
  },
  product: {
    name: 'Sản phẩm demo',
    description: 'Sản phẩm để test notification',
    price: 100000,
  },
  customers: [
    { name: 'Khách hàng 1', email: 'customer1@demo.com' },
    { name: 'Khách hàng 2', email: 'customer2@demo.com' },
    { name: 'Khách hàng 3', email: 'customer3@demo.com' },
  ],
};

async function createDemoData() {
  console.log('🚀 Tạo demo data...');

  try {
    // Kiểm tra và tạo shop owner
    let shopOwner = await prisma.user.findUnique({
      where: { email: 'shopowner@demo.com' },
    });

    if (!shopOwner) {
      shopOwner = await prisma.user.create({
        data: {
          name: 'Chủ shop demo',
          email: 'shopowner@demo.com',
          role: 'SHOP_OWNER',
        },
      });
      console.log('✅ Tạo shop owner:', shopOwner.email);
    } else {
      console.log('ℹ️ Shop owner đã tồn tại:', shopOwner.email);
    }

    // Kiểm tra và tạo shop
    let shop = await prisma.shop.findFirst({
      where: { ownerId: shopOwner.id },
    });

    if (!shop) {
      shop = await prisma.shop.create({
        data: {
          name: demoData.shop.name,
          description: demoData.shop.description,
          ownerId: shopOwner.id,
        },
      });
      console.log('✅ Tạo shop:', shop.name);
    } else {
      console.log('ℹ️ Shop đã tồn tại:', shop.name);
    }

    // Tạo customers
    const customers = [];
    for (const customerData of demoData.customers) {
      let customer = await prisma.user.findUnique({
        where: { email: customerData.email },
      });

      if (!customer) {
        customer = await prisma.user.create({
          data: {
            name: customerData.name,
            email: customerData.email,
            role: 'CUSTOMER',
          },
        });
        console.log('✅ Tạo customer:', customer.email);
      } else {
        console.log('ℹ️ Customer đã tồn tại:', customer.email);
      }
      customers.push(customer);
    }

    // Tạo subscriptions
    for (const customer of customers) {
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          customerId: customer.id,
          shopId: shop.id,
        },
      });

      if (!existingSubscription) {
        await prisma.subscription.create({
          data: {
            customerId: customer.id,
            shopId: shop.id,
          },
        });
        console.log('✅ Tạo subscription cho:', customer.email);
      } else {
        console.log('ℹ️ Subscription đã tồn tại cho:', customer.email);
      }
    }

    // Tạo product
    let product = await prisma.product.findFirst({
      where: {
        shopId: shop.id,
        name: demoData.product.name,
      },
    });

    if (!product) {
      product = await prisma.product.create({
        data: {
          shopId: shop.id,
          name: demoData.product.name,
          description: demoData.product.description,
          price: demoData.product.price,
        },
      });
      console.log('✅ Tạo product:', product.name);
    } else {
      console.log('ℹ️ Product đã tồn tại:', product.name);
    }

    // Tạo notifications
    for (const customer of customers) {
      const existingNotification = await prisma.notification.findFirst({
        where: {
          customerId: customer.id,
          productId: product.id,
        },
      });

      if (!existingNotification) {
        await prisma.notification.create({
          data: {
            customerId: customer.id,
            shopId: shop.id,
            productId: product.id,
            message: `Sản phẩm mới: ${product.name}`,
            status: 'pending',
          },
        });
        console.log('✅ Tạo notification cho:', customer.email);
      } else {
        console.log('ℹ️ Notification đã tồn tại cho:', customer.email);
      }
    }

    console.log('\n🎉 Demo data đã được tạo/thay thế thành công!');
    return { shopOwner, shop, customers, product };
  } catch (error) {
    console.error('❌ Lỗi khi tạo demo data:', error);
    throw error;
  }
}

async function testMessageQueue() {
  console.log('\n📨 Test Message Queue...');

  try {
    // Lấy notifications pending
    const pendingNotifications = await prisma.notification.findMany({
      where: { status: 'pending' },
      include: {
        customer: true,
        shop: true,
        product: true,
      },
    });

    console.log(
      `📊 Tìm thấy ${pendingNotifications.length} notifications pending`,
    );

    // Thêm jobs vào queue
    for (const notification of pendingNotifications) {
      const job = await notificationQueue.add(
        'send-email',
        {
          notificationId: notification.id,
          customerEmail: notification.customer.email,
          message: notification.message,
          customerName: notification.customer.name,
          productName: notification.product.name,
          shopName: notification.shop.name,
        },
        {
          priority: 1,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      );

      console.log(
        `📤 Thêm job ${job.id} vào queue cho ${notification.customer.email}`,
      );
    }

    // Xem queue stats
    const queueStats = await notificationQueue.getJobCounts();
    console.log('\n📊 Queue Stats:', queueStats);

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
  } catch (error) {
    console.error('❌ Lỗi khi test message queue:', error);
  }
}

async function monitorQueue() {
  console.log('\n👀 Monitoring Queue...');

  // Listen to job events
  notificationQueue.on('completed', (job, result) => {
    console.log(`✅ Job ${job.id} completed:`, result);
  });

  notificationQueue.on('failed', (job, err) => {
    console.log(`❌ Job ${job.id} failed:`, err.message);
  });

  notificationQueue.on('progress', (job, progress) => {
    console.log(`📈 Job ${job.id} progress: ${progress}%`);
  });

  // Monitor every 5 seconds
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
  }, 5000);
}

async function main() {
  console.log('🎯 Demo Message Queue System');
  console.log('============================\n');

  // Hiển thị Redis config
  console.log('🔧 Redis Configuration:');
  console.log(`- Host: ${process.env.REDIS_HOST || 'localhost'}`);
  console.log(`- Port: ${process.env.REDIS_PORT || '6379'}`);
  console.log(`- Password: ${process.env.REDIS_PASSWORD ? '***' : 'none'}`);
  console.log('');

  try {
    // Tạo demo data
    const demoData = await createDemoData();

    // Test message queue
    await testMessageQueue();

    // Monitor queue
    await monitorQueue();

    console.log('\n🎉 Demo đang chạy! Nhấn Ctrl+C để dừng.');
    console.log('📱 Mở terminal khác để xem logs hoặc test thêm.');
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
