import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

let isConnected = false;

export async function connectDatabase(): Promise<boolean> {
  if (isConnected) return true;
  try {
    if (process.env.NODE_ENV === 'test') {
      logger.info('Running in test environment - skipping actual MongoDB connection');
      return true;
    }
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    logger.info('Connected to MongoDB database');
    return true;
  } catch (error) {
    logger.warn({ err: error }, 'MongoDB connection warning (service running in degraded mode)');
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('Disconnected from MongoDB');
  }
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
