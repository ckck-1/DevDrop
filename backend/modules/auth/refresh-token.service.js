const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const refreshTokenRepository = require('./refresh-token.repository');
const userRepository = require('../users/user.repository');
const logger = require('../../utils/logger');

class RefreshTokenService {
  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET;
    this.refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
    this.accessTokenExpiry = process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m';
    this.refreshTokenExpiryDays = parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS) || 7;
  }

  /**
   * Generate both access and refresh tokens
   */
  async generateTokenPair(userId, role, ip = null) {
    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      { id: userId, role },
      this.accessTokenSecret,
      { expiresIn: this.accessTokenExpiry }
    );

    // Generate refresh token (long-lived)
    const rawRefreshToken = crypto.randomBytes(64).toString('hex');
    const familyId = crypto.randomBytes(16).toString('hex'); // For rotation tracking

    // Store hashed refresh token in DB
    await refreshTokenRepository.create(
      rawRefreshToken,
      userId,
      familyId,
      this.refreshTokenExpiryDays,
      ip
    );

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: this.accessTokenExpiry,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken, ip = null) {
    // 1. Verify refresh token exists and is valid
    const storedToken = await refreshTokenRepository.findByToken(refreshToken);
    if (!storedToken) {
      throw new Error('Invalid or expired refresh token');
    }

    const userId = storedToken.userId;
    const familyId = storedToken.familyId;

    // 2. Get user role
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 3. Revoke old token family (rotation)
    await refreshTokenRepository.revokeFamily(userId, familyId, refreshTokenRepository.hashToken(refreshToken));

    // 4. Generate new token pair
    const newTokens = await this.generateTokenPair(userId, user.role, ip);

    // 5. Return new tokens
    return newTokens;
  }

  /**
   * Logout: revoke specific refresh token
   */
  async revokeRefreshToken(refreshToken) {
    await refreshTokenRepository.revokeToken(refreshToken);
  }

  /**
   * Logout all devices: revoke all refresh tokens for user
   */
  async revokeAllForUser(userId) {
    await refreshTokenRepository.revokeAllForUser(userId);
    // Also clear JWT blacklist entries if needed
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token) {
    return jwt.verify(token, this.accessTokenSecret);
  }
}

module.exports = new RefreshTokenService();