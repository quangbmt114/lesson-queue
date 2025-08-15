#!/usr/bin/env node

const Redis = require('redis');
const Bull = require('bull');

async function testQueue() {
  console.log('🚀 Testing Queue System...');

  // Create Redis client
  const redis = Redis.createClient({
    host: 'localhost',
    port: 6379,
  });

  // Create Bull queue
  const notificationQueue = new Bull('notification', {
    redis: {
      host: 'localhost',
      port: 6379,
    },
  });

  try {
    // Test Redis connection
    console.log('🔍 Testing Redis connection...');
    await redis.connect();
    await redis.ping();
    console.log('✅ Redis connection successful!');

    // Test Bull queue
    console.log('🔍 Testing Bull queue...');
    await notificationQueue.isReady();
    console.log('✅ Bull queue ready!');

    // Add test jobs
    console.log('📝 Adding test jobs...');

    const job1 = await notificationQueue.add('send-email', {
      email: 'test1@example.com',
      message: 'Test notification 1',
      timestamp: new Date().toISOString(),
    });
    console.log(`✅ Job 1 added: ${job1.id}`);

    const job2 = await notificationQueue.add('send-email', {
      email: 'test2@example.com',
      message: 'Test notification 2',
      timestamp: new Date().toISOString(),
    });
    console.log(`✅ Job 2 added: ${job2.id}`);

    const job3 = await notificationQueue.add('send-email', {
      email: 'test3@example.com',
      message: 'Test notification 3',
      timestamp: new Date().toISOString(),
    });
    console.log(`✅ Job 3 added: ${job3.id}`);

    // Wait a bit for jobs to be processed
    console.log('⏳ Waiting for jobs to be processed...');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check queue status
    console.log('📊 Checking queue status...');

    const waiting = await notificationQueue.getWaiting();
    const active = await notificationQueue.getActive();
    const completed = await notificationQueue.getCompleted();
    const failed = await notificationQueue.getFailed();

    console.log(`📋 Queue Status:`);
    console.log(`   Waiting: ${waiting.length}`);
    console.log(`   Active: ${active.length}`);
    console.log(`   Completed: ${completed.length}`);
    console.log(`   Failed: ${failed.length}`);

    // Show job details
    if (completed.length > 0) {
      console.log('\n✅ Completed Jobs:');
      completed.forEach((job) => {
        console.log(
          `   Job ${job.id}: ${job.data.email} - ${job.data.message}`,
        );
      });
    }

    if (failed.length > 0) {
      console.log('\n❌ Failed Jobs:');
      failed.forEach((job) => {
        console.log(
          `   Job ${job.id}: ${job.data.email} - ${job.data.message}`,
        );
      });
    }

    // Clean up test jobs
    console.log('🧹 Cleaning up test jobs...');
    await notificationQueue.clean(0, 'completed');
    await notificationQueue.clean(0, 'failed');
    console.log('✅ Test jobs cleaned up');

    console.log('\n🎉 Queue test completed successfully!');
  } catch (error) {
    console.error('❌ Queue test failed:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure Redis is running');
      console.log('2. Check if Redis is accessible on localhost:6379');
      console.log('3. Try: docker run -d -p 6379:6379 redis:alpine');
    }

    process.exit(1);
  } finally {
    // Cleanup
    await redis.quit();
    await notificationQueue.close();
  }
}

// Run test if called directly
if (require.main === module) {
  testQueue();
}

module.exports = { testQueue };
