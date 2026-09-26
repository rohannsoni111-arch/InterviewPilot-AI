import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.post('/refresh', AuthController.refreshToken);
authRouter.post('/logout', authenticate, AuthController.logout);
authRouter.get('/me', authenticate, AuthController.me);
