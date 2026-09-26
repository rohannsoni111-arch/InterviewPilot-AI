import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app';
import { InterviewType, DifficultyLevel, StrictnessMode, HiringVerdict } from '@interviewpilot/shared';

let mongoServer: MongoMemoryServer;
const app = createApp();

let candidateToken: string;
let emptyCandidateToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const candidateRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Analytics Tester',
    email: 'analytics@example.com',
    password: 'Password123!'
  });
  candidateToken = candidateRes.body.data.tokens.accessToken;

  const emptyRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Empty Candidate',
    email: 'empty@example.com',
    password: 'Password123!'
  });
  emptyCandidateToken = emptyRes.body.data.tokens.accessToken;

  // Create and evaluate 2 interview sessions
  const s1Res = await request(app)
    .post('/api/v1/interviews')
    .set('Authorization', `Bearer ${candidateToken}`)
    .send({
      type: InterviewType.SYSTEM_DESIGN,
      difficulty: DifficultyLevel.SENIOR,
      targetRole: 'Senior Distributed Systems Engineer',
      durationMinutes: 45,
      strictness: StrictnessMode.REALISTIC,
      focusTopics: ['Distributed Systems', 'Raft']
    });

  const s1Id = s1Res.body.data.id;
  await request(app).post(`/api/v1/interviews/${s1Id}/start`).set('Authorization', `Bearer ${candidateToken}`);
  await request(app).post(`/api/v1/interviews/${s1Id}/evaluate`).set('Authorization', `Bearer ${candidateToken}`);

  const s2Res = await request(app)
    .post('/api/v1/interviews')
    .set('Authorization', `Bearer ${candidateToken}`)
    .send({
      type: InterviewType.CODING,
      difficulty: DifficultyLevel.MID,
      targetRole: 'Senior Backend Engineer',
      durationMinutes: 30,
      strictness: StrictnessMode.REALISTIC,
      focusTopics: ['Algorithms', 'Concurrency']
    });

  const s2Id = s2Res.body.data.id;
  await request(app).post(`/api/v1/interviews/${s2Id}/start`).set('Authorization', `Bearer ${candidateToken}`);
  await request(app).post(`/api/v1/interviews/${s2Id}/evaluate`).set('Authorization', `Bearer ${candidateToken}`);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Dashboard Analytics Integration Tests', () => {
  it('returns baseline analytics schema for empty candidate with no completed interviews', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/analytics')
      .set('Authorization', `Bearer ${emptyCandidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hasData).toBe(false);
    expect(res.body.data.overallReadinessScore).toBeNull();
    expect(Array.isArray(res.body.data.trackCompetencies)).toBe(true);
    expect(res.body.data.trackCompetencies.length).toBe(5);
  });

  it('calculates comprehensive multi-track competencies, dimension metrics, and weakness heatmap for candidate', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/analytics')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hasData).toBe(true);
    expect(res.body.data.overallReadinessScore).toBeGreaterThanOrEqual(60);
    expect(res.body.data.completedSessions).toBe(2);
    expect(res.body.data.readinessTier).toBeDefined();

    // Check Multi-Track Competencies
    const tracks = res.body.data.trackCompetencies;
    expect(tracks.length).toBe(5);
    const systemDesignTrack = tracks.find((t: any) => t.track === 'system_design');
    expect(systemDesignTrack).toBeDefined();
    expect(systemDesignTrack.sessionsCount).toBe(1);
    expect(systemDesignTrack.score).toBeGreaterThan(0);

    const codingTrack = tracks.find((t: any) => t.track === 'coding');
    expect(codingTrack).toBeDefined();
    expect(codingTrack.sessionsCount).toBe(1);

    // Check 5-Dimensional Analytics
    const dimensions = res.body.data.dimensionAnalytics;
    expect(dimensions.length).toBe(5);
    expect(dimensions[0].dimension).toBeDefined();
    expect(dimensions[0].score).toBeGreaterThan(0);

    // Check Trajectory
    expect(Array.isArray(res.body.data.trajectory)).toBe(true);
    expect(res.body.data.trajectory.length).toBe(2);

    // Check Proctoring integrity average
    expect(res.body.data.averageIntegrityScore).toBeGreaterThanOrEqual(80);
  });
});
