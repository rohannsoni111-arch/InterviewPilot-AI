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
  proctoringReport?: IProctoringReport;
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
  proctoringEvents?: IProctoringEvent[];
  proctoringReport?: IProctoringReport;
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

// ==========================================
// Phase 7: Resume, JD Matching & Proctoring
// ==========================================

export interface IResumeSkills {
  technical: string[];
  frameworks: string[];
  tools: string[];
  soft: string[];
}

export interface IResumeExperience {
  company: string;
  role: string;
  duration: string;
  highlights: string[];
}

export interface IResumeEducation {
  institution: string;
  degree: string;
  graduationYear?: string;
}

export interface IResumeProject {
  name: string;
  description: string;
  technologies: string[];
}

export interface IResumeParsedData {
  candidateName?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills: IResumeSkills;
  experience: IResumeExperience[];
  education: IResumeEducation[];
  projects: IResumeProject[];
}

export interface IResume {
  id: string;
  userId: string;
  title: string;
  fileName?: string;
  fileType?: string;
  rawText: string;
  parsedData: IResumeParsedData;
  createdAt: string;
  updatedAt: string;
}

export interface IResumeSummary {
  id: string;
  title: string;
  fileName?: string;
  skillsCount: number;
  topSkills: string[];
  experienceCount: number;
  createdAt: string;
}

export interface CreateResumeDto {
  title: string;
  fileName?: string;
  fileType?: string;
  rawText: string;
}

export interface IResumeMatchResult {
  matchScore: number; // 0 - 100
  targetRole: string;
  matchedSkills: string[];
  missingSkills: string[];
  strengthSummary: string;
  gapSummary: string;
  recommendedFocusTopics: string[];
  suggestedSeniority: DifficultyLevel;
  tailoredInterviewPrompts: string[];
}

export interface ResumeMatchDto {
  resumeId?: string;
  rawResumeText?: string;
  jobDescription: string;
  targetRole: string;
}

export enum ProctoringEventType {
  TAB_BLUR = 'tab_blur',
  TAB_FOCUS = 'tab_focus',
  CLIPBOARD_COPY = 'clipboard_copy',
  CLIPBOARD_PASTE = 'clipboard_paste',
  FULLSCREEN_EXIT = 'fullscreen_exit',
  SUSPICIOUS_CADENCE = 'suspicious_cadence'
}

export interface IProctoringEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  eventType: ProctoringEventType;
  severity: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export interface RecordProctoringEventDto {
  eventType: ProctoringEventType;
  severity?: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export interface IProctoringReport {
  sessionId: string;
  integrityScore: number; // 0 - 100 (100 is pristine)
  flagLevel: 'clean' | 'suspicious' | 'flagged';
  totalViolations: number;
  tabSwitchCount: number;
  pasteCount: number;
  events: IProctoringEvent[];
  summary: string;
}

// ==========================================
// Phase 8: Comprehensive Analytics & Skill Radar
// ==========================================

export interface ITrackCompetency {
  track: InterviewType;
  title: string;
  score: number;
  sessionsCount: number;
  benchmark: number;
  status: 'proficient' | 'developing' | 'needs_practice';
}

export interface IDimensionAnalytics {
  dimension: string;
  score: number;
  trend: number; // e.g. +5, -2
  status: 'exceeds' | 'meets' | 'below';
}

export interface IWeaknessHeatmapItem {
  topic: string;
  category: string;
  recurrenceCount: number;
  lastOccurredAt?: string;
  severity: 'critical' | 'moderate' | 'minor';
  remediationSuggestion: string;
}

export interface IAnalyticsResponse {
  hasData: boolean;
  overallReadinessScore: number | null;
  readinessTier: string; // 'Junior', 'Mid', 'Senior', 'Staff / Lead'
  readinessVelocityDelta: number; // e.g. +12
  estimatedTimeToTargetBar: string; // e.g. '10-14 days (3 more drills)'
  trackCompetencies: ITrackCompetency[];
  dimensionAnalytics: IDimensionAnalytics[];
  trajectory: IProgressDataPoint[];
  weaknessHeatmap: IWeaknessHeatmapItem[];
  totalSessions: number;
  completedSessions: number;
  totalPracticeHours: number;
  averageIntegrityScore: number | null;
}

// ----------------------------------------------------
// Phase 9: Real-Time Voice Studio & AI Examiner Speech
// ----------------------------------------------------

export interface IVoiceProfile {
  id: string;
  name: string;
  gender: 'female' | 'male' | 'neutral';
  accent: string;
  style: string;
  avatar: string;
  description: string;
}

export interface ITTSRequest {
  text: string;
  voiceId?: string;
  speed?: number;
  pitch?: number;
}

export interface ITTSResponse {
  audioDataUrl: string; // base64 data URI (audio/wav or audio/mp3)
  format: 'wav' | 'mp3';
  durationMs: number;
  voiceId: string;
}

export interface ISTTRequest {
  audioBase64: string;
  format?: string;
  sampleRate?: number;
}

export interface ISTTResponse {
  text: string;
  confidence: number;
  durationMs: number;
}

export interface IVoiceStudioSettings {
  enabled: boolean;
  voiceId: string;
  autoPlayTTS: boolean;
  speechRate: number;
  interimTranscription: boolean;
}

// ----------------------------------------------------
// Extension 2: Company Question Bank & FAANG Problem Studio
// ----------------------------------------------------

export interface IQuestionTestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden?: boolean;
}

export interface IQuestionBankItem {
  id: string;
  title: string;
  company: string; // 'Google', 'Meta', 'Amazon', 'Netflix', 'Stripe', 'Anthropic', 'Apple', 'Uber'
  track: InterviewType; // 'coding', 'system_design', 'sql', 'behavioral'
  difficulty: DifficultyLevel; // 'entry', 'mid', 'senior', 'staff'
  category: string;
  acceptanceRate: number; // e.g. 48 (percentage)
  frequencyScore: number; // 1 - 100
  estimatedMinutes: number;
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  starterCode: {
    python?: string;
    javascript?: string;
    typescript?: string;
    sql?: string;
  };
  hints: string[];
  testCases: IQuestionTestCase[];
  tags: string[];
}

export interface IQuestionFilter {
  company?: string;
  track?: InterviewType;
  difficulty?: DifficultyLevel;
  search?: string;
  tag?: string;
}

// ----------------------------------------------------
// Extension 3: Shareable Verified Badges & Recruiter Hub
// ----------------------------------------------------

export interface IVerifiedReportBadge {
  badgeId: string; // e.g. "IP-VERIFIED-98214"
  verificationHash: string; // SHA-256 hash string
  shareableUrl: string; // "/verify/IP-VERIFIED-98214"
  candidateName: string;
  targetRole: string;
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
  overallScore: number;
  verdict: HiringVerdict;
  integrityScore: number;
  integrityFlag: 'clean' | 'suspicious' | 'flagged';
  completedAt: string;
  issuedAt: string;
}

export interface IPublicVerifiedReport {
  badge: IVerifiedReportBadge;
  summary: string;
  strengths: string[];
  weaknesses?: string[];
  categoryBreakdown: {
    name: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
  dimensionScores?: {
    dimension: string;
    score: number;
    maxScore: number;
    status: string;
  }[];
  stagesCompleted: number;
  totalStages: number;
  durationMinutes: number;
}





