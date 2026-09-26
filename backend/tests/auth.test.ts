import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { UserRole } from '@interviewpilot/shared';

describe('Authentication & User Management API', () => {
  let mongoServer: MongoMemoryServer;
  const app = createApp();

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new candidate successfully', async () => {
      const payload = {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: 'Password123',
        role: UserRole.CANDIDATE
      };

      const res = await request(app).post('/api/v1/auth/register').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('alex@example.com');
      expect(res.body.data.user.role).toBe('candidate');
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject registration if email is already registered', async () => {
      const payload = {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: 'Password123'
      };

      await request(app).post('/api/v1/auth/register').send(payload);
      const res = await request(app).post('/api/v1/auth/register').send(payload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should reject registration with weak password', async () => {
      const payload = {
        name: 'Alex Johnson',
        email: 'alex@example.com',
        password: 'weak'
      };

      const res = await request(app).post('/api/v1/auth/register').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: UserRole.CANDIDATE
      });
    });

    it('should authenticate user with valid credentials', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'john@example.com',
        password: 'Password123'
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('john@example.com');
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'john@example.com',
        password: 'WrongPassword99'
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should issue new token pair using valid refresh token', async () => {
      const reg = await request(app).post('/api/v1/auth/register').send({
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        password: 'Password123'
      });

      const refreshToken = reg.body.data.tokens.refreshToken;

      const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).not.toBe(refreshToken); // rotated
    });

    it('should reject invalid or expired refresh token', async () => {
      const res = await request(app).post('/api/v1/auth/refresh').send({ refreshToken: 'invalid.token.here' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Protected User Endpoints & RBAC', () => {
    let candidateToken: string;
    let adminToken: string;

    beforeEach(async () => {
      const candidateRes = await request(app).post('/api/v1/auth/register').send({
        name: 'Candidate User',
        email: 'candidate@example.com',
        password: 'Password123',
        role: UserRole.CANDIDATE
      });
      candidateToken = candidateRes.body.data.tokens.accessToken;

      const adminRes = await request(app).post('/api/v1/auth/register').send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Password123',
        role: UserRole.ADMIN
      });
      adminToken = adminRes.body.data.tokens.accessToken;
    });

    it('GET /api/v1/auth/me should return current authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('candidate@example.com');
    });

    it('GET /api/v1/auth/me without token should return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('PATCH /api/v1/users/profile should update user profile', async () => {
      const res = await request(app)
        .patch('/api/v1/users/profile')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          headline: 'Senior Full Stack Engineer',
          bio: 'Building distributed systems',
          skills: ['TypeScript', 'React', 'Node.js', 'Redis'],
          targetRoles: ['Staff Engineer', 'Tech Lead']
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.profile.headline).toBe('Senior Full Stack Engineer');
      expect(res.body.data.user.profile.skills).toContain('TypeScript');
    });

    it('POST /api/v1/users/change-password should update password successfully', async () => {
      const res = await request(app)
        .post('/api/v1/users/change-password')
        .set('Authorization', `Bearer ${candidateToken}`)
        .send({
          currentPassword: 'Password123',
          newPassword: 'NewSecurePassword456'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe('Password changed successfully');

      // Old password should fail
      const loginOld = await request(app).post('/api/v1/auth/login').send({
        email: 'candidate@example.com',
        password: 'Password123'
      });
      expect(loginOld.status).toBe(401);

      // New password should succeed
      const loginNew = await request(app).post('/api/v1/auth/login').send({
        email: 'candidate@example.com',
        password: 'NewSecurePassword456'
      });
      expect(loginNew.status).toBe(200);
    });

    it('GET /api/v1/users/all should be forbidden for candidate (RBAC)', async () => {
      const res = await request(app)
        .get('/api/v1/users/all')
        .set('Authorization', `Bearer ${candidateToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('GET /api/v1/users/all should succeed for admin (RBAC)', async () => {
      const res = await request(app)
        .get('/api/v1/users/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.total).toBeGreaterThanOrEqual(2);
    });
  });
});
