#!/usr/bin/env node

/**
 * Test Auto Flow với Logging Chi Tiết
 * Chạy: node test-auto-flow.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Khởi tạo Prisma
const prisma = new PrismaClient();

console.log('🧪 Test Auto Flow: Shop Thêm Sản Phẩm → Tự Động Gửi Thông Báo');
console.log(
  '================================================================\n',
);

async function testAutoFlow() {
  try {
    console.log('🔍 Bước 1: Tìm shop để test...');

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
      console.log(
        '❌ Không tìm thấy shop nào. Hãy chạy yarn prisma:seed trước.',
      );
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

    console.log('\n📦 Bước 2: Tạo sản phẩm mới để trigger flow tự động...');

    const newProduct = {
      name: 'Test Product - Auto Flow',
      description: 'Sản phẩm test để kiểm tra flow tự động',
      price: 1000000,
    };

    console.log(`📝 Product data:`, newProduct);
    console.log(`🔄 Đang tạo sản phẩm trong database...`);

    const product = await prisma.product.create({
      data: {
        shopId: shop.id,
        name: newProduct.name,
        description: newProduct.description,
        price: newProduct.price,
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

    console.log(`✅ Sản phẩm đã được tạo thành công!`);
    console.log(`   - ID: ${product.id}`);
    console.log(`   - Tên: ${product.name}`);
    console.log(`   - Giá: ${product.price.toLocaleString('vi-VN')} VND`);
    console.log(`   - Shop: ${product.shop.name} (ID: ${product.shop.id})`);
    console.log(`   - Số subscribers: ${product.shop.subscriptions.length}`);

    console.log('\n📧 Bước 3: Kiểm tra notifications đã được tạo...');

    const notifications = await prisma.notification.findMany({
      where: {
        productId: product.id,
      },
      include: {
        customer: true,
      },
    });

    console.log(
      `📊 Tìm thấy ${notifications.length} notifications cho sản phẩm mới:`,
    );

    notifications.forEach((notification, index) => {
      console.log(
        `   ${index + 1}. ${notification.customer.name} (${notification.customer.email})`,
      );
      console.log(`      - Message: ${notification.message}`);
      console.log(`      - Status: ${notification.status}`);
      console.log(`      - Sent At: ${notification.sentAt}`);
    });

    console.log('\n🎯 Bước 4: Hướng dẫn xem flow tự động thực sự...');
    console.log('💡 Để xem flow tự động hoạt động với logging chi tiết:');
    console.log('1. Chạy yarn start:dev để khởi động NestJS app');
    console.log('2. Mở terminal khác và chạy: yarn demo:processor');
    console.log('3. Sử dụng GraphQL Playground để tạo sản phẩm mới');
    console.log('4. Xem logs chi tiết trong terminal NestJS');
    console.log('5. Xem logs xử lý queue trong terminal processor');

    console.log('\n📋 GraphQL Mutation để test:');
    console.log(`
mutation CreateProduct {
  createProduct(createProductInput: {
    shopId: "${shop.id}"
    name: "Test Product - GraphQL"
    description: "Sản phẩm test qua GraphQL"
    price: 2000000
  }) {
    id
    name
    price
    shop {
      name
      subscriptions {
        customer {
          name
          email
        }
      }
    }
  }
}
    `);

    console.log(
      '\n🎉 Test hoàn thành! Bây giờ hãy chạy app thật để xem flow tự động.',
    );
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down test...');
  await prisma.$disconnect();
  process.exit(0);
});

// Run test
testAutoFlow().catch(console.error);
