import { Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { UpdateProfileSchema, ChangePasswordSchema } from '../validators/auth.validator';
import { AuthenticatedRequest } from '../middleware/auth';

export class UserController {
  public static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const user = await UserService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: { user },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const validatedData = UpdateProfileSchema.parse(req.body);
      const updatedUser = await UserService.updateProfile(userId, validatedData);

      res.status(200).json({
        success: true,
        data: { user: updatedUser },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!._id.toString();
      const validatedData = ChangePasswordSchema.parse(req.body);
      await UserService.changePassword(userId, validatedData);

      res.status(200).json({
        success: true,
        data: { message: 'Password changed successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;

      const result = await UserService.listUsers(page, limit);

      res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }
}
