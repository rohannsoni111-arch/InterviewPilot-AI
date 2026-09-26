import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All resume endpoints require authentication
router.use(authenticate);

router.post('/', resumeController.createResume);
router.get('/', resumeController.getUserResumes);
router.post('/match', resumeController.matchResume);
router.get('/:id', resumeController.getResumeById);
router.delete('/:id', resumeController.deleteResume);

export default router;
