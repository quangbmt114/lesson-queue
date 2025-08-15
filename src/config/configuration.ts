export default () => ({
  // Application
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:password@localhost:5432/lesson_queue',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'lesson_queue',
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6380', 10) || 6380,
    password: process.env.REDIS_PASSWORD || '',
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10) || 3600,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10) || 12,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableQueryLog: process.env.ENABLE_QUERY_LOG === 'true',
  },

  // Queue
  queue: {
    defaultJobOptions: {
      removeOnComplete:
        parseInt(process.env.QUEUE_REMOVE_ON_COMPLETE || '100', 10) || 100,
      removeOnFail:
        parseInt(process.env.QUEUE_REMOVE_ON_FAIL || '50', 10) || 50,
      attempts: parseInt(process.env.QUEUE_ATTEMPTS || '3', 10) || 3,
    },
    stalledInterval:
      parseInt(process.env.QUEUE_STALLED_INTERVAL || '30000', 10) || 30000,
  },
});
