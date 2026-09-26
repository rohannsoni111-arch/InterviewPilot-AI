import mongoose, { Document, Schema, Model } from 'mongoose';
import {
  InterviewType,
  DifficultyLevel,
  InterviewStatus,
  StrictnessMode,
  IInterviewStage,
  IInterviewMessage,
  IInterviewSession,
  IInterviewSummary,
  IInterviewEvaluationReport,
  IProctoringEvent,
  IProctoringReport
} from '@interviewpilot/shared';

export interface IInterviewDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  type: InterviewType;
  difficulty: DifficultyLevel;
  targetRole: string;
  durationMinutes: number;
  durationSeconds: number;
  strictness: StrictnessMode;
  status: InterviewStatus;
  topics: string[];
  focusTopics: string[];
  jobDescription?: string;
  resumeId?: string;
  customInstructions?: string;
  stages: IInterviewStage[];
  currentStageIndex: number;
  messages: IInterviewMessage[];
  overallScore?: number;
  evaluationReport?: IInterviewEvaluationReport;
  proctoringEvents?: IProctoringEvent[];
  proctoringReport?: IProctoringReport;
  dimensionScores?: {
    technical?: number;
    communication?: number;
    problemSolving?: number;
    systemDesign?: number;
    coding?: number;
    sql?: number;
    behavioral?: number;
    [key: string]: number | undefined;
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
  toSessionObject(): IInterviewSession;
}

const MessageSchema = new Schema<IInterviewMessage>(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ['interviewer', 'candidate', 'system'], required: true },
    content: { type: String, required: true },
    stageId: { type: String },
    stageIndex: { type: Number },
    timestamp: { type: String, required: true },
    suggestedFollowUps: { type: [String], default: [] }
  },
  { _id: false }
);

const StageSchema = new Schema<IInterviewStage>(

  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    order: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'skipped'],
      default: 'pending'
    }
  },
  { _id: false }
);

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
    targetRole: {
      type: String,
      required: true,
      default: 'Software Engineer',
      trim: true
    },
    durationMinutes: {
      type: Number,
      required: true,
      default: 30,
      min: 15,
      max: 60
    },
    durationSeconds: {
      type: Number,
      default: 0
    },
    strictness: {
      type: String,
      enum: Object.values(StrictnessMode),
      default: StrictnessMode.REALISTIC
    },
    status: {
      type: String,
      enum: Object.values(InterviewStatus),
      default: InterviewStatus.CONFIGURING,
      index: true
    },
    topics: {
      type: [String],
      default: []
    },
    focusTopics: {
      type: [String],
      default: []
    },
    jobDescription: {
      type: String,
      trim: true
    },
    resumeId: {
      type: String,
      trim: true
    },
    customInstructions: {
      type: String,
      trim: true
    },
    stages: {
      type: [StageSchema],
      default: []
    },
    currentStageIndex: {
      type: Number,
      default: 0
    },
    messages: {
      type: [MessageSchema],
      default: []
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },

    evaluationReport: {
      type: Schema.Types.Mixed,
      default: null
    },
    proctoringEvents: {
      type: [
        {
          id: { type: String, required: true },
          sessionId: { type: String, required: true },
          timestamp: { type: String, required: true },
          eventType: { type: String, required: true },
          severity: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
          metadata: { type: Schema.Types.Mixed }
        }
      ],
      default: []
    },
    proctoringReport: {
      type: Schema.Types.Mixed,
      default: null
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
    targetRole: this.targetRole,
    status: this.status as InterviewStatus,
    overallScore: this.overallScore ?? undefined,
    verdict: this.evaluationReport?.verdict,
    durationSeconds: this.durationSeconds,
    topics: (this.focusTopics && this.focusTopics.length > 0) ? this.focusTopics : (this.topics || []),
    evaluationReport: this.evaluationReport || undefined,
    completedAt: this.completedAt ? this.completedAt.toISOString() : undefined,
    createdAt: this.createdAt.toISOString()
  };
};

InterviewSchema.methods.toSessionObject = function (): IInterviewSession {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    title: this.title,
    type: this.type as InterviewType,
    difficulty: this.difficulty as DifficultyLevel,
    targetRole: this.targetRole,
    durationMinutes: this.durationMinutes,
    durationSeconds: this.durationSeconds,
    strictness: this.strictness as StrictnessMode,
    status: this.status as InterviewStatus,
    focusTopics: this.focusTopics || this.topics || [],
    jobDescription: this.jobDescription,
    resumeId: this.resumeId,
    customInstructions: this.customInstructions,
    stages: this.stages || [],
    currentStageIndex: this.currentStageIndex || 0,
    messages: this.messages || [],
    overallScore: this.overallScore ?? undefined,
    evaluationReport: this.evaluationReport || undefined,
    proctoringEvents: this.proctoringEvents || [],
    proctoringReport: this.proctoringReport || undefined,
    dimensionScores: this.dimensionScores ? JSON.parse(JSON.stringify(this.dimensionScores)) : undefined,
    feedbackSummary: this.feedbackSummary ? {
      strengths: this.feedbackSummary.strengths || [],
      weaknesses: this.feedbackSummary.weaknesses || [],
      improvements: this.feedbackSummary.improvements || []
    } : undefined,
    completedAt: this.completedAt ? this.completedAt.toISOString() : undefined,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString()
  };
};

export const Interview: Model<IInterviewDocument> = mongoose.model<IInterviewDocument>('Interview', InterviewSchema);

