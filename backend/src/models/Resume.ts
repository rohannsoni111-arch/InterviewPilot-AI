import mongoose, { Document, Schema } from 'mongoose';
import {
  IResume,
  IResumeParsedData,
  IResumeSummary
} from '@interviewpilot/shared';

export interface IResumeDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  fileName?: string;
  fileType?: string;
  rawText: string;
  parsedData: IResumeParsedData;
  createdAt: Date;
  updatedAt: Date;
  toResumeObject(): IResume;
  toSummaryObject(): IResumeSummary;
}

const ResumeSkillsSchema = new Schema(
  {
    technical: [{ type: String, trim: true }],
    frameworks: [{ type: String, trim: true }],
    tools: [{ type: String, trim: true }],
    soft: [{ type: String, trim: true }]
  },
  { _id: false }
);

const ResumeExperienceSchema = new Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    highlights: [{ type: String, trim: true }]
  },
  { _id: false }
);

const ResumeEducationSchema = new Schema(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    graduationYear: { type: String, trim: true }
  },
  { _id: false }
);

const ResumeProjectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    technologies: [{ type: String, trim: true }]
  },
  { _id: false }
);

const ResumeParsedDataSchema = new Schema(
  {
    candidateName: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    summary: { type: String, trim: true },
    skills: { type: ResumeSkillsSchema, required: true },
    experience: [ResumeExperienceSchema],
    education: [ResumeEducationSchema],
    projects: [ResumeProjectSchema]
  },
  { _id: false }
);

const ResumeSchema = new Schema<IResumeDocument>(
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
      trim: true,
      maxlength: 120
    },
    fileName: {
      type: String,
      trim: true
    },
    fileType: {
      type: String,
      trim: true
    },
    rawText: {
      type: String,
      required: true
    },
    parsedData: {
      type: ResumeParsedDataSchema,
      required: true
    }
  },
  {
    timestamps: true
  }
);

ResumeSchema.methods.toResumeObject = function (): IResume {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    title: this.title,
    fileName: this.fileName,
    fileType: this.fileType,
    rawText: this.rawText,
    parsedData: this.parsedData,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString()
  };
};

ResumeSchema.methods.toSummaryObject = function (): IResumeSummary {
  const allSkills = [
    ...(this.parsedData?.skills?.technical || []),
    ...(this.parsedData?.skills?.frameworks || []),
    ...(this.parsedData?.skills?.tools || [])
  ];

  return {
    id: this._id.toString(),
    title: this.title,
    fileName: this.fileName,
    skillsCount: allSkills.length,
    topSkills: allSkills.slice(0, 6),
    experienceCount: this.parsedData?.experience?.length || 0,
    createdAt: this.createdAt.toISOString()
  };
};

export const Resume = mongoose.model<IResumeDocument>('Resume', ResumeSchema);
