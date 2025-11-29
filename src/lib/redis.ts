import Redis from 'ioredis';

// 也就是 global var hack，防止 Next.js 热重载时创建太多 Redis 连接导致爆炸
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;