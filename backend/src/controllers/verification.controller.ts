import { Request, Response, NextFunction } from 'express';
import { VerificationService } from '../services/verification.service';
import { ApiResponse, IVerifiedReportBadge, IPublicVerifiedReport } from '@interviewpilot/shared';

export class VerificationController {
  static async generateBadge(
    req: Request,
    res: Response<ApiResponse<IVerifiedReportBadge>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?._id?.toString() || (req as any).tokenPayload?.userId;

      const badge = await VerificationService.generateVerificationBadge(id, userId);

      res.status(200).json({
        success: true,
        data: badge,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPublicReport(
    req: Request,
    res: Response<ApiResponse<IPublicVerifiedReport>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { badgeId } = req.params;
      const report = await VerificationService.getPublicVerifiedReport(badgeId);

      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }
}
