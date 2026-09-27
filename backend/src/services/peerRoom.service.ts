import crypto from 'crypto';
import { PeerRoom, IPeerRoomDocument } from '../models/PeerRoom';
import {
  IPeerRoom,
  PeerRole,
  ICreatePeerRoomRequest,
  ISubmitPeerEvaluationRequest,
  HiringVerdict,
  InterviewType,
  DifficultyLevel,
} from '@interviewpilot/shared';
import { AppError } from '../utils/errors';
import { CURATED_QUESTIONS } from './questionBank.service';

export class PeerRoomService {
  /**
   * Generates a unique readable 6-character room code (e.g. PR-8A4F)
   */
  private static generateRoomCode(): string {
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `PR-${randomHex}`;
  }

  /**
   * Create a new multiplayer peer pairing mock interview room
   */
  static async createRoom(
    userId: string,
    userName: string,
    data: ICreatePeerRoomRequest = {}
  ): Promise<IPeerRoomDocument> {
    let roomCode = this.generateRoomCode();
    // Ensure uniqueness
    while (await PeerRoom.findOne({ roomCode })) {
      roomCode = this.generateRoomCode();
    }

    const track = data.track || InterviewType.CODING;
    const difficulty = data.difficulty || DifficultyLevel.MID;
    const initialRole: PeerRole = data.initialRole || 'interviewer';

    let code = '# Peer Pairing Mock Interview Session\n\ndef solution():\n    # Implement solution here\n    pass\n';
    let currentQuestionId = data.questionId;

    if (currentQuestionId) {
      const q = CURATED_QUESTIONS.find((item) => item.id === currentQuestionId);
      if (q) {
        code = q.starterCode.python || q.starterCode.typescript || code;
      }
    }

    const room = await PeerRoom.create({
      roomCode,
      hostId: userId,
      title: data.title || `Peer Pairing: ${track.replace(/_/g, ' ')} (${difficulty})`,
      track,
      difficulty,
      currentQuestionId,
      code,
      language: 'python',
      evaluatorNotes: '',
      dimensionRatings: {
        'Problem Solving & Algorithms': 80,
        'System Architecture & Design': 80,
        'Code Quality & Execution': 80,
        'Communication & Leadership': 80,
      },
      status: 'waiting',
      participants: [
        {
          userId,
          name: userName,
          role: initialRole,
          isReady: true,
        },
      ],
    });

    return room;
  }

  /**
   * Retrieve peer room details by room code
   */
  static async getRoom(roomCode: string): Promise<IPeerRoomDocument> {
    const cleanCode = (roomCode || '').toUpperCase().trim();
    const room = await PeerRoom.findOne({ roomCode: cleanCode });
    if (!room) {
      throw new AppError(`Peer room '${cleanCode}' not found`, 404, 'ROOM_NOT_FOUND');
    }
    return room;
  }

  /**
   * Join an existing peer pairing room
   */
  static async joinRoom(
    roomCode: string,
    userId: string,
    userName: string,
    preferredRole?: PeerRole
  ): Promise<IPeerRoomDocument> {
    const room = await this.getRoom(roomCode);

    const existingIdx = room.participants.findIndex((p) => p.userId === userId);

    if (existingIdx >= 0) {
      // User is already in room, update ready status
      room.participants[existingIdx].isReady = true;
      if (preferredRole) {
        room.participants[existingIdx].role = preferredRole;
      }
    } else {
      // Determine assigned role: if room has an interviewer, assign candidate and vice-versa
      const hasInterviewer = room.participants.some((p) => p.role === 'interviewer');
      const assignedRole: PeerRole = preferredRole || (hasInterviewer ? 'candidate' : 'interviewer');

      room.participants.push({
        userId,
        name: userName,
        role: assignedRole,
        isReady: true,
      });
    }

    // If we have >= 2 participants, set status to active
    if (room.participants.length >= 2 && room.status === 'waiting') {
      room.status = 'active';
    }

    await room.save();
    return room;
  }

  /**
   * Switch role between interviewer and candidate
   */
  static async switchRole(
    roomCode: string,
    userId: string,
    newRole: PeerRole
  ): Promise<IPeerRoomDocument> {
    const room = await this.getRoom(roomCode);
    const participant = room.participants.find((p) => p.userId === userId);

    if (!participant) {
      throw new AppError('Participant not found in room', 404, 'NOT_A_PARTICIPANT');
    }

    participant.role = newRole;
    await room.save();
    return room;
  }

  /**
   * Synchronize code editor buffer and language
   */
  static async updateCodeState(
    roomCode: string,
    userId: string,
    code: string,
    language?: string
  ): Promise<IPeerRoomDocument> {
    const room = await this.getRoom(roomCode);
    const isParticipant = room.participants.some((p) => p.userId === userId);

    if (!isParticipant) {
      throw new AppError('Unauthorized: only room participants can edit code', 403, 'FORBIDDEN');
    }

    room.code = code;
    if (language) {
      room.language = language;
    }

    await room.save();
    return room;
  }

  /**
   * Update evaluator rubric notes and dimension ratings
   */
  static async updateEvaluatorNotes(
    roomCode: string,
    userId: string,
    evaluatorNotes?: string,
    dimensionRatings?: Record<string, number>
  ): Promise<IPeerRoomDocument> {
    const room = await this.getRoom(roomCode);
    const participant = room.participants.find((p) => p.userId === userId);

    if (!participant) {
      throw new AppError('Unauthorized access to evaluator rubric', 403, 'FORBIDDEN');
    }

    if (evaluatorNotes !== undefined) {
      room.evaluatorNotes = evaluatorNotes;
    }

    if (dimensionRatings) {
      room.dimensionRatings = {
        ...room.dimensionRatings,
        ...dimensionRatings,
      };
    }

    await room.save();
    return room;
  }

  /**
   * Submit final peer assessment evaluation and conclude room
   */
  static async submitEvaluation(
    userId: string,
    userName: string,
    data: ISubmitPeerEvaluationRequest
  ): Promise<IPeerRoomDocument> {
    const room = await this.getRoom(data.roomCode);
    const participant = room.participants.find((p) => p.userId === userId);

    if (!participant) {
      throw new AppError('Unauthorized: only room participants can submit evaluations', 403, 'FORBIDDEN');
    }

    const ratingValues = Object.values(data.ratings);
    const avgScore =
      ratingValues.length > 0
        ? Math.round(ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length)
        : 85;

    room.dimensionRatings = data.ratings;
    room.status = 'completed';
    room.completedEvaluation = {
      overallScore: avgScore,
      verdict: data.verdict || HiringVerdict.HIRE,
      feedback: data.feedback,
      submittedBy: userName,
      submittedAt: new Date().toISOString(),
    };

    await room.save();
    return room;
  }
}
