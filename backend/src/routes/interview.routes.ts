import { Router } from 'express';
import { interviewController } from '../controllers/interview.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All interview routes require candidate/admin authentication
router.use(authenticate);


router.post('/', interviewController.createInterview);
router.get('/', interviewController.listInterviews);
router.get('/:id', interviewController.getInterview);
router.patch('/:id/status', interviewController.updateStatus);
router.delete('/:id', interviewController.deleteInterview);

export default router;
