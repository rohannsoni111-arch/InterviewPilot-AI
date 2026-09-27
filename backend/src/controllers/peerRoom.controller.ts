import { Request, Response, NextFunction } from 'express';
import { PeerRoomService } from '../services/peerRoom.service';
import { ApiResponse, IPeerRoom } from '@interviewpilot/shared';

export class PeerRoomController {
  static async createRoom(
    req: Request,
    res: Response<ApiResponse<IPeerRoom>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as any).user?._id?.toString() || (req as any).tokenPayload?.userId || 'guest-user';
      const userName = (req as any).user?.name || 'Peer Engineer';

      const room = await PeerRoomService.createRoom(userId, userName, req.body);

      res.status(201).json({
        success: true,
        data: room.toObject() as unknown as IPeerRoom,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRoom(
    req: Request,
    res: Response<ApiResponse<IPeerRoom>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { roomCode } = req.params;
      const room = await PeerRoomService.getRoom(roomCode);

      res.status(200).json({
        success: true,
        data: room.toObject() as unknown as IPeerRoom,
      });
    } catch (error) {
      next(error);
    }
  }

  static async joinRoom(
    req: Request,
    res: Response<ApiResponse<IPeerRoom>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { roomCode } = req.params;
      const userId = (req as any).user?._id?.toString() || (req as any).tokenPayload?.userId || req.body.userId || 'guest-peer';
      const userName = (req as any).user?.name || req.body.userName || 'Peer Candidate';
      const { preferredRole } = req.body;

      const room = await PeerRoomService.joinRoom(roomCode, userId, userName, preferredRole);

      res.status(200).json({
        success: true,
        data: room.toObject() as unknown as IPeerRoom,
      });
    } catch (error) {
      next(error);
    }
  }

  static async switchRole(
    req: Request,
    res: Response<ApiResponse<IPeerRoom>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { roomCode } = req.params;
      const userId = (req as any).user?._id?.toString() || (req as any).tokenPayload?.userId;
      const { role } = req.body;

      const room = await PeerRoomService.switchRole(roomCode, userId, role);

      res.status(200).json({
        success: true,
        data: room.toObject() as unknown as IPeerRoom,
      });
    } catch (error) {
      next(error);
    }
  }

  static async syncCode(
    req: Request,
    res: Response<ApiResponse<IPeerRoom>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { roomCode } = req.params;
      const userId = (req as any).user?._id?.toString() || (req as any).tokenPayload?.userId;
      const { code, language } = req.body;

      const room = await PeerRoomService.updateCodeState(roomCode, userId, code, language);

      res.status(200).json({
        success: true,
        data: room.toObject() as unknown as IPeerRoom,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateNotes(
    req: Request,
    res: Response<ApiResponse<IPeerRoom>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { roomCode } = req.params;
      const userId = (req as any).user?._id?.toString() || (req as any).tokenPayload?.userId;
      const { evaluatorNotes, dimensionRatings } = req.body;

      const room = await PeerRoomService.updateEvaluatorNotes(
        roomCode,
        userId,
        evaluatorNotes,
        dimensionRatings
      );

      res.status(200).json({
        success: true,
        data: room.toObject() as unknown as IPeerRoom,
      });
    } catch (error) {
      next(error);
    }
  }

  static async submitEvaluation(
    req: Request,
    res: Response<ApiResponse<IPeerRoom>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { roomCode } = req.params;
      const userId = (req as any).user?._id?.toString() || (req as any).tokenPayload?.userId;
      const userName = (req as any).user?.name || 'Evaluator';

      const room = await PeerRoomService.submitEvaluation(userId, userName, {
        roomCode,
        ...req.body,
      });

      res.status(200).json({
        success: true,
        data: room.toObject() as unknown as IPeerRoom,
      });
    } catch (error) {
      next(error);
    }
  }
}
