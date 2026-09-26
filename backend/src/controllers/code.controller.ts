import { Request, Response, NextFunction } from 'express';
import { CodeService } from '../services/code.service';
import { CodeExecutionRequest, CodeReviewRequest, SupportedLanguage } from '@interviewpilot/shared';

export class CodeController {
  public static async runCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, language, testCases, customInput } = req.body;

      if (!code || typeof code !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Field "code" is required and must be a string'
          }
        });
        return;
      }

      const supportedLanguages = Object.values(SupportedLanguage) as string[];
      if (!language || !supportedLanguages.includes(language.toLowerCase())) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_LANGUAGE',
            message: `Field "language" must be one of: ${supportedLanguages.join(', ')}`
          }
        });
        return;
      }

      const request: CodeExecutionRequest = {
        code,
        language: language.toLowerCase() as SupportedLanguage,
        testCases,
        customInput
      };

      const result = await CodeService.executeCode(request);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  public static async reviewCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code, language, problemContext, sessionId, stageId } = req.body;

      if (!code || typeof code !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Field "code" is required and must be a string'
          }
        });
        return;
      }

      const supportedLanguages = Object.values(SupportedLanguage) as string[];
      if (!language || !supportedLanguages.includes(language.toLowerCase())) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_LANGUAGE',
            message: `Field "language" must be one of: ${supportedLanguages.join(', ')}`
          }
        });
        return;
      }

      const request: CodeReviewRequest = {
        code,
        language: language.toLowerCase() as SupportedLanguage,
        problemContext,
        sessionId,
        stageId
      };

      const review = await CodeService.reviewCode(request);

      res.status(200).json({
        success: true,
        data: review
      });
    } catch (error) {
      next(error);
    }
  }
}
