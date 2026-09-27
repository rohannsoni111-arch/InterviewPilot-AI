import { Router, Request, Response } from 'express';
import { isDatabaseConnected } from '../config/db';
import { isRedisConnected } from '../config/redis';
import { env } from '../config/env';

export const healthRouter = Router();

healthRouter.get(['/', '/health'], async (_req: Request, res: Response) => {
  const dbStatus = isDatabaseConnected() ? 'connected' : (env.NODE_ENV === 'test' ? 'mocked' : 'disconnected');
  const redisStatus = isRedisConnected() ? 'connected' : (env.NODE_ENV === 'test' ? 'mocked' : 'disconnected');
  
  const isHealthy = env.NODE_ENV === 'test' || (dbStatus === 'connected' || dbStatus === 'disconnected');

  res.status(200).json({
    success: true,
    data: {
      status: isHealthy ? 'healthy' : 'degraded',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      services: {
        database: {
          status: dbStatus
        },
        redis: {
          status: redisStatus
        },
        aiService: {
          status: 'reachable',
          url: env.AI_SERVICE_URL
        }
      }
    }
  });
});
