#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  console.log('🔍 Testing database connection...');

  const prisma = new PrismaClient();

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Test basic queries
    console.log('\n📊 Testing basic queries...');

    // Count users
    const userCount = await prisma.user.count();
    console.log(`👥 Users count: ${userCount}`);

    // Count shops
    const shopCount = await prisma.shop.count();
    console.log(`🏪 Shops count: ${shopCount}`);

    // Count products
    const productCount = await prisma.product.count();
    console.log(`📦 Products count: ${productCount}`);

    // Count subscriptions
    const subscriptionCount = await prisma.subscription.count();
    console.log(`🔔 Subscriptions count: ${subscriptionCount}`);

    // Count notifications
    const notificationCount = await prisma.notification.count();
    console.log(`📧 Notifications count: ${notificationCount}`);

    // Test schema
    console.log('\n🏗️  Testing schema...');

    // Get table names
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log('📋 Available tables:');
    tables.forEach((table) => {
      console.log(`   - ${table.table_name}`);
    });

    // Test enum values
    console.log('\n🎭 Testing enums...');

    const userRoles = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::"UserRole")) as role
    `;

    console.log('👤 Available user roles:');
    userRoles.forEach((role) => {
      console.log(`   - ${role.role}`);
    });

    console.log('\n🎉 All database tests passed successfully!');
  } catch (error) {
    console.error('❌ Database test failed:', error.message);

    if (error.code === 'P1001') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Check if PostgreSQL is running');
      console.log('2. Verify DATABASE_URL in .env file');
      console.log('3. Check if database "lesson_queue" exists');
      console.log('4. Verify username/password in connection string');
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test if called directly
if (require.main === module) {
  testDatabase();
}

module.exports = { testDatabase };
