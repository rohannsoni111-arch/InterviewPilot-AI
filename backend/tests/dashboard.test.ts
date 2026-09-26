import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { Interview } from '../src/models/Interview';
import { UserRole, InterviewType, DifficultyLevel, InterviewStatus } from '@interviewpilot/shared';

describe('Candidate Dashboard API', () => {
  let mongoServer: MongoMemoryServer;
  const app = createApp();
  let candidateToken: string;
  let candidateId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Interview.deleteMany({});

    const reg = await request(app).post('/api/v1/auth/register').send({
      name: 'Jordan Lee',
      email: 'jordan@example.com',
      password: 'Password123',
      role: UserRole.CANDIDATE
    });

    candidateToken = reg.body.data.tokens.accessToken;
    candidateId = reg.body.data.user.id;
  });

  it('GET /api/v1/dashboard/summary should return empty state for new candidate', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hasData).toBe(false);
    expect(res.body.data.metrics.readinessScore).toBeNull();
    expect(res.body.data.metrics.completedInterviews).toBe(0);
    expect(res.body.data.recommendedPractice.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/dashboard/summary should compute real metrics from completed interviews', async () => {
    // Seed 2 completed interviews
    await Interview.create({
      userId: new mongoose.Types.ObjectId(candidateId),
      title: 'Distributed Systems & Concurrency',
      type: InterviewType.SYSTEM_DESIGN,
      difficulty: DifficultyLevel.SENIOR,
      status: InterviewStatus.COMPLETED,
      overallScore: 85,
      durationSeconds: 2400,
      topics: ['Redis', 'Distributed Locks', 'Kafka'],
      dimensionScores: {
        technical: 88,
        communication: 82,
        systemDesign: 85
      },
      feedbackSummary: {
        strengths: ['Strong cache invalidation strategy'],
        weaknesses: ['Redis: Under pressure, latency estimation was imprecise'],
        improvements: ['Deepened understanding of raft consensus']
      },
      completedAt: new Date(Date.now() - 86400000)
    });

    await Interview.create({
      userId: new mongoose.Types.ObjectId(candidateId),
      title: 'Algorithmic Optimization',
      type: InterviewType.CODING,
      difficulty: DifficultyLevel.SENIOR,
      status: InterviewStatus.COMPLETED,
      overallScore: 92,
      durationSeconds: 1800,
      topics: ['Dynamic Programming', 'Graph Theory'],
      dimensionScores: {
        technical: 95,
        problemSolving: 90,
        coding: 92
      },
      feedbackSummary: {
        strengths: ['Clean O(n) memoization implementation'],
        weaknesses: ['Edge Cases: Sparse graphs could have used early exit'],
        improvements: ['Refined time complexity analysis']
      },
      completedAt: new Date()
    });

    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hasData).toBe(true);
    expect(res.body.data.metrics.completedInterviews).toBe(2);
    expect(res.body.data.metrics.readinessScore).toBeGreaterThanOrEqual(85);
    expect(res.body.data.metrics.totalPracticeSeconds).toBe(4200);
    expect(res.body.data.skillBreakdown.length).toBeGreaterThan(0);
    expect(res.body.data.progressHistory.length).toBe(2);
    expect(res.body.data.recentInterviews.length).toBe(2);
    expect(res.body.data.recentWeaknesses.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/dashboard/summary without auth should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/dashboard/summary');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
