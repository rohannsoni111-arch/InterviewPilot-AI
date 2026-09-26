import { Router } from 'express';
import { interviewController } from '../controllers/interview.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All interview routes require candidate/admin authentication
router.use(authenticate);


router.post('/', interviewController.createInterview);
router.get('/', interviewController.listInterviews);
router.get('/:id', interviewController.getInterview);
router.post('/:id/start', interviewController.startLiveSession);
router.post('/:id/turn', interviewController.submitTurn);
router.post('/:id/advance-stage', interviewController.advanceStage);
router.post('/:id/pause', interviewController.pauseSession);
router.post('/:id/resume', interviewController.resumeSession);
router.post('/:id/conclude', interviewController.concludeSession);
router.patch('/:id/status', interviewController.updateStatus);
router.delete('/:id', interviewController.deleteInterview);

export default router;

