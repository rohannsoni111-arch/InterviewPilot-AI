import { Router } from 'express';
import { QuestionBankController } from '../controllers/questionBank.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Retrieve all curated questions with filters
router.get('/', authenticate, QuestionBankController.getQuestions);

// Retrieve a specific question by ID
router.get('/:id', authenticate, QuestionBankController.getQuestionById);

// 1-Click Launch simulation initialized with this question
router.post('/:id/launch', authenticate, QuestionBankController.launchInterview);

export default router;
