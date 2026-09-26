import { Request, Response, NextFunction } from 'express';
import { SpeechService } from '../services/speech.service';
import { ApiResponse, IVoiceProfile, ITTSResponse, ISTTResponse } from '@interviewpilot/shared';

export class SpeechController {
  static async getVoiceProfiles(
    _req: Request,
    res: Response<ApiResponse<IVoiceProfile[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const profiles = await SpeechService.getVoiceProfiles();
      res.status(200).json({
        success: true,
        data: profiles,
      });
    } catch (error) {
      next(error);
    }
  }

  static async synthesizeSpeech(
    req: Request,
    res: Response<ApiResponse<ITTSResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { text, voiceId, speed, pitch } = req.body;
      if (!text || typeof text !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Text parameter is required for speech synthesis.',
          },
        });
        return;
      }

      const result = await SpeechService.synthesize({
        text,
        voiceId,
        speed,
        pitch,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async transcribeSpeech(
    req: Request,
    res: Response<ApiResponse<ISTTResponse>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { audioBase64, format, sampleRate } = req.body;
      if (!audioBase64 || typeof audioBase64 !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'audioBase64 payload is required for speech transcription.',
          },
        });
        return;
      }

      const result = await SpeechService.transcribe({
        audioBase64,
        format,
        sampleRate,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
