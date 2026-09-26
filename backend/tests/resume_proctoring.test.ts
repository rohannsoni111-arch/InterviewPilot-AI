import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app';
import { InterviewType, DifficultyLevel, StrictnessMode, ProctoringEventType } from '@interviewpilot/shared';

let mongoServer: MongoMemoryServer;
const app = createApp();

let candidateToken: string;
let otherCandidateToken: string;
let sessionId: string;
let resumeId: string;

const SAMPLE_RESUME_TEXT = `
Alex Rivers
Staff Systems Engineer
Email: alex.rivers@example.com | Phone: (555) 987-6543

Summary:
Proven track record architecting mission-critical distributed databases, raft consensus engines, and cloud-native systems.

Skills:
- Languages: TypeScript, Go, Python, C++, SQL
- Frameworks: React, Node.js, FastAPI, Next.js
- Tools: Docker, Kubernetes, AWS, Redis, Kafka, Git

Experience:
Principal Engineer | CloudScale Data (2021 - Present)
- Designed partitioned distributed key-value store handling 100k QPS.
- Reduced p99 latency from 45ms to 8ms with consistent hashing and LRU memory cache.

Education:
B.S. in Computer Engineering | MIT (2018)
`;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const candidateRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Alex Rivers',
    email: 'alex.rivers@example.com',
    password: 'Password123!'
  });
  candidateToken = candidateRes.body.data.tokens.accessToken;

  const otherRes = await request(app).post('/api/v1/auth/register').send({
    name: 'Other User',
    email: 'otheruser@example.com',
    password: 'Password123!'
  });
  otherCandidateToken = otherRes.body.data.tokens.accessToken;

  // Create an interview session
  const sessionRes = await request(app)
    .post('/api/v1/interviews')
    .set('Authorization', `Bearer ${candidateToken}`)
    .send({
      type: InterviewType.SYSTEM_DESIGN,
      difficulty: DifficultyLevel.SENIOR,
      targetRole: 'Staff Systems Engineer',
      durationMinutes: 45,
      strictness: StrictnessMode.REALISTIC,
      focusTopics: ['Distributed Systems', 'Raft Consensus']
    });

  sessionId = sessionRes.body.data.id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Resume & JD Matching Integration Tests', () => {
  it('creates and parses a candidate resume successfully', async () => {
    const res = await request(app)
      .post('/api/v1/resumes')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        title: 'Staff Systems Resume 2026',
        fileName: 'alex_rivers_resume.txt',
        fileType: 'txt',
        rawText: SAMPLE_RESUME_TEXT
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Staff Systems Resume 2026');
    expect(res.body.data.parsedData.candidateName).toBe('Alex Rivers');
    expect(res.body.data.parsedData.skills.technical).toContain('TypeScript');
    expect(res.body.data.parsedData.skills.tools).toContain('Docker');

    resumeId = res.body.data.id;
  });

  it('lists user resumes with summary metadata', async () => {
    const res = await request(app)
      .get('/api/v1/resumes')
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(resumeId);
    expect(res.body.data[0].skillsCount).toBeGreaterThan(0);
  });

  it('retrieves single resume by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/resumes/${resumeId}`)
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(resumeId);
    expect(res.body.data.rawText).toContain('Staff Systems Engineer');
  });

  it('blocks unauthorized access to another candidate resume', async () => {
    const res = await request(app)
      .get(`/api/v1/resumes/${resumeId}`)
      .set('Authorization', `Bearer ${otherCandidateToken}`);

    expect(res.status).toBe(403);
  });

  it('performs semantic match between resume and job description', async () => {
    const res = await request(app)
      .post('/api/v1/resumes/match')
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        resumeId,
        jobDescription: 'Seeking Staff Distributed Systems Engineer proficient with Go, Redis, Docker, and Kubernetes.',
        targetRole: 'Staff Systems Engineer'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.matchScore).toBeGreaterThanOrEqual(60);
    expect(res.body.data.matchedSkills.length).toBeGreaterThan(0);
    expect(res.body.data.recommendedFocusTopics.length).toBeGreaterThan(0);
  });
});

describe('Anti-Cheat & Proctoring Telemetry Integration Tests', () => {
  it('records proctoring violation events during active interview', async () => {
    const res = await request(app)
      .post(`/api/v1/interviews/${sessionId}/proctoring/events`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        eventType: ProctoringEventType.TAB_BLUR,
        severity: 'medium',
        metadata: { blurDurationMs: 3200 }
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.eventType).toBe('tab_blur');
    expect(res.body.data.sessionId).toBe(sessionId);
  });

  it('retrieves proctoring telemetry report and calculates integrity score', async () => {
    // Add paste event
    await request(app)
      .post(`/api/v1/interviews/${sessionId}/proctoring/events`)
      .set('Authorization', `Bearer ${candidateToken}`)
      .send({
        eventType: ProctoringEventType.CLIPBOARD_PASTE,
        severity: 'low',
        metadata: { charCount: 35 }
      });

    const res = await request(app)
      .get(`/api/v1/interviews/${sessionId}/proctoring/report`)
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.integrityScore).toBeGreaterThan(80);
    expect(res.body.data.tabSwitchCount).toBe(1);
    expect(res.body.data.pasteCount).toBe(1);
    expect(res.body.data.flagLevel).toBe('clean');
  });

  it('includes proctoring report in post-interview evaluation report', async () => {
    const res = await request(app)
      .post(`/api/v1/interviews/${sessionId}/evaluate`)
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.report.proctoringReport).toBeDefined();
    expect(res.body.data.report.proctoringReport.integrityScore).toBeGreaterThanOrEqual(20);
  });

  it('deletes candidate resume successfully', async () => {
    const res = await request(app)
      .delete(`/api/v1/resumes/${resumeId}`)
      .set('Authorization', `Bearer ${candidateToken}`);

    expect(res.status).toBe(200);

    const checkRes = await request(app)
      .get(`/api/v1/resumes/${resumeId}`)
      .set('Authorization', `Bearer ${candidateToken}`);
    expect(checkRes.status).toBe(404);
  });
});
