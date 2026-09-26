import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const timestamp = new Date().toISOString();

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload',
        details: err.errors
      },
      meta: { timestamp }
    });
    return;
  }

  if (err instanceof AppError || (err.statusCode && err.code)) {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json({
      success: false,
      error: {
        code: err.code || 'BAD_REQUEST',
        message: err.message,
        details: err.details
      },
      meta: { timestamp }
    });
    return;
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled application error');

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
    },
    meta: { timestamp }
  });
}
