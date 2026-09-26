import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { SupportedLanguage } from '@interviewpilot/shared';

let mongoServer: MongoMemoryServer;
const app = createApp();

let candidateToken: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const candidateRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Code Tester',
    email: 'codetester@example.com',
    password: 'Password123!'
  });
  candidateToken = candidateRes.body.data.tokens.accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Code Execution & Review API', () => {
  it('rejects unauthenticated requests to run code', async () => {
    const res = await request(app).post('/api/v1/code/run').send({
      code: 'print("hello")',
      language: SupportedLanguage.PYTHON
    });
    expect(res.status).toBe(401);
  });

  it('validates required code and language fields', async () => {
    const res = await request(app)
      .post('/api/v1/code/run')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        code: '',
        language: 'unsupported_lang'
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_INPUT');
  });

  it('runs python code successfully', async () => {
    const res = await request(app)
      .post('/api/v1/code/run')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        code: 'def add(a, b): return a + b\nprint(add(4, 5))',
        language: SupportedLanguage.PYTHON
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.executionTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('evaluates test cases in code runner', async () => {
    const res = await request(app)
      .post('/api/v1/code/run')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        code: 'import sys; print(sys.stdin.read().strip())',
        language: SupportedLanguage.PYTHON,
        testCases: [
          { id: '1', input: 'Hello World', expectedOutput: 'Hello World' }
        ]
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.testResults).toBeDefined();
  });

  it('performs automated code review with complexity insights', async () => {
    const res = await request(app)
      .post('/api/v1/code/review')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        code: 'def two_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target: return [i, j]',
        language: SupportedLanguage.PYTHON,
        problemContext: 'Two Sum Problem'
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.timeComplexity).toBeDefined();
    expect(res.body.data.verdict).toBeDefined();
    expect(res.body.data.keyInsights.length).toBeGreaterThan(0);
  });
});
