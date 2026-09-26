import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from '../validators/auth.validator';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = RegisterSchema.parse(req.body);
      const result = await AuthService.register(validatedData);

      res.status(201).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = LoginSchema.parse(req.body);
      const result = await AuthService.login(validatedData);

      res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = RefreshTokenSchema.parse(req.body);
      const result = await AuthService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body?.refreshToken;
      if (req.user && refreshToken) {
        await AuthService.logout(req.user._id.toString(), refreshToken);
      }

      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }

  public static async me(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
          meta: { timestamp: new Date().toISOString() }
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { user: req.user.toSafeObject() },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }
}
