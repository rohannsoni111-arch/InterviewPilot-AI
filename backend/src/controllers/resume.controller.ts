import { Response, NextFunction } from 'express';
import { resumeService } from '../services/resume.service';
import { CreateResumeDto, ResumeMatchDto, UserRole } from '@interviewpilot/shared';
import { AuthenticatedRequest } from '../middleware/auth';

export class ResumeController {
  public createResume = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const dto: CreateResumeDto = req.body;
      const result = await resumeService.createResume(userId, dto);

      res.status(201).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  };

  public getUserResumes = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const result = await resumeService.getUserResumes(userId);

      res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  };

  public getResumeById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const result = await resumeService.getResumeById(userId, req.params.id, isAdmin);

      res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  };

  public deleteResume = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const isAdmin = req.user!.role === UserRole.ADMIN;
      await resumeService.deleteResume(userId, req.params.id, isAdmin);

      res.status(200).json({
        success: true,
        data: { message: 'Resume deleted successfully' },
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  };

  public matchResume = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!._id.toString();
      const isAdmin = req.user!.role === UserRole.ADMIN;
      const dto: ResumeMatchDto = req.body;
      const result = await resumeService.matchResumeToJD(userId, dto, isAdmin);

      res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() }
      });
    } catch (err) {
      next(err);
    }
  };
}

export const resumeController = new ResumeController();
