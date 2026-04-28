const request = require('supertest');
const app = require('../../../app');
const authService = require('../../../modules/auth/auth.service');
const jwt = require('jsonwebtoken');

// Mock authService methods
jest.mock('../../../modules/auth/auth.service');
jest.mock('jsonwebtoken');

describe('Auth Integration Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new developer and return tokens', async () => {
      const reqBody = {
        email: 'test@example.com',
        password: 'password123',
        role: 'developer',
        name: 'Test User'
      };

      const mockResult = {
        user: { _id: '123', email: reqBody.email, role: 'developer' },
        accessToken: 'mockAccess',
        refreshToken: 'mockRefresh',
        expiresIn: '15m'
      };

      authService.register.mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(reqBody);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('accessToken', 'mockAccess');
      expect(res.body.data).toHaveProperty('refreshToken', 'mockRefresh');
      expect(authService.register).toHaveBeenCalledWith(
        reqBody.email,
        reqBody.password,
        reqBody.role,
        reqBody.name,
        expect.any(String) // IP
      );
    });

    it('should return 400 for invalid data', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'invalid', password: '123' }); // missing role, name, invalid email

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login and return tokens', async () => {
      const reqBody = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockResult = {
        user: { _id: '123', email: reqBody.email, role: 'developer' },
        accessToken: 'mockAccess',
        refreshToken: 'mockRefresh',
        expiresIn: '15m'
      };

      authService.login.mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(reqBody);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
    });

    it('should return 401 for invalid credentials', async () => {
      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'wrong', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh token and return new tokens', async () => {
      const reqBody = { refreshToken: 'validRefresh' };
      const mockResult = {
        accessToken: 'newAccess',
        refreshToken: 'newRefresh'
      };
      authService.refreshToken.mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send(reqBody);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken', 'newAccess');
    });

    it('should return 401 for invalid refresh token', async () => {
      authService.refreshToken.mockRejectedValue(new Error('Invalid or expired refresh token'));

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'bad' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      // Set a fake Authorization header
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', 'Bearer dummyToken')
        .send({ refreshToken: 'refresh123' });

      expect(res.status).toBe(200);
      expect(authService.logout).toHaveBeenCalledWith('dummyToken', 'refresh123');
    });
  });
});