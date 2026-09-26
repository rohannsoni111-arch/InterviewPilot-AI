// Shared types and constants for InterviewPilot AI

export enum UserRole {
  CANDIDATE = 'candidate',
  ADMIN = 'admin'
}

export enum InterviewType {
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  RESUME_DEFENSE = 'resume_defense',
  CODING = 'coding',
  SQL = 'sql',
  SYSTEM_DESIGN = 'system_design',
  MIXED = 'mixed'
}

export enum DifficultyLevel {
  ENTRY = 'entry',
  MID = 'mid',
  SENIOR = 'senior',
  STAFF = 'staff',
  PRINCIPAL = 'principal'
}

export enum InterviewStatus {
  CONFIGURING = 'configuring',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

export interface IUserProfile {
  headline?: string;
  bio?: string;
  experienceYears?: number;
  targetRoles: string[];
  targetCompanies: string[];
  skills: string[];
  location?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profile: IUserProfile;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: IUser;
  tokens: AuthTokens;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface UpdateProfileDto {
  name?: string;
  headline?: string;
  bio?: string;
  experienceYears?: number;
  targetRoles?: string[];
  targetCompanies?: string[];
  skills?: string[];
  location?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Dashboard & Analytics Types
export interface IInterviewSummary {
  id: string;
  title: string;
  type: InterviewType;
  difficulty: DifficultyLevel;
  status: InterviewStatus;
  overallScore?: number;
  durationSeconds: number;
  topics: string[];
  completedAt?: string;
  createdAt: string;
}

export interface ISkillBreakdown {
  skill: string;
  score: number; // 0-100
  benchmark: number; // e.g. 75
  assessmentsCount: number;
  status: 'proficient' | 'developing' | 'needs_practice';
}

export interface IProgressDataPoint {
  date: string;
  score: number;
  interviewType: InterviewType;
  interviewTitle: string;
}

export interface IPracticeRecommendation {
  id: string;
  topic: string;
  type: InterviewType;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedDurationMinutes: number;
}

export interface IDashboardData {
  hasData: boolean;
  user: {
    name: string;
    role: UserRole;
    headline?: string;
    targetRoles: string[];
  };
  metrics: {
    readinessScore: number | null; // 0-100 or null if no interviews
    readinessTrend: number | null; // e.g. +5% or null
    totalInterviews: number;
    completedInterviews: number;
    totalPracticeSeconds: number;
    averageScore: number | null;
  };
  skillBreakdown: ISkillBreakdown[];
  progressHistory: IProgressDataPoint[];
  recentInterviews: IInterviewSummary[];
  recentWeaknesses: {
    topic: string;
    description: string;
    frequency: number;
    severity: 'critical' | 'moderate' | 'minor';
  }[];
  recentImprovements: {
    topic: string;
    delta: number;
    description: string;
  }[];
  recommendedPractice: IPracticeRecommendation[];
}

export interface ServiceHealth {
  status: 'connected' | 'disconnected' | 'mocked' | 'reachable' | 'unreachable' | 'disabled';
  latencyMs?: number;
  message?: string;
}

export interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  environment: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    aiService?: ServiceHealth;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}
