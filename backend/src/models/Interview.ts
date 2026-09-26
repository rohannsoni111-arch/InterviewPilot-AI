import mongoose, { Document, Schema, Model } from 'mongoose';
import { InterviewType, DifficultyLevel, InterviewStatus, IInterviewSummary } from '@interviewpilot/shared';

export interface IInterviewDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  type: InterviewType;
  difficulty: DifficultyLevel;
  status: InterviewStatus;
  overallScore?: number;
  durationSeconds: number;
  topics: string[];
  dimensionScores?: {
    technical?: number;
    communication?: number;
    problemSolving?: number;
    systemDesign?: number;
    coding?: number;
    sql?: number;
    behavioral?: number;
  };
  feedbackSummary?: {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
  };
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  toSummaryObject(): IInterviewSummary;
}

const InterviewSchema = new Schema<IInterviewDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: Object.values(InterviewType),
      required: true,
      index: true
    },
    difficulty: {
      type: String,
      enum: Object.values(DifficultyLevel),
      default: DifficultyLevel.MID
    },
    status: {
      type: String,
      enum: Object.values(InterviewStatus),
      default: InterviewStatus.CONFIGURING,
      index: true
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    durationSeconds: {
      type: Number,
      default: 0
    },
    topics: {
      type: [String],
      default: []
    },
    dimensionScores: {
      technical: { type: Number, min: 0, max: 100 },
      communication: { type: Number, min: 0, max: 100 },
      problemSolving: { type: Number, min: 0, max: 100 },
      systemDesign: { type: Number, min: 0, max: 100 },
      coding: { type: Number, min: 0, max: 100 },
      sql: { type: Number, min: 0, max: 100 },
      behavioral: { type: Number, min: 0, max: 100 }
    },
    feedbackSummary: {
      strengths: { type: [String], default: [] },
      weaknesses: { type: [String], default: [] },
      improvements: { type: [String], default: [] }
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

InterviewSchema.methods.toSummaryObject = function (): IInterviewSummary {
  return {
    id: this._id.toString(),
    title: this.title,
    type: this.type as InterviewType,
    difficulty: this.difficulty as DifficultyLevel,
    status: this.status as InterviewStatus,
    overallScore: this.overallScore ?? undefined,
    durationSeconds: this.durationSeconds,
    topics: this.topics || [],
    completedAt: this.completedAt ? this.completedAt.toISOString() : undefined,
    createdAt: this.createdAt.toISOString()
  };
};

export const Interview: Model<IInterviewDocument> = mongoose.model<IInterviewDocument>('Interview', InterviewSchema);
