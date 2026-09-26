import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { dashboardRouter } from './routes/dashboard.routes';
import interviewRouter from './routes/interview.routes';
import codeRouter from './routes/code.routes';
import resumeRouter from './routes/resume.routes';
import speechRouter from './routes/speech.routes';
import questionBankRouter from './routes/questionBank.routes';
import verificationRouter from './routes/verification.routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json());
  app.use(requestLogger);

  // Mount API v1 routes
  app.use('/api/v1', healthRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/dashboard', dashboardRouter);
  app.use('/api/v1/interviews', interviewRouter);
  app.use('/api/v1/code', codeRouter);
  app.use('/api/v1/resumes', resumeRouter);
  app.use('/api/v1/speech', speechRouter);
  app.use('/api/v1/questions', questionBankRouter);
  app.use('/api/v1', verificationRouter);


  // Catch-all route for unknown API endpoints
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Cannot ${req.method} ${req.originalUrl}`
      },
      meta: { timestamp: new Date().toISOString() }
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
}
