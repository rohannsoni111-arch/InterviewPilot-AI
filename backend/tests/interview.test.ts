import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { Interview } from '../src/models/Interview';
import {
  UserRole,
  InterviewType,
  DifficultyLevel,
  StrictnessMode,
  InterviewStatus
} from '@interviewpilot/shared';

describe('Interview Configuration & Session API', () => {
  let mongoServer: MongoMemoryServer;
  const app = createApp();
  let candidateToken: string;
  let candidateId: string;
  let otherCandidateToken: string;
  let adminToken: string;

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

    // Candidate A
    const regA = await request(app).post('/api/v1/auth/register').send({
      name: 'Alice Dev',
      email: 'alice@example.com',
      password: 'Password123',
      role: UserRole.CANDIDATE
    });
    candidateToken = regA.body.data.tokens.accessToken;
    candidateId = regA.body.data.user.id;

    // Candidate B
    const regB = await request(app).post('/api/v1/auth/register').send({
      name: 'Bob Peer',
      email: 'bob@example.com',
      password: 'Password123',
      role: UserRole.CANDIDATE
    });
    otherCandidateToken = regB.body.data.tokens.accessToken;

    // Admin
    const regAdmin = await request(app).post('/api/v1/auth/register').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Password123',
      role: UserRole.ADMIN
    });
    adminToken = regAdmin.body.data.tokens.accessToken;
  });

  it('POST /api/v1/interviews creates a session and auto-generates adaptive stages', async () => {
    const payload = {
      type: InterviewType.SYSTEM_DESIGN,
      difficulty: DifficultyLevel.SENIOR,
      targetRole: 'Staff Infrastructure Architect',
      durationMinutes: 45,
      focusTopics: ['Distributed Caching', 'Event Sourcing', 'Kafka'],
      strictness: StrictnessMode.HARD,
      jobDescription: 'Seeking an architect to scale high-throughput payment pipelines.'
    };

    const res = await request(app)
      .post('/api/v1/interviews')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.targetRole).toBe('Staff Infrastructure Architect');
    expect(res.body.data.durationMinutes).toBe(45);
    expect(res.body.data.strictness).toBe(StrictnessMode.HARD);
    expect(res.body.data.status).toBe(InterviewStatus.CONFIGURING);
    expect(res.body.data.stages.length).toBe(4);
    expect(res.body.data.stages[0].order).toBe(1);
    expect(res.body.data.stages[0].status).toBe('pending');
  });

  it('POST /api/v1/interviews supports all 7 interview types with tailored stages', async () => {
    const types = [
      InterviewType.TECHNICAL,
      InterviewType.BEHAVIORAL,
      InterviewType.RESUME_DEFENSE,
      InterviewType.CODING,
      InterviewType.SQL,
      InterviewType.SYSTEM_DESIGN,
      InterviewType.MIXED
    ];

    for (const type of types) {
      const res = await request(app)
        .post('/api/v1/interviews')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          type,
          difficulty: DifficultyLevel.MID,
          targetRole: 'Backend Engineer',
          durationMinutes: 30,
          focusTopics: ['Core Fundamentals'],
          strictness: StrictnessMode.REALISTIC
        });

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBe(type);
      expect(res.body.data.stages.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('POST /api/v1/interviews validates duration bounds (15-60 min)', async () => {
    const resLow = await request(app)
      .post('/api/v1/interviews')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        type: InterviewType.CODING,
        difficulty: DifficultyLevel.MID,
        targetRole: 'Software Engineer',
        durationMinutes: 10, // below 15 min minimum
        focusTopics: ['Algorithms'],
        strictness: StrictnessMode.REALISTIC
      });

    expect(resLow.status).toBe(400);

    const resHigh = await request(app)
      .post('/api/v1/interviews')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        type: InterviewType.CODING,
        difficulty: DifficultyLevel.MID,
        targetRole: 'Software Engineer',
        durationMinutes: 90, // above 60 min maximum
        focusTopics: ['Algorithms'],
        strictness: StrictnessMode.REALISTIC
      });

    expect(resHigh.status).toBe(400);
  });

  it('POST /api/v1/interviews rejects empty focus topics', async () => {
    const res = await request(app)
      .post('/api/v1/interviews')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        type: InterviewType.TECHNICAL,
        difficulty: DifficultyLevel.MID,
        targetRole: 'Software Engineer',
        durationMinutes: 30,
        focusTopics: [],
        strictness: StrictnessMode.REALISTIC
      });

    expect(res.status).toBe(400);
  });

  it('GET /api/v1/interviews/:id fetches session details', async () => {
    const createRes = await request(app)
      .post('/api/v1/interviews')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        type: InterviewType.CODING,
        difficulty: DifficultyLevel.SENIOR,
        targetRole: 'Full Stack Engineer',
        durationMinutes: 45,
        focusTopics: ['Trees', 'Graphs'],
        strictness: StrictnessMode.REALISTIC
      });

    const interviewId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/v1/interviews/${interviewId}`)
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(interviewId);
    expect(res.body.data.targetRole).toBe('Full Stack Engineer');
  });

  it('GET /api/v1/interviews lists sessions with pagination and filters', async () => {
    // Create 3 interviews for candidate
    await request(app)
      .post('/api/v1/interviews')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        type: InterviewType.CODING,
        difficulty: DifficultyLevel.ENTRY,
        targetRole: 'Junior Dev',
        durationMinutes: 30,
        focusTopics: ['Arrays'],
        strictness: StrictnessMode.FRIENDLY
      });

    await request(app)
      .post('/api/v1/interviews')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        type: InterviewType.BEHAVIORAL,
        difficulty: DifficultyLevel.MID,
        targetRole: 'Mid Dev',
        durationMinutes: 30,
        focusTopics: ['Leadership'],
        strictness: StrictnessMode.REALISTIC
      });

    const listRes = await request(app)
      .get('/api/v1/interviews?limit=10&page=1')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.total).toBe(2);
    expect(listRes.body.data.interviews.length).toBe(2);

    // Filter by type
    const filterRes = await request(app)
      .get(`/api/v1/interviews?type=${InterviewType.CODING}`)
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(filterRes.status).toBe(200);
    expect(filterRes.body.data.total).toBe(1);
    expect(filterRes.body.data.interviews[0].type).toBe(InterviewType.CODING);
  });

  it('PATCH /api/v1/interviews/:id/status updates session status', async () => {
    const createRes = await request(app)
      .post('/api/v1/interviews')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        type: InterviewType.TECHNICAL,
        difficulty: DifficultyLevel.MID,
        targetRole: 'Backend Engineer',
        durationMinutes: 30,
        focusTopics: ['Node.js'],
        strictness: StrictnessMode.REALISTIC
      });

    const interviewId = createRes.body.data.id;

    const patchRes = await request(app)
      .patch(`/api/v1/interviews/${interviewId}/status`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({ status: InterviewStatus.IN_PROGRESS });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.status).toBe(InterviewStatus.IN_PROGRESS);
  });

  it('DELETE /api/v1/interviews/:id removes session', async () => {
    const createRes = await request(app)
      .post('/api/v1/interviews')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        type: InterviewType.SQL,
        difficulty: DifficultyLevel.MID,
        targetRole: 'Data Engineer',
        durationMinutes: 30,
        focusTopics: ['PostgreSQL'],
        strictness: StrictnessMode.REALISTIC
      });

    const interviewId = createRes.body.data.id;

    const delRes = await request(app)
      .delete(`/api/v1/interviews/${interviewId}`)
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(delRes.status).toBe(200);

    const getRes = await request(app)
      .get(`/api/v1/interviews/${interviewId}`)
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(getRes.status).toBe(404);
  });

  it('Authorization: Candidate cannot access or delete other users sessions, but Admin can', async () => {
    const createRes = await request(app)
      .post('/api/v1/interviews')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        type: InterviewType.CODING,
        difficulty: DifficultyLevel.SENIOR,
        targetRole: 'Lead Engineer',
        durationMinutes: 30,
        focusTopics: ['Algorithms'],
        strictness: StrictnessMode.RUTHLESS_FAANG
      });

    const interviewId = createRes.body.data.id;

    // Bob tries to get Alice's interview -> 403 Forbidden
    const bobGetRes = await request(app)
      .get(`/api/v1/interviews/${interviewId}`)
      .set('Authorization', `Bearer ${otherCandidateToken}`);

    expect(bobGetRes.status).toBe(403);

    // Bob tries to delete Alice's interview -> 403 Forbidden
    const bobDelRes = await request(app)
      .delete(`/api/v1/interviews/${interviewId}`)
      .set('Authorization', `Bearer ${otherCandidateToken}`);

    expect(bobDelRes.status).toBe(403);

    // Admin can get Alice's interview -> 200 OK
    const adminGetRes = await request(app)
      .get(`/api/v1/interviews/${interviewId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminGetRes.status).toBe(200);
    expect(adminGetRes.body.data.id).toBe(interviewId);
  });
});
