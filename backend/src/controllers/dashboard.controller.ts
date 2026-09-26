import { Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthenticatedRequest } from '../middleware/auth';

export class DashboardController {
  public static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const summary = await DashboardService.getDashboardSummary(userId);

      res.status(200).json({
        success: true,
        data: summary,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const analytics = await DashboardService.getComprehensiveAnalytics(userId);

      res.status(200).json({
        success: true,
        data: analytics,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }
}
