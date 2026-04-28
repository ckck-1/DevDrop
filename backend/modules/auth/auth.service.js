const jwt = require('jsonwebtoken');
const userRepository = require('../users/user.repository');
const developerRepository = require('../developers/developer.repository');
const startupRepository = require('../startups/startup.repository');
const { redis } = require('../../config/redis');

class AuthService {
  async register(email, password, role, fullNameOrCompanyName) {

    // 1. Check if user exists
    const existingUser = await userRepository.exists(email);
    if (existingUser) throw new Error('Email already registered');

    // 2. Create Base User
    const user = await userRepository.create({ email, password, role });
    const { addEmailJob } = require('../../queues/notification.queue');

// Inside register() function:
await addEmailJob('WELCOME_EMAIL', { 
  email: user.email, 
  name: fullNameOrCompanyName 
});

    // 3. Create Role-Specific Profile
    if (role === 'developer') {
      await developerRepository.create({ 
        userId: user._id, 
        fullName: fullNameOrCompanyName,
        title: 'New Developer' // Default placeholder
      });
    } else if (role === 'startup') {
      await startupRepository.create({ 
        userId: user._id, 
        companyName: fullNameOrCompanyName 
      });
    }

    const token = this.generateToken(user._id, user.role);
    return { user, token };
    // const { addEmailJob } = require('../../queues/notification.queue');


await addEmailJob('WELCOME_EMAIL', { 
  email: user.email, 
  name: fullNameOrCompanyName 
});
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user._id, user.role);
    
    // Update last login (Async, don't wait for it)
    userRepository.update(user._id, { lastLogin: Date.now() });

    return { user, token };
  }

  generateToken(userId, role) {
    return jwt.sign(
      { id: userId, role }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  async logout(token) {
    // Blacklist token in Redis until it expires
    const decoded = jwt.decode(token);
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    if (ttl > 0) {
      await redis.setex(`blacklist:${token}`, ttl, 'true');
    }
  }
 async sendVerificationEmail(userId, email) {
    // 1. Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // 2. Store in Redis with a 24-hour expiration
    // Key: verify:token, Value: userId
    await redis.setex(`verify:${token}`, 86400, userId.toString());

    // 3. Queue the email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    await addEmailJob('VERIFICATION_EMAIL', {
      email,
      verificationUrl
    });

    return token;
  }

  async verifyEmail(token) {
    // 1. Retrieve userId from Redis
    const userId = await redis.get(`verify:${token}`);
    if (!userId) {
      throw new Error('Invalid or expired verification token');
    }

    // 2. Update user status in DB
    await userRepository.update(userId, { isVerified: true });

    // 3. Delete token so it can't be reused
    await redis.del(`verify:${token}`);

    return true;
  } 
}

module.exports = new AuthService();