const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clean up existing data
    console.log('🧹 Cleaning up existing data...');
    await prisma.notification.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.product.deleteMany();
    await prisma.shop.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Data cleaned up');

    // Create Users
    console.log('👥 Creating users...');

    const shopOwner1 = await prisma.user.create({
      data: {
        name: 'John Tech Store Owner',
        email: 'john@techstore.com',
        role: 'SHOP_OWNER',
      },
    });

    const shopOwner2 = await prisma.user.create({
      data: {
        name: 'Sarah Fashion Store Owner',
        email: 'sarah@fashionstore.com',
        role: 'SHOP_OWNER',
      },
    });

    const customer1 = await prisma.user.create({
      data: {
        name: 'Mary Johnson',
        email: 'mary@customer.com',
        role: 'CUSTOMER',
      },
    });

    const customer2 = await prisma.user.create({
      data: {
        name: 'Bob Smith',
        email: 'bob@customer.com',
        role: 'CUSTOMER',
      },
    });

    const customer3 = await prisma.user.create({
      data: {
        name: 'Alice Brown',
        email: 'alice@customer.com',
        role: 'CUSTOMER',
      },
    });

    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@lessonqueue.com',
        role: 'ADMIN',
      },
    });

    console.log('✅ Users created');

    // Create Shops
    console.log('🏪 Creating shops...');

    const techStore = await prisma.shop.create({
      data: {
        name: 'Tech Store',
        description: 'Cửa hàng công nghệ hàng đầu với các sản phẩm mới nhất',
        ownerId: shopOwner1.id,
      },
    });

    const fashionStore = await prisma.shop.create({
      data: {
        name: 'Fashion Store',
        description: 'Thời trang hiện đại và phong cách cho mọi lứa tuổi',
        ownerId: shopOwner2.id,
      },
    });

    console.log('✅ Shops created');

    // Create Subscriptions
    console.log('🔔 Creating subscriptions...');

    // Tech Store subscriptions
    await prisma.subscription.create({
      data: {
        customerId: customer1.id,
        shopId: techStore.id,
      },
    });

    await prisma.subscription.create({
      data: {
        customerId: customer2.id,
        shopId: techStore.id,
      },
    });

    await prisma.subscription.create({
      data: {
        customerId: customer3.id,
        shopId: techStore.id,
      },
    });

    // Fashion Store subscriptions
    await prisma.subscription.create({
      data: {
        customerId: customer1.id,
        shopId: fashionStore.id,
      },
    });

    await prisma.subscription.create({
      data: {
        customerId: customer2.id,
        shopId: fashionStore.id,
      },
    });

    console.log('✅ Subscriptions created');

    // Create Products
    console.log('📦 Creating products...');

    // Tech Store products
    const iphone15 = await prisma.product.create({
      data: {
        shopId: techStore.id,
        name: 'iPhone 15 Pro',
        description: 'Smartphone mới nhất từ Apple với chip A17 Pro',
        price: 999.99,
      },
    });

    const macbookPro = await prisma.product.create({
      data: {
        shopId: techStore.id,
        name: 'MacBook Pro M3',
        description: 'Laptop mạnh mẽ với chip M3 mới nhất',
        price: 1999.99,
      },
    });

    const airpods = await prisma.product.create({
      data: {
        shopId: techStore.id,
        name: 'AirPods Pro 2',
        description: 'Tai nghe không dây với chống ồn chủ động',
        price: 249.99,
      },
    });

    // Fashion Store products
    const summerDress = await prisma.product.create({
      data: {
        shopId: fashionStore.id,
        name: 'Summer Dress Collection',
        description: 'Bộ sưu tập váy mùa hè với thiết kế hiện đại',
        price: 89.99,
      },
    });

    const sneakers = await prisma.product.create({
      data: {
        shopId: fashionStore.id,
        name: 'Premium Sneakers',
        description: 'Giày thể thao cao cấp với chất liệu bền bỉ',
        price: 129.99,
      },
    });

    console.log('✅ Products created');

    // Create Sample Notifications (for demo purposes)
    console.log('📧 Creating sample notifications...');

    // Tech Store notifications
    await prisma.notification.create({
      data: {
        customerId: customer1.id,
        shopId: techStore.id,
        productId: iphone15.id,
        message: 'New product available: iPhone 15 Pro',
        status: 'sent',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
    });

    await prisma.notification.create({
      data: {
        customerId: customer2.id,
        shopId: techStore.id,
        productId: iphone15.id,
        message: 'New product available: iPhone 15 Pro',
        status: 'sent',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
    });

    await prisma.notification.create({
      data: {
        customerId: customer3.id,
        shopId: techStore.id,
        productId: iphone15.id,
        message: 'New product available: iPhone 15 Pro',
        status: 'sent',
        sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
    });

    // Fashion Store notifications
    await prisma.notification.create({
      data: {
        customerId: customer1.id,
        shopId: fashionStore.id,
        productId: summerDress.id,
        message: 'New product available: Summer Dress Collection',
        status: 'sent',
        sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
    });

    await prisma.notification.create({
      data: {
        customerId: customer2.id,
        shopId: fashionStore.id,
        productId: summerDress.id,
        message: 'New product available: Summer Dress Collection',
        status: 'sent',
        sentAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      },
    });

    console.log('✅ Sample notifications created');

    // Display summary
    console.log('\n📊 Seeding Summary:');
    console.log('==================');
    console.log(`👥 Users: ${await prisma.user.count()}`);
    console.log(
      `   - Shop Owners: ${await prisma.user.count({ where: { role: 'SHOP_OWNER' } })}`,
    );
    console.log(
      `   - Customers: ${await prisma.user.count({ where: { role: 'CUSTOMER' } })}`,
    );
    console.log(
      `   - Admins: ${await prisma.user.count({ where: { role: 'ADMIN' } })}`,
    );
    console.log(`🏪 Shops: ${await prisma.shop.count()}`);
    console.log(`🔔 Subscriptions: ${await prisma.subscription.count()}`);
    console.log(`📦 Products: ${await prisma.product.count()}`);
    console.log(`📧 Notifications: ${await prisma.notification.count()}`);

    console.log('\n🎯 Demo Data Ready!');
    console.log('==================');
    console.log('📱 Tech Store:');
    console.log(`   - Owner: ${shopOwner1.name} (${shopOwner1.email})`);
    console.log(
      `   - Products: ${iphone15.name}, ${macbookPro.name}, ${airpods.name}`,
    );
    console.log(
      `   - Subscribers: ${customer1.name}, ${customer2.name}, ${customer3.name}`,
    );

    console.log('\n👗 Fashion Store:');
    console.log(`   - Owner: ${shopOwner2.name} (${shopOwner2.email})`);
    console.log(`   - Products: ${summerDress.name}, ${sneakers.name}`);
    console.log(`   - Subscribers: ${customer1.name}, ${customer2.name}`);

    console.log('\n🚀 Next Steps:');
    console.log('1. Start the application: yarn start:dev');
    console.log('2. Open GraphQL Playground: http://localhost:3000/graphql');
    console.log('3. Test creating new products to trigger notifications');
    console.log('4. Monitor queue activity in logs');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(async () => {
    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('💥 Seeding failed:', e);
    process.exit(1);
  });
