import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

dashboardRouter.get('/summary', DashboardController.getSummary);
dashboardRouter.get('/analytics', DashboardController.getAnalytics);
