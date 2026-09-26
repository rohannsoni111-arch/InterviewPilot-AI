import { Router } from 'express';
import { VerificationController } from '../controllers/verification.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public: Retrieve verified candidate certificate by badgeId
router.get('/verify/:badgeId', VerificationController.getPublicReport);

// Authenticated: Generate/retrieve verification badge for completed interview
router.post('/interviews/:id/verify-badge', authenticate, VerificationController.generateBadge);

export default router;
