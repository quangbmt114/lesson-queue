#!/usr/bin/env node

/**
 * Test Redis Connection for Demo Check
 */

require('dotenv').config();
const Queue = require('bull');

async function testRedisConnection() {
  try {
    // Queue config
    const queueConfig = {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || '',
      },
    };

    // Create test queue
    const testQueue = new Queue('test-connection', queueConfig);

    // Wait for queue to be ready
    await testQueue.isReady();

    // Test adding a job
    const job = await testQueue.add('test', { message: 'Hello World' });

    // Clean up test job
    await job.remove();

    // Close queue
    await testQueue.close();

    // Exit successfully
    process.exit(0);
  } catch (error) {
    console.error('Redis connection failed:', error.message);
    process.exit(1);
  }
}

// Run test
testRedisConnection();
