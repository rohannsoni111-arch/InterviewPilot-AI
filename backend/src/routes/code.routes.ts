import { Router } from 'express';
import { CodeController } from '../controllers/code.controller';
import { authenticate } from '../middleware/auth';

export const codeRouter = Router();

// Code execution and review endpoints
codeRouter.post('/run', authenticate, CodeController.runCode);
codeRouter.post('/review', authenticate, CodeController.reviewCode);

export default codeRouter;
