import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app';
import {
  InterviewType,
  DifficultyLevel,
  StrictnessMode,
  InterviewStatus,
  HiringVerdict,
} from '@interviewpilot/shared';
import { Interview } from '../src/models/Interview';

let mongoServer: MongoMemoryServer;
const app = createApp();
let token: string;
let candidateId: string;
let completedSessionId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const authRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Verified Candidate',
    email: 'verified@example.com',
    password: 'Password123!',
  });
  token = authRes.body.data.tokens.accessToken;
  candidateId = authRes.body.data.user.id;

  // Create completed session with evaluation report
  const session = await Interview.create({
    userId: new mongoose.Types.ObjectId(candidateId),
    title: 'Senior Systems Architect Assessment',
    type: InterviewType.SYSTEM_DESIGN,
    difficulty: DifficultyLevel.SENIOR,
    targetRole: 'Senior Systems Architect',
    durationMinutes: 45,
    strictness: StrictnessMode.REALISTIC,
    focusTopics: ['Distributed Systems', 'Kafka'],
    status: InterviewStatus.COMPLETED,
    completedAt: new Date(),
    proctoringReport: {
      integrityScore: 98,
      flags: [],
      violationsCount: 0,
      totalFocusLossSeconds: 0,
      summary: 'Session integrity verified.',
    },
    evaluationReport: {
      overallScore: 92,
      verdict: HiringVerdict.STRONG_HIRE,
      summary: 'Outstanding architectural mastery and concise trade-off explanations.',
      strengths: ['Clear system partitioning', 'Precise capacity estimation'],
      weaknesses: ['Could discuss database failover lag in more detail'],
      dimensionScores: [
        { dimension: 'System Design', score: 94, maxScore: 100, feedback: 'Superb architecture.', status: 'exceeds' },
        { dimension: 'Communication', score: 90, maxScore: 100, feedback: 'Very articulate.', status: 'meets' },
      ],
      stageEvaluations: [],
      actionPlan: ['Keep practicing'],
      generatedAt: new Date().toISOString(),
    },
  });
  completedSessionId = session._id.toString();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Cryptographic Verification & Public Recruiter Hub API', () => {
  let generatedBadgeId: string;

  describe('POST /api/v1/interviews/:id/verify-badge', () => {
    it('should reject unauthenticated badge creation', async () => {
      const res = await request(app).post(`/api/v1/interviews/${completedSessionId}/verify-badge`);
      expect(res.status).toBe(401);
    });

    it('should generate deterministic cryptographic SHA-256 certificate badge for completed session', async () => {
      const res = await request(app)
        .post(`/api/v1/interviews/${completedSessionId}/verify-badge`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('badgeId');
      expect(res.body.data.badgeId).toMatch(/^IP-V/);
      expect(res.body.data).toHaveProperty('verificationHash');
      expect(res.body.data.verificationHash.length).toBe(64); // SHA-256 hex length
      expect(res.body.data.overallScore).toBe(92);
      expect(res.body.data.verdict).toBe(HiringVerdict.STRONG_HIRE);
      expect(res.body.data.candidateName).toBe('Verified Candidate');

      generatedBadgeId = res.body.data.badgeId;
    });
  });

  describe('GET /api/v1/verify/:badgeId', () => {
    it('should return public verified candidate assessment without requiring auth', async () => {
      const res = await request(app).get(`/api/v1/verify/${generatedBadgeId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('badge');
      expect(res.body.data.badge.badgeId).toBe(generatedBadgeId);
      expect(res.body.data.badge.overallScore).toBe(92);
      expect(res.body.data.badge.verdict).toBe(HiringVerdict.STRONG_HIRE);
      expect(res.body.data).toHaveProperty('summary');
      expect(res.body.data).toHaveProperty('strengths');
      expect(res.body.data).toHaveProperty('categoryBreakdown');
    });
  });
});
