import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '@interviewpilot/shared';

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/profile', UserController.getProfile);
userRouter.patch('/profile', UserController.updateProfile);
userRouter.post('/change-password', UserController.changePassword);

// Admin-only route
userRouter.get('/all', requireRole(UserRole.ADMIN), UserController.listUsers);
