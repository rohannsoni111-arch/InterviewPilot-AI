import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app';
import {
  InterviewType,
  DifficultyLevel,
  HiringVerdict,
} from '@interviewpilot/shared';

let mongoServer: MongoMemoryServer;
const app = createApp();
let tokenA: string;
let tokenB: string;
let createdRoomCode: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Register User A (Host / Interviewer)
  const authResA = await request(app).post('/api/v1/auth/register').send({
    name: 'Alice Host',
    email: 'alice.host@example.com',
    password: 'Password123!',
  });
  tokenA = authResA.body.data.tokens.accessToken;

  // Register User B (Peer Candidate)
  const authResB = await request(app).post('/api/v1/auth/register').send({
    name: 'Bob Peer',
    email: 'bob.peer@example.com',
    password: 'Password123!',
  });
  tokenB = authResB.body.data.tokens.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Multiplayer Peer Pairing & Mock Interview Studio API', () => {
  describe('POST /api/v1/peer-rooms', () => {
    it('should create a new peer pairing room with unique room code', async () => {
      const res = await request(app)
        .post('/api/v1/peer-rooms')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Distributed Systems & Concurrency Mock Round',
          track: InterviewType.CODING,
          difficulty: DifficultyLevel.SENIOR,
          initialRole: 'interviewer',
          questionId: 'goog-001',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('roomCode');
      expect(res.body.data.roomCode).toMatch(/^PR-[A-Z0-9]{4}$/);
      expect(res.body.data.track).toBe(InterviewType.CODING);
      expect(res.body.data.difficulty).toBe(DifficultyLevel.SENIOR);
      expect(res.body.data.status).toBe('waiting');
      expect(res.body.data.participants.length).toBe(1);
      expect(res.body.data.participants[0].role).toBe('interviewer');
      expect(res.body.data.code).toContain('LockFreeRingBuffer');

      createdRoomCode = res.body.data.roomCode;
    });

    it('should reject unauthenticated room creation', async () => {
      const res = await request(app).post('/api/v1/peer-rooms').send({});
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/peer-rooms/:roomCode', () => {
    it('should retrieve room state by room code', async () => {
      const res = await request(app).get(`/api/v1/peer-rooms/${createdRoomCode}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roomCode).toBe(createdRoomCode);
      expect(res.body.data.title).toBe('Distributed Systems & Concurrency Mock Round');
    });

    it('should return 404 for non-existent room code', async () => {
      const res = await request(app).get('/api/v1/peer-rooms/PR-NONEXIST');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/peer-rooms/:roomCode/join', () => {
    it('should allow second candidate to join room and activate session', async () => {
      const res = await request(app)
        .post(`/api/v1/peer-rooms/${createdRoomCode}/join`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          preferredRole: 'candidate',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.participants.length).toBe(2);
      expect(res.body.data.status).toBe('active');
      expect(res.body.data.participants.some((p: any) => p.name === 'Bob Peer')).toBe(true);
    });
  });

  describe('POST /api/v1/peer-rooms/:roomCode/role', () => {
    it('should allow participant to switch role', async () => {
      const res = await request(app)
        .post(`/api/v1/peer-rooms/${createdRoomCode}/role`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          role: 'interviewer',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const bob = res.body.data.participants.find((p: any) => p.name === 'Bob Peer');
      expect(bob?.role).toBe('interviewer');
    });
  });

  describe('POST /api/v1/peer-rooms/:roomCode/sync-code', () => {
    it('should sync live code editor buffer across participants', async () => {
      const updatedCode = `class LockFreeRingBuffer:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.buffer = [None] * capacity\n`;

      const res = await request(app)
        .post(`/api/v1/peer-rooms/${createdRoomCode}/sync-code`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          code: updatedCode,
          language: 'python',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.code).toBe(updatedCode);
    });
  });

  describe('POST /api/v1/peer-rooms/:roomCode/notes', () => {
    it('should update evaluator rubric notes and dimension scores', async () => {
      const res = await request(app)
        .post(`/api/v1/peer-rooms/${createdRoomCode}/notes`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          evaluatorNotes: 'Candidate demonstrated clear lock-free synchronization understanding.',
          dimensionRatings: {
            'Problem Solving & Algorithms': 92,
            'Code Quality & Execution': 88,
          },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.evaluatorNotes).toContain('Candidate demonstrated clear');
      expect(res.body.data.dimensionRatings['Problem Solving & Algorithms']).toBe(92);
    });
  });

  describe('POST /api/v1/peer-rooms/:roomCode/evaluate', () => {
    it('should submit final peer assessment evaluation and conclude room', async () => {
      const res = await request(app)
        .post(`/api/v1/peer-rooms/${createdRoomCode}/evaluate`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          ratings: {
            'Problem Solving & Algorithms': 90,
            'System Architecture & Design': 92,
            'Code Quality & Execution': 88,
            'Communication & Leadership': 94,
          },
          feedback: 'Excellent problem breakdown, structured concurrency model, and clean execution.',
          verdict: HiringVerdict.STRONG_HIRE,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.completedEvaluation).toHaveProperty('overallScore');
      expect(res.body.data.completedEvaluation.overallScore).toBe(91); // (90+92+88+94)/4 = 91
      expect(res.body.data.completedEvaluation.verdict).toBe(HiringVerdict.STRONG_HIRE);
      expect(res.body.data.completedEvaluation.submittedBy).toBe('Alice Host');
    });
  });
});
