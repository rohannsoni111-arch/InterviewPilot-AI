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

export enum StrictnessMode {
  FRIENDLY = 'friendly',
  REALISTIC = 'realistic',
  HARD = 'hard',
  RUTHLESS_FAANG = 'ruthless_faang'
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

// Interview Configuration & Session Types
export interface IInterviewStage {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  order: number;
  status: 'pending' | 'active' | 'completed' | 'skipped';
}

export interface CreateInterviewDto {
  title?: string;
  type: InterviewType;
  difficulty: DifficultyLevel;
  targetRole: string;
  durationMinutes: number; // 15, 30, 45, 60
  focusTopics: string[];
  strictness: StrictnessMode;
  jobDescription?: string;
  resumeId?: string;
  customInstructions?: string;
}

export enum SupportedLanguage {
  PYTHON = 'python',
  JAVASCRIPT = 'javascript',
  TYPESCRIPT = 'typescript',
  JAVA = 'java',
  CPP = 'cpp',
  GO = 'go',
  SQL = 'sql'
}

export interface ICodeTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  executionTimeMs?: number;
  error?: string;
}

export interface ICodeSnippet {
  code: string;
  language: SupportedLanguage;
  testCases?: ICodeTestCase[];
  lastExecutedAt?: string;
}

export interface CodeExecutionRequest {
  code: string;
  language: SupportedLanguage;
  testCases?: ICodeTestCase[];
  customInput?: string;
}

export interface CodeExecutionResult {
  success: boolean;
  stdout?: string;
  stderr?: string;
  executionTimeMs: number;
  memoryUsageKb?: number;
  testResults?: ICodeTestCase[];
  allPassed?: boolean;
  error?: string;
}

export interface CodeReviewRequest {
  code: string;
  language: SupportedLanguage;
  problemContext?: string;
  sessionId?: string;
  stageId?: string;
}

export interface CodeReviewResponse {
  verdict: 'optimal' | 'needs_improvement' | 'bug_detected' | 'syntax_error';
  summary: string;
  timeComplexity: string;
  spaceComplexity: string;
  keyInsights: string[];
  edgeCaseWarnings: string[];
  suggestedRefactoring?: string;
}

export interface IAudioSettings {
  ttsEnabled: boolean;
  speechRate: number; // 0.75 to 1.5
  speechPitch: number; // 0.8 to 1.2
  preferredVoice?: string;
  sttLanguage: string;
  autoReadResponse: boolean;
}

export interface IInterviewMessage {
  id: string;
  role: 'interviewer' | 'candidate' | 'system';
  content: string;
  stageId?: string;
  stageIndex?: number;
  timestamp: string;
  suggestedFollowUps?: string[];
  codeSnippet?: ICodeSnippet;
  codeReview?: CodeReviewResponse;
}

export interface InterviewTurnDto {
  content: string;
  codeSnippet?: ICodeSnippet;
}

export interface InterviewTurnResponse {
  message: IInterviewMessage;
  session: IInterviewSession;
  stageAdvanced?: boolean;
  stageCompleted?: boolean;
  sessionCompleted?: boolean;
}

export enum HiringVerdict {
  STRONG_HIRE = 'strong_hire',
  HIRE = 'hire',
  LEAN_HIRE = 'lean_hire',
  LEAN_NO_HIRE = 'lean_no_hire',
  NO_HIRE = 'no_hire'
}

export interface IDimensionScore {
  dimension: string;
  score: number;
  maxScore: number;
  feedback: string;
  status: 'exceeds' | 'meets' | 'below';
}

export interface IStageEvaluation {
  stageId: string;
  stageTitle: string;
  score: number;
  feedback: string;
  keyObservations: string[];
  strengths: string[];
  areasForImprovement: string[];
}

export interface IInterviewEvaluationReport {
  overallScore: number;
  verdict: HiringVerdict;
  summary: string;
  dimensionScores: IDimensionScore[];
  stageEvaluations: IStageEvaluation[];
  strengths: string[];
  weaknesses: string[];
  actionPlan: string[];
  generatedAt: string;
}

export interface IInterviewSession {
  id: string;
  userId: string;
  title: string;
  type: InterviewType;
  difficulty: DifficultyLevel;
  targetRole: string;
  durationMinutes: number;
  durationSeconds: number;
  strictness: StrictnessMode;
  status: InterviewStatus;
  focusTopics: string[];
  jobDescription?: string;
  resumeId?: string;
  customInstructions?: string;
  stages: IInterviewStage[];
  currentStageIndex: number;
  messages?: IInterviewMessage[];
  overallScore?: number;
  dimensionScores?: Record<string, number>;
  evaluationReport?: IInterviewEvaluationReport;
  feedbackSummary?: {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
  };
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IInterviewSummary {
  id: string;
  title: string;
  type: InterviewType;
  difficulty: DifficultyLevel;
  targetRole?: string;
  status: InterviewStatus;
  overallScore?: number;
  verdict?: HiringVerdict;
  durationSeconds: number;
  topics: string[];
  evaluationReport?: IInterviewEvaluationReport;
  completedAt?: string;
  createdAt: string;
}

export interface ISkillBreakdown {
  skill: string;
  score: number;
  benchmark: number;
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
    readinessScore: number | null;
    readinessTrend: number | null;
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
