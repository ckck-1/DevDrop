const RefreshToken = require('./refresh-token.model');
const crypto = require('crypto');

class RefreshTokenRepository {
  // Generate a random refresh token string
  generateToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  // Hash the token for storage
  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Create a new refresh token document
  async create(token, userId, familyId, expiresInDays = 7, ip = null) {
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    const refreshToken = await RefreshToken.create({
      tokenHash,
      userId,
      familyId,
      expiresAt,
      createdByIp: ip,
    });

    return refreshToken;
  }

  // Find by token hash (for verification)
  async findByToken(token) {
    const tokenHash = this.hashToken(token);
    return await RefreshToken.findOne({ tokenHash, revoked: false, expiresAt: { $gt: new Date() } });
  }

  // Revoke a specific token (by token string)
  async revokeToken(token) {
    const tokenHash = this.hashToken(token);
    return await RefreshToken.findOneAndUpdate(
      { tokenHash },
      { $set: { revoked: true } },
      { new: true }
    );
  }

  // Revoke entire family (rotation)
  async revokeFamily(userId, familyId, excludeTokenHash = null) {
    const query = { userId, familyId, revoked: false };
    if (excludeTokenHash) {
      query.tokenHash = { $ne: excludeTokenHash };
    }
    return await RefreshToken.updateMany(query, { $set: { revoked: true } });
  }

  // Revoke all tokens for a user (logout all devices)
  async revokeAllForUser(userId) {
    return await RefreshToken.updateMany(
      { userId, revoked: false },
      { $set: { revoked: true } }
    );
  }

  // Clean up expired tokens (can be called periodically)
  async cleanup() {
    return await RefreshToken.deleteMany({ expiresAt: { $lt: new Date() } });
  }
}

module.exports = new RefreshTokenRepository();