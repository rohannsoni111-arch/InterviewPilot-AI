import { Response, NextFunction } from 'express';
import { interviewService } from '../services/interview.service';
import {
  createInterviewSchema,
  updateInterviewStatusSchema,
  listInterviewsQuerySchema,
  submitTurnSchema
} from '../validators/interview.validator';
import { UserRole } from '@interviewpilot/shared';
import { AuthenticatedRequest } from '../middleware/auth';

export class InterviewController {
  public createInterview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedInput = createInterviewSchema.parse(req.body);
      const userId = req.user!._id.toString();
      const session = await interviewService.createInterview(userId, validatedInput);

      res.status(201).json({
        success: true,
        data: session,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public getInterview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const session = await interviewService.getInterviewById(userId, req.params.id, isAdmin);

      res.status(200).json({
        success: true,
        data: session,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public listInterviews = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const query = listInterviewsQuerySchema.parse(req.query);
      const result = await interviewService.listUserInterviews(userId, query, isAdmin);

      res.status(200).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public startLiveSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const result = await interviewService.startLiveSession(userId, req.params.id, isAdmin);

      res.status(200).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public submitTurn = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const validatedInput = submitTurnSchema.parse(req.body);
      const result = await interviewService.processTurn(
        userId,
        req.params.id,
        validatedInput.content,
        isAdmin,
        validatedInput.codeSnippet
      );

      res.status(200).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public advanceStage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const result = await interviewService.advanceStage(userId, req.params.id, isAdmin);

      res.status(200).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public pauseSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const session = await interviewService.pauseSession(userId, req.params.id, isAdmin);

      res.status(200).json({
        success: true,
        data: session,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public resumeSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const session = await interviewService.resumeSession(userId, req.params.id, isAdmin);

      res.status(200).json({
        success: true,
        data: session,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public concludeSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const session = await interviewService.concludeSession(userId, req.params.id, isAdmin);

      res.status(200).json({
        success: true,
        data: session,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const validatedInput = updateInterviewStatusSchema.parse(req.body);
      const session = await interviewService.updateInterviewStatus(
        userId,
        req.params.id,
        validatedInput.status,
        isAdmin
      );

      res.status(200).json({
        success: true,
        data: session,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteInterview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const isAdmin = req.user!.role === UserRole.ADMIN;
      await interviewService.deleteInterview(userId, req.params.id, isAdmin);

      res.status(200).json({
        success: true,
        data: { message: 'Interview session successfully deleted' },
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public evaluateSession = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const result = await interviewService.evaluateInterview(userId, req.params.id, isAdmin);

      res.status(200).json({
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  public getEvaluationReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const report = await interviewService.getEvaluationReport(userId, req.params.id, isAdmin);

      res.status(200).json({
        success: true,
        data: report,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };
}

export const interviewController = new InterviewController();


