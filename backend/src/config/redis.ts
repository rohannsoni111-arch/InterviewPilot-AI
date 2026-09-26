import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;
let isConnected = false;

export function getRedisClient(): Redis | null {
  if (!redisClient && env.NODE_ENV !== 'test') {
    try {
      redisClient = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
        connectTimeout: 2000,
        lazyConnect: true
      });

      redisClient.on('connect', () => {
        isConnected = true;
        logger.info('Connected to Redis server');
      });

      redisClient.on('error', (err) => {
        isConnected = false;
        logger.warn({ err: err.message }, 'Redis connection warning (running in degraded mode)');
      });
    } catch (error) {
      logger.warn({ err: error }, 'Could not initialize Redis client');
    }
  }
  return redisClient;
}

export async function connectRedis(): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return false;
  try {
    await client.connect();
    isConnected = true;
    return true;
  } catch {
    isConnected = false;
    return false;
  }
}

export function isRedisConnected(): boolean {
  return isConnected && redisClient?.status === 'ready';
}
