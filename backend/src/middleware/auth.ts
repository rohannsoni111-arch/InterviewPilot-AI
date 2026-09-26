import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { User, IUserDocument } from '../models/User';
import { UserRole } from '@interviewpilot/shared';

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
  tokenPayload?: TokenPayload;
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token is required'
      },
      meta: { timestamp: new Date().toISOString() }
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    res.status(401).json({
      success: false,
      error: {
        code: 'TOKEN_EXPIRED_OR_INVALID',
        message: 'Invalid or expired access token'
      },
      meta: { timestamp: new Date().toISOString() }
    });
    return;
  }

  try {
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND_OR_INACTIVE',
          message: 'User account not found or deactivated'
        },
        meta: { timestamp: new Date().toISOString() }
      });
      return;
    }

    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        },
        meta: { timestamp: new Date().toISOString() }
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Required role(s): ${allowedRoles.join(', ')}`
        },
        meta: { timestamp: new Date().toISOString() }
      });
      return;
    }

    next();
  };
}
