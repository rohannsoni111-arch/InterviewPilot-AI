import mongoose, { Schema, Document, Model } from 'mongoose';
import {
  IPeerRoom,
  IPeerParticipant,
  InterviewType,
  DifficultyLevel,
  HiringVerdict,
} from '@interviewpilot/shared';

export interface IPeerRoomDocument extends Document, Omit<IPeerRoom, 'roomCode'> {
  roomCode: string;
  updatedAt: Date;
}

const PeerParticipantSchema = new Schema<IPeerParticipant>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['interviewer', 'candidate'], required: true },
    isReady: { type: Boolean, default: false },
    socketId: { type: String },
  },
  { _id: false }
);

const PeerRoomSchema = new Schema<IPeerRoomDocument>(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    hostId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Peer Mock Technical Interview',
    },
    track: {
      type: String,
      enum: Object.values(InterviewType),
      default: InterviewType.CODING,
    },
    difficulty: {
      type: String,
      enum: Object.values(DifficultyLevel),
      default: DifficultyLevel.MID,
    },
    participants: {
      type: [PeerParticipantSchema],
      default: [],
    },
    currentQuestionId: {
      type: String,
    },
    code: {
      type: String,
      default: '# Peer Pairing Session - Candidate Starter Code\n\ndef solution():\n    # Implement solution here\n    pass\n',
    },
    language: {
      type: String,
      default: 'python',
    },
    evaluatorNotes: {
      type: String,
      default: '',
    },
    dimensionRatings: {
      type: Schema.Types.Mixed,
      default: {
        'Problem Solving & Algorithms': 80,
        'System Architecture & Design': 80,
        'Code Quality & Execution': 80,
        'Communication & Leadership': 80,
      },
    },
    status: {
      type: String,
      enum: ['waiting', 'active', 'completed'],
      default: 'waiting',
      index: true,
    },
    completedEvaluation: {
      overallScore: { type: Number },
      verdict: { type: String, enum: Object.values(HiringVerdict) },
      feedback: { type: String },
      submittedBy: { type: String },
      submittedAt: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export const PeerRoom: Model<IPeerRoomDocument> = mongoose.model<IPeerRoomDocument>(
  'PeerRoom',
  PeerRoomSchema
);
