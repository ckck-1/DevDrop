const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../users/user.repository');
const developerRepository = require('../developers/developer.repository');
const startupRepository = require('../startups/startup.repository');
const { addEmailJob } = require('../../queues/notification.queue');
const redis = require('../../config/redis');
const refreshTokenService = require('./refresh-token.service');
const logger = require('../../utils/logger');

class AuthService {
  async register(email, password, role, fullNameOrCompanyName, ip = null) {
    const existingUser = await userRepository.exists(email);
    if (existingUser) {
      logger.warn(`Registration attempt with existing email: ${email}`);
      throw new Error('Email already registered');
    }

    const user = await userRepository.create({ email, password, role });
    logger.info(`User registered: ${user._id}, role: ${role}`);

    if (role === 'developer') {
      await developerRepository.create({
        userId: user._id,
        fullName: fullNameOrCompanyName,
        title: 'New Developer'
      });
    } else if (role === 'startup') {
      await startupRepository.create({
        userId: user._id,
        companyName: fullNameOrCompanyName
      });
    }

    await addEmailJob('WELCOME_EMAIL', {
      email: user.email,
      name: fullNameOrCompanyName
    });

    const tokens = await refreshTokenService.generateTokenPair(user._id, role, ip);
    logger.info(`Access and refresh tokens generated for user ${user._id} from IP ${ip}`);

    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;

    return { user: safeUser, ...tokens };
  }

  async login(email, password, ip = null) {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      logger.warn(`Failed login attempt for email: ${email} from IP ${ip}`);
      throw new Error('Invalid credentials');
    }

    const tokens = await refreshTokenService.generateTokenPair(user._id, user.role, ip);
    logger.info(`User logged in: ${user._id} from IP ${ip}`);

    userRepository.update(user._id, { lastLogin: Date.now() });

    const safeUser = user.toObject ? user.toObject() : { ...user };
    delete safeUser.password;

    return { user: safeUser, ...tokens };
  }

  async sendVerificationEmail(userId, email) {
    const token = crypto.randomBytes(32).toString('hex');
    await redis.setex(`verify:${token}`, 86400, userId.toString());

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    await addEmailJob('VERIFICATION_EMAIL', { email, verificationUrl });

    return token;
  }

  async verifyEmail(token) {
    const userId = await redis.get(`verify:${token}`);
    if (!userId) {
      throw new Error('Invalid or expired verification token');
    }

    await userRepository.update(userId, { isVerified: true });
    await redis.del(`verify:${token}`);

    return true;
  }

  async refreshToken(refreshToken, ip = null) {
    try {
      logger.info(`Refresh token request from IP: ${ip}`);
      const tokens = await refreshTokenService.refreshAccessToken(refreshToken, ip);
      return tokens;
    } catch (error) {
      logger.warn(`Refresh token failed: ${error.message} from IP ${ip}`);
      throw new Error('Failed to refresh token: ' + error.message);
    }
  }

  async logout(accessToken, refreshToken) {
    const decoded = jwt.decode(accessToken);
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await redis.setex(`blacklist:${accessToken}`, ttl, 'true');
    }

    if (refreshToken) {
      await refreshTokenService.revokeRefreshToken(refreshToken);
      logger.info('User logged out: refresh token revoked');
    }
  }

  async logoutAll(userId) {
    await refreshTokenService.revokeAllForUser(userId);
    logger.info(`All sessions revoked for user: ${userId}`);
  }
}

module.exports = new AuthService();
