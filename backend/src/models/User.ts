import mongoose, { Document, Schema, Model } from 'mongoose';
import { UserRole, IUser, IUserProfile } from '@interviewpilot/shared';

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  profile: IUserProfile;
  refreshTokens: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  toSafeObject(): IUser;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    headline: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, default: '' },
    experienceYears: { type: Number, min: 0, default: 0 },
    targetRoles: { type: [String], default: [] },
    targetCompanies: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    location: { type: String, trim: true, default: '' },
    githubUrl: { type: String, trim: true, default: '' },
    linkedinUrl: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CANDIDATE,
      index: true
    },
    profile: {
      type: UserProfileSchema,
      default: () => ({
        headline: '',
        bio: '',
        experienceYears: 0,
        targetRoles: [],
        targetCompanies: [],
        skills: [],
        location: '',
        githubUrl: '',
        linkedinUrl: ''
      })
    },
    refreshTokens: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

UserSchema.methods.toSafeObject = function (): IUser {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    role: this.role as UserRole,
    profile: this.profile || {
      targetRoles: [],
      targetCompanies: [],
      skills: []
    },
    isActive: this.isActive,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString()
  };
};

export const User: Model<IUserDocument> = mongoose.model<IUserDocument>('User', UserSchema);
