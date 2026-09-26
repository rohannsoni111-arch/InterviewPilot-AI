import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app';
import { InterviewType, DifficultyLevel } from '@interviewpilot/shared';

let mongoServer: MongoMemoryServer;
const app = createApp();
let token: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const authRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Question Bank Tester',
    email: 'qbank@example.com',
    password: 'Password123!',
  });
  token = authRes.body.data.tokens.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Question Bank & FAANG Problem Track Endpoints', () => {
  describe('GET /api/v1/questions', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/questions');
      expect(res.status).toBe(401);
    });

    it('should return all curated questions with metadata', async () => {
      const res = await request(app)
        .get('/api/v1/questions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);

      const q = res.body.data[0];
      expect(q).toHaveProperty('id');
      expect(q).toHaveProperty('title');
      expect(q).toHaveProperty('company');
      expect(q).toHaveProperty('track');
      expect(q).toHaveProperty('acceptanceRate');
    });

    it('should filter questions by company', async () => {
      const res = await request(app)
        .get('/api/v1/questions?company=Google')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((q: any) => q.company.toLowerCase() === 'google')).toBe(true);
    });

    it('should filter questions by track', async () => {
      const res = await request(app)
        .get(`/api/v1/questions?track=${InterviewType.SYSTEM_DESIGN}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((q: any) => q.track === InterviewType.SYSTEM_DESIGN)).toBe(true);
    });
  });

  describe('GET /api/v1/questions/:id', () => {
    it('should return 404 for invalid question ID', async () => {
      const res = await request(app)
        .get('/api/v1/questions/non-existing-id')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return complete problem specification including starter code and hints', async () => {
      const res = await request(app)
        .get('/api/v1/questions/goog-001')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('goog-001');
      expect(res.body.data.title).toContain('Ring Buffer');
      expect(res.body.data.starterCode).toHaveProperty('python');
    });
  });

  describe('POST /api/v1/questions/:id/launch', () => {
    it('should initialize live interview session pre-seeded with question', async () => {
      const res = await request(app)
        .post('/api/v1/questions/goog-001/launch')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toContain('Google - Distributed Lock-Free Ring Buffer');
      expect(res.body.data.status).toBe('in_progress');
      expect(res.body.data.stages.length).toBe(4);
      expect(res.body.data.messages.length).toBeGreaterThanOrEqual(1);
    });
  });
});
