import { Request, Response, NextFunction } from 'express';
import { QuestionBankService } from '../services/questionBank.service';
import { ApiResponse, IQuestionBankItem, IInterviewSession } from '@interviewpilot/shared';

export class QuestionBankController {
  static async getQuestions(
    req: Request,
    res: Response<ApiResponse<IQuestionBankItem[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { company, track, difficulty, search, tag } = req.query;
      const questions = await QuestionBankService.getQuestions({
        company: company as string,
        track: track as any,
        difficulty: difficulty as any,
        search: search as string,
        tag: tag as string,
      });

      res.status(200).json({
        success: true,
        data: questions,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getQuestionById(
    req: Request,
    res: Response<ApiResponse<IQuestionBankItem>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const question = await QuestionBankService.getQuestionById(id);

      res.status(200).json({
        success: true,
        data: question,
      });
    } catch (error) {
      next(error);
    }
  }

  static async launchInterview(
    req: Request,
    res: Response<ApiResponse<IInterviewSession>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const candidateId = (req as any).user?.userId;

      const session = await QuestionBankService.launchInterviewWithQuestion(
        id,
        candidateId
      );

      res.status(201).json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }
}
