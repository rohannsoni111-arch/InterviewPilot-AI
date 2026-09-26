import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { connectDatabase } from './config/db';
import { connectRedis } from './config/redis';

async function bootstrap() {
  const app = createApp();

  await connectDatabase();
  await connectRedis();

  const server = app.listen(env.PORT, () => {
    logger.info(`InterviewPilot Backend running on http://localhost:${env.PORT} [mode: ${env.NODE_ENV}]`);
  });

  const shutdown = async () => {
    logger.info('Shutting down server gracefully...');
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

if (process.env.NODE_ENV !== 'test') {
  bootstrap().catch((err) => {
    logger.fatal({ err }, 'Fatal startup error');
    process.exit(1);
  });
}
