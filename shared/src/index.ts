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
