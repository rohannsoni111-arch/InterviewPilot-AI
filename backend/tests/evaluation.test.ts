import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app';
import { InterviewType, DifficultyLevel, StrictnessMode, InterviewStatus } from '@interviewpilot/shared';

let mongoServer: MongoMemoryServer;
const app = createApp();

let candidateToken: string;
let otherCandidateToken: string;
let sessionId: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const candidateRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Eval Candidate',
    email: 'eval@example.com',
    password: 'Password123!'
  });
  candidateToken = candidateRes.body.data.tokens.accessToken;

  const otherRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Other Candidate',
    email: 'other@example.com',
    password: 'Password123!'
  });
  otherCandidateToken = otherRes.body.data.tokens.accessToken;

  // Create an interview session
  const sessionRes = await request(app)
    .post('/api/v1/interviews')
    .set('Authorization', `Bearer ${candidateToken}`)
    .send({
      type: InterviewType.CODING,
      difficulty: DifficultyLevel.SENIOR,
      targetRole: 'Senior Backend Engineer',
      durationMinutes: 30,
      strictness: StrictnessMode.REALISTIC,
      focusTopics: ['Concurrency', 'Redis']
    });

  sessionId = sessionRes.body.data.id;

  // Start session and send candidate turn
  await request(app)
    .post(`/api/v1/interviews/${sessionId}/start`)
    .set('Authorization', `Bearer ${candidateToken}`);

  await request(app)
    .post(`/api/v1/interviews/${sessionId}/turn`)
    .set('Authorization', `Bearer ${candidateToken}`)
    .send({
      content: 'I would use Redis distributed locks with a redlock algorithm to ensure mutual exclusion across multiple instances.'
    });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Post-Interview Evaluation API', () => {
  it('rejects unauthenticated requests to evaluate interview', async () => {
    const res = await request(app).post(`/api/v1/interviews/${sessionId}/evaluate`);
    expect(res.status).toBe(401);
  });

  it('rejects evaluation from unauthorized user', async () => {
    const res = await request(app)
      .post(`/api/v1/interviews/${sessionId}/evaluate`)
      .set('Authorization', `Bearer ${otherCandidateToken}`);
    expect(res.status).toBe(403);
  });

  it('evaluates interview session and generates report', async () => {
    const res = await request(app)
      .post(`/api/v1/interviews/${sessionId}/evaluate`)
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.report).toBeDefined();
    expect(res.body.data.report.overallScore).toBeGreaterThanOrEqual(50);
    expect(res.body.data.report.verdict).toBeDefined();
    expect(res.body.data.report.dimensionScores.length).toBe(5);
    expect(res.body.data.report.stageEvaluations.length).toBeGreaterThan(0);
    expect(res.body.data.session.status).toBe(InterviewStatus.COMPLETED);
  });

  it('retrieves evaluation report via GET /api/v1/interviews/:id/report', async () => {
    const res = await request(app)
      .get(`/api/v1/interviews/${sessionId}/report`)
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overallScore).toBeDefined();
    expect(res.body.data.verdict).toBeDefined();
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.dimensionScores).toBeDefined();
  });
});
