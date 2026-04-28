const jwt = require('jsonwebtoken');
const authService = require('../../../modules/auth/auth.service');
const userRepository = require('../../../modules/users/user.repository');
const developerRepository = require('../../../developers/developer.repository');
const startupRepository = require('../../../startups/startup.repository');
const { addEmailJob } = require('../../../queues/notification.queue');
const refreshTokenService = require('../../../auth/refresh-token.service');
const logger = require('../../../utils/logger');

// Mock all dependencies
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'signed_token'),
  verify: jest.fn(),
  decode: jest.fn(),
}));

jest.mock('../../../modules/users/user.repository');
jest.mock('../../../developers/developer.repository');
jest.mock('../../../startups/startup.repository');
jest.mock('../../../queues/notification.queue');

const mockRedis = {
  setex: jest.fn().mockResolvedValue('OK'),
  get: jest.fn(),
  del: jest.fn(),
};
jest.mock('../../../config/redis', () => mockRedis);

jest.mock('../../../auth/refresh-token.service');
jest.mock('../../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a developer user and return tokens', async () => {
      const email = 'dev@example.com';
      const password = 'password123';
      const role = 'developer';
      const name = 'John Doe';
      const ip = '127.0.0.1';

      const mockUser = { _id: 'user123', email, role, toObject: () => ({ _id: 'user123', email, role }) };
      userRepository.exists.mockResolvedValue(false);
      userRepository.create.mockResolvedValue(mockUser);
      developerRepository.create.mockResolvedValue({});

      const mockTokens = { accessToken: 'access123', refreshToken: 'refresh123', expiresIn: '15m' };
      refreshTokenService.generateTokenPair.mockResolvedValue(mockTokens);
      addEmailJob.mockResolvedValue({});

      const result = await authService.register(email, password, role, name, ip);

      expect(userRepository.exists).toHaveBeenCalledWith(email);
      expect(userRepository.create).toHaveBeenCalledWith({ email, password, role });
      expect(developerRepository.create).toHaveBeenCalledWith({
        userId: 'user123',
        fullName: name,
        title: 'New Developer'
      });
      expect(refreshTokenService.generateTokenPair).toHaveBeenCalledWith('user123', role, ip);
      expect(addEmailJob).toHaveBeenCalledWith('WELCOME_EMAIL', { email, name });
      expect(result).toHaveProperty('accessToken', 'access123');
      expect(result).toHaveProperty('refreshToken', 'refresh123');
      expect(logger.info).toHaveBeenCalledWith(`User registered: user123, role: developer`);
    });

    it('should throw error if email already exists', async () => {
      userRepository.exists.mockResolvedValue({});
      await expect(authService.register('test@test.com', 'pass', 'developer', 'Test', null))
        .rejects.toThrow('Email already registered');
      expect(logger.warn).toHaveBeenCalledWith(`Registration attempt with existing email: test@test.com`);
    });

    it('should successfully register a startup user', async () => {
      const email = 'startup@example.com';
      const password = 'pass123';
      const role = 'startup';
      const name = 'Acme Corp';

      const mockUser = { _id: 'startupUser', email, role, toObject: () => ({ _id: 'startupUser', email, role }) };
      userRepository.exists.mockResolvedValue(false);
      userRepository.create.mockResolvedValue(mockUser);
      startupRepository.create.mockResolvedValue({});
      refreshTokenService.generateTokenPair.mockResolvedValue({ accessToken: 'a', refreshToken: 'r', expiresIn: '15m' });
      addEmailJob.mockResolvedValue({});

      await authService.register(email, password, role, name, null);

      expect(startupRepository.create).toHaveBeenCalledWith({
        userId: 'startupUser',
        companyName: name
      });
      expect(logger.info).toHaveBeenCalledWith(`User registered: startupUser, role: startup`);
    });
  });

  describe('login', () => {
    it('should successfully login and return tokens', async () => {
      const email = 'dev@example.com';
      const password = 'password123';
      const ip = '127.0.0.1';

      const mockUser = {
        _id: 'user456',
        email,
        role: 'developer',
        comparePassword: jest.fn().mockResolvedValue(true),
        toObject: () => ({ _id: 'user456', email, role: 'developer' })
      };
      userRepository.findByEmail.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue({});

      const mockTokens = { accessToken: 'access456', refreshToken: 'refresh456', expiresIn: '15m' };
      refreshTokenService.generateTokenPair.mockResolvedValue(mockTokens);

      const result = await authService.login(email, password, ip);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUser.comparePassword).toHaveBeenCalledWith(password);
      expect(userRepository.update).toHaveBeenCalledWith('user456', { lastLogin: Date.now() });
      expect(refreshTokenService.generateTokenPair).toHaveBeenCalledWith('user456', 'developer', ip);
      expect(result).toHaveProperty('accessToken', 'access456');
      expect(logger.info).toHaveBeenCalledWith(`User logged in: user456 from IP ${ip}`);
    });

    it('should throw error for invalid credentials', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      await expect(authService.login('wrong@example.com', 'wrongpass', null))
        .rejects.toThrow('Invalid credentials');
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Failed login attempt'));
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token successfully', async () => {
      const refreshToken = 'validrefresh123';
      const ip = '127.0.0.1';
      const userId = 'user789';

      const storedToken = {
        userId,
        familyId: 'family1',
        user: { role: 'developer' }
      };
      refreshTokenService.refreshAccessToken.mockResolvedValue({
        accessToken: 'newAccess',
        refreshToken: 'newRefresh',
        expiresIn: '15m'
      });

      const result = await authService.refreshToken(refreshToken, ip);

      expect(refreshTokenService.refreshAccessToken).toHaveBeenCalledWith(refreshToken, ip);
      expect(result).toHaveProperty('accessToken', 'newAccess');
      expect(logger.info).toHaveBeenCalledWith('Access token refreshed for user: unknown');
    });

    it('should throw error for invalid refresh token', async () => {
      refreshTokenService.refreshAccessToken.mockRejectedValue(new Error('Invalid token'));
      await expect(authService.refreshToken('invalid', null)).rejects.toThrow('Failed to refresh token: Invalid token');
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('Refresh token failed'));
    });
  });

  describe('logout', () => {
    it('should blacklist access token and revoke refresh token', async () => {
      const accessToken = 'oldAccess';
      const refreshToken = 'oldRefresh';
      const decoded = { exp: Math.floor(Date.now() / 1000) + 300 };

      jwt.decode.mockReturnValue(decoded);
      const mockRedis = require('../../../config/redis');

      await authService.logout(accessToken, refreshToken);

      expect(jwt.decode).toHaveBeenCalledWith(accessToken);
      expect(mockRedis.setex).toHaveBeenCalledWith(`blacklist:${accessToken}`, 300, 'true');
      expect(refreshTokenService.revokeRefreshToken).toHaveBeenCalledWith(refreshToken);
    });
  });
});