import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app';

let mongoServer: MongoMemoryServer;
const app = createApp();
let token: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const authRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Voice Tester',
    email: 'voicetester@example.com',
    password: 'Password123!',
  });
  token = authRes.body.data.tokens.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Speech & Voice Studio API Endpoints', () => {
  describe('GET /api/v1/speech/voices', () => {
    it('should reject unauthenticated requests', async () => {
      const res = await request(app).get('/api/v1/speech/voices');
      expect(res.status).toBe(401);
    });

    it('should return available examiner vocal profiles for authenticated candidate', async () => {
      const res = await request(app)
        .get('/api/v1/speech/voices')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      expect(res.body.data[0]).toHaveProperty('id');
      expect(res.body.data[0]).toHaveProperty('name');
      expect(res.body.data[0]).toHaveProperty('style');
    });
  });

  describe('POST /api/v1/speech/tts', () => {
    it('should reject missing text parameter', async () => {
      const res = await request(app)
        .post('/api/v1/speech/tts')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should synthesize speech and return valid audio payload', async () => {
      const res = await request(app)
        .post('/api/v1/speech/tts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          text: 'Welcome to your systems architecture technical interview.',
          voiceId: 'alex-architect',
          speed: 1.0,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('audioDataUrl');
      expect(res.body.data).toHaveProperty('format');
      expect(res.body.data.durationMs).toBeGreaterThan(0);
      expect(res.body.data.voiceId).toBe('alex-architect');
    });
  });

  describe('POST /api/v1/speech/stt', () => {
    it('should reject missing audio payload', async () => {
      const res = await request(app)
        .post('/api/v1/speech/stt')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should transcribe audio base64 payload into text with confidence telemetry', async () => {
      const res = await request(app)
        .post('/api/v1/speech/stt')
        .set('Authorization', `Bearer ${token}`)
        .send({
          audioBase64: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=',
          format: 'wav',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('text');
      expect(res.body.data.confidence).toBeGreaterThan(0.5);
      expect(res.body.data.durationMs).toBeGreaterThan(0);
    });
  });
});
